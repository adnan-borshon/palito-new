import {
  Inject,
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { Prisma } from "../generated/prisma/client.js";
import { DatabaseService } from "../platform/database.js";
import { APP_CONFIG, type AppConfig } from "../platform/config.js";
import type { AccountPrincipal } from "../identity/accounts.js";
import { dateOnly, parseMinorUnits } from "../platform/data-contracts.js";
import { OutboxWorkerService } from "../ops/outbox.worker.js";
import type {
  AmendmentDto,
  AnimalDto,
  AnimalEditDto,
  BookingDto,
  CompletionDto,
  DecisionDto,
  FarmDto,
  PageDto,
  UploadDto,
  VetProfileDto,
  VetsPageDto,
} from "./dto.js";
type Tx = Prisma.TransactionClient;
const active = ["REQUESTED", "ACCEPTED", "IN_PROGRESS"] as const;
const json = <T>(value: T): T =>
  JSON.parse(
    JSON.stringify(value, (_key, item) =>
      typeof item === "bigint" ? item.toString() : item,
    ),
  );
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, canonical(v)]),
    );
  return value;
}
export function revision(value: string | undefined) {
  const match = /^(?:([1-9]\d*|0)|"([1-9]\d*|0)")$/.exec(value ?? "");
  const number = Number(match?.[1] ?? match?.[2]);
  if (!match || !Number.isSafeInteger(number)) throw new BadRequestException();
  return number;
}
function instant(value: string) {
  const date = new Date(value);
  if (!value.endsWith("Z") || !Number.isFinite(date.getTime()))
    throw new BadRequestException();
  return date;
}
function pageInput(query: PageDto) {
  let after: { createdAt: Date; id: string } | undefined;
  if (query.cursor) {
    try {
      const parsed = JSON.parse(
        Buffer.from(query.cursor, "base64url").toString(),
      );
      if (
        !Array.isArray(parsed) ||
        parsed.length !== 2 ||
        typeof parsed[0] !== "string" ||
        typeof parsed[1] !== "string" ||
        !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
          parsed[1],
        )
      )
        throw Error();
      after = { createdAt: instant(parsed[0]), id: parsed[1] };
    } catch {
      throw new BadRequestException();
    }
  }
  return {
    limit: query.limit ?? 25,
    where: after
      ? {
          OR: [
            { createdAt: { gt: after.createdAt } },
            { createdAt: after.createdAt, id: { gt: after.id } },
          ],
        }
      : {},
  };
}
function page<T extends { id: string; createdAt: Date }>(
  rows: T[],
  limit: number,
) {
  const more = rows.length > limit;
  const items = rows.slice(0, limit);
  const last = items.at(-1);
  return json({
    items,
    nextCursor:
      more && last
        ? Buffer.from(
            JSON.stringify([last.createdAt.toISOString(), last.id]),
          ).toString("base64url")
        : null,
  });
}
@Injectable()
export class CareService {
  constructor(
    private readonly db: DatabaseService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}
  private async command<T>(
    p: AccountPrincipal,
    key: string | undefined,
    operation: string,
    payload: unknown,
    run: (tx: Tx) => Promise<T>,
  ): Promise<T> {
    if (!key || !/^[A-Za-z0-9_-]{8,100}$/.test(key))
      throw new BadRequestException();
    const hash = createHash("sha256")
      .update(JSON.stringify(canonical(payload)))
      .digest("hex");
    try {
      return await this.db.prisma.$transaction(
        async (tx) => {
          // Serialize duplicate commands across API instances, including first insertion.
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${p.userId + ":" + key},0))`;
          const current = await tx.user.findUnique({
            where: { id: p.userId },
            select: { status: true },
          });
          if (current?.status !== "ACTIVE") throw new ForbiddenException();
          const previous = await tx.careCommand.findUnique({
            where: { actorId_key: { actorId: p.userId, key } },
          });
          if (previous) {
            await this.replayAuthority(
              tx,
              p,
              operation,
              payload,
              previous.result,
            );
            if (
              previous.operation !== operation ||
              previous.payloadHash !== hash
            )
              throw new ConflictException();
            return previous.result as unknown as T;
          }
          const result = json(await run(tx));
          await tx.careCommand.create({
            data: {
              actorId: p.userId,
              key,
              operation,
              payloadHash: hash,
              result: result as Prisma.InputJsonValue,
            },
          });
          return result;
        },
        { maxWait: 5000, timeout: 10000 },
      );
    } catch (error) {
      const e = error as { code?: string; meta?: { code?: string } };
      if (["P2002", "P2034"].includes(e.code ?? "") || e.meta?.code === "23P01")
        throw new ConflictException();
      throw error;
    }
  }
  private async replayAuthority(
    tx: Tx,
    p: AccountPrincipal,
    operation: string,
    payload: unknown,
    result: unknown,
  ) {
    const [kind, id] = operation.split(":");
    const d = payload as { animalId?: string; farmId?: string };
    if (kind === "farm.create") return;
    if (kind === "vet.availability" || kind === "vet.profile") {
      await this.vet(tx, p);
      return;
    }
    if (kind === "animal.create") {
      await this.patient(tx, p, (result as { id: string }).id, true);
      if (
        !(await tx.farm.findFirst({
          where: { id: d.farmId, ownerId: p.userId },
        }))
      )
        throw new NotFoundException();
      return;
    }
    if (kind === "appointment.book") {
      await this.patient(tx, p, d.animalId!, true);
      return;
    }
    if (kind === "file.upload") {
      await this.fileAccess(tx, p, (result as { id: string }).id);
      return;
    }
    if (kind === "farm.edit") {
      if (!(await tx.farm.findFirst({ where: { id, ownerId: p.userId } })))
        throw new NotFoundException();
      return;
    }
    if (kind?.startsWith("animal.")) {
      await this.patient(tx, p, id!, true);
      return;
    }
    if (kind?.startsWith("appointment.") || kind?.startsWith("consultation.")) {
      if (
        [
          "appointment.decision",
          "consultation.start",
          "consultation.complete",
        ].includes(kind)
      )
        await this.vet(tx, p);
      const row = await this.appointment(
        tx,
        p,
        id!,
        ["appointment.reschedule", "appointment.withdraw"].includes(kind),
      );
      if (
        [
          "appointment.decision",
          "consultation.start",
          "consultation.complete",
        ].includes(kind) &&
        row.vetId !== p.userId
      )
        throw new NotFoundException();
      return;
    }
    if (kind === "record.amend") {
      await this.vet(tx, p);
      const row = await tx.healthRecord.findUnique({ where: { id } });
      if (!row || row.vetId !== p.userId) throw new NotFoundException();
      await this.patient(tx, p, row.animalId);
      return;
    }
    if (kind === "file.complete") {
      await this.fileAccess(tx, p, id!);
      return;
    }
    if (kind === "reminder.edit") {
      if (
        !(await tx.careReminder.findFirst({
          where: { id, ownerId: p.userId, animal: { ownerId: p.userId } },
        }))
      )
        throw new NotFoundException();
      return;
    }
    throw new ForbiddenException();
  }
  private async lock(tx: Tx, id: string) {
    const rows = await tx.$queryRaw<
      { id: string }[]
    >`SELECT id FROM palito.animals WHERE id=${id}::uuid FOR UPDATE`;
    if (!rows.length) throw new NotFoundException();
  }
  private async vet(tx: Tx, p: AccountPrincipal) {
    if (!p.memberships.some((m) => m.role === "VET"))
      throw new ForbiddenException();
    const valid = await tx.vetCredential.findFirst({
      where: {
        userId: p.userId,
        status: "VERIFIED",
        user: {
          status: "ACTIVE",
          memberships: {
            some: {
              role: "VET",
              status: "ACTIVE",
              organization: { status: "ACTIVE", kind: "CLINIC" },
            },
          },
        },
      },
    });
    if (!valid) throw new ForbiddenException();
  }
  private async patient(
    tx: Tx,
    p: AccountPrincipal,
    id: string,
    ownerOnly = false,
  ) {
    const animal = await tx.animal.findUnique({ where: { id } });
    if (!animal) throw new NotFoundException();
    if (animal.ownerId === p.userId) return animal;
    if (!ownerOnly && p.memberships.some((m) => m.role === "VET")) {
      await this.vet(tx, p);
      const grant = await tx.careGrant.findFirst({
        where: {
          farmerId: animal.ownerId,
          revokedAt: null,
          expiresAt: { gt: new Date() },
          appointment: {
            animalId: id,
            farmerId: animal.ownerId,
            vetId: p.userId,
            status: { notIn: ["CANCELLED", "REJECTED"] },
          },
        },
      });
      if (grant) return animal;
    }
    throw new NotFoundException();
  }
  private async event(
    tx: Tx,
    p: AccountPrincipal,
    animalId: string,
    kind: string,
    payload: Prisma.InputJsonValue = {},
  ) {
    await tx.careEvent.create({
      data: { actorId: p.userId, animalId, kind, payload },
    });
  }
  private async appointment(
    tx: Tx,
    p: AccountPrincipal,
    id: string,
    owner = false,
  ) {
    const row = await tx.appointment.findUnique({ where: { id } });
    if (!row) throw new NotFoundException();
    await this.patient(tx, p, row.animalId, owner);
    if (
      owner
        ? row.farmerId !== p.userId
        : row.farmerId !== p.userId && row.vetId !== p.userId
    )
      throw new NotFoundException();
    return row;
  }
  async farms(p: AccountPrincipal, q: PageDto) {
    const paging = pageInput(q);
    return page(
      await this.db.prisma.farm.findMany({
        where: { ownerId: p.userId, ...paging.where },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: paging.limit + 1,
      }),
      paging.limit,
    );
  }
  createFarm(p: AccountPrincipal, key: string | undefined, d: FarmDto) {
    if (Number(d.areaAcres) <= 0) throw new BadRequestException();
    return this.command(p, key, "farm.create", d, async (tx) => {
      const farm = await tx.farm.create({
        data: {
          ownerId: p.userId,
          name: d.name.trim(),
          district: d.district.trim(),
          address: d.address.trim(),
          areaAcres: d.areaAcres,
        },
      });
      return { id: farm.id, version: farm.version };
    });
  }
  editFarm(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    d: FarmDto,
  ) {
    if (Number(d.areaAcres) <= 0) throw new BadRequestException();
    return this.command(
      p,
      key,
      `farm.edit:${id}`,
      { version, d },
      async (tx) => {
        const row = await tx.farm.findFirst({
          where: { id, ownerId: p.userId },
        });
        if (!row) throw new NotFoundException();
        const updated = await tx.farm.updateMany({
          where: { id, ownerId: p.userId, version },
          data: {
            name: d.name.trim(),
            district: d.district.trim(),
            address: d.address.trim(),
            areaAcres: d.areaAcres,
            version: { increment: 1 },
          },
        });
        if (updated.count !== 1) throw new ConflictException();
        return { id, version: version + 1 };
      },
    );
  }
  async animals(p: AccountPrincipal, q: PageDto) {
    const paging = pageInput(q);
    return page(
      await this.db.prisma.animal.findMany({
        where: { ownerId: p.userId, ...paging.where },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: paging.limit + 1,
      }),
      paging.limit,
    );
  }
  createAnimal(p: AccountPrincipal, key: string | undefined, d: AnimalDto) {
    let birth: Date;
    let amount: bigint;
    try {
      birth = dateOnly(d.birthDate);
      amount = parseMinorUnits(d.estimateMinor);
    } catch {
      throw new BadRequestException();
    }
    if (
      d.birthDate > new Date().toISOString().slice(0, 10) ||
      Number(d.weightKg) <= 0
    )
      throw new BadRequestException();
    return this.command(p, key, "animal.create", d, async (tx) => {
      if (
        !(await tx.farm.findFirst({
          where: { id: d.farmId, ownerId: p.userId },
        }))
      )
        throw new NotFoundException();
      const animal = await tx.animal.create({
        data: {
          farmId: d.farmId,
          ownerId: p.userId,
          tag: (d.tag ?? `PAL-${randomUUID()}`).toUpperCase(),
          name: d.name.trim(),
          species: d.species,
          breed: d.breed.trim(),
          sex: d.sex,
          birthDate: birth,
          weightKg: d.weightKg,
          estimateMinor: amount,
        },
      });
      await tx.ownershipHistory.create({
        data: {
          animalId: animal.id,
          toOwnerId: p.userId,
          reason: "Owner registration",
        },
      });
      await this.event(tx, p, animal.id, "ANIMAL_REGISTERED");
      return { id: animal.id, version: animal.version };
    });
  }
  async passport(p: AccountPrincipal, id: string) {
    return this.db.prisma.$transaction(async (tx) => {
      const animal = await this.patient(tx, p, id);
      const farm = await tx.farm.findUniqueOrThrow({
        where: { id: animal.farmId },
        select: { name: true, district: true, address: true },
      });
      return json({ animal, farm });
    });
  }
  async records(p: AccountPrincipal, id: string, q: PageDto) {
    const paging = pageInput(q);
    return this.db.prisma.$transaction(async (tx) => {
      await this.patient(tx, p, id);
      return page(
        await tx.healthRecord.findMany({
          where: { animalId: id, ...paging.where },
          select: {
            id: true,
            source: true,
            kind: true,
            note: true,
            vetId: true,
            signedAt: true,
            amendsId: true,
            createdAt: true,
            prescription: { select: { id: true, signedAt: true } },
          },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          take: paging.limit + 1,
        }),
        paging.limit,
      );
    });
  }
  async files(p: AccountPrincipal, id: string, q: PageDto) {
    const paging = pageInput(q);
    return this.db.prisma.$transaction(async (tx) => {
      const animal = await this.patient(tx, p, id);
      return page(
        await tx.privateFile.findMany({
          where: {
            animalId: id,
            ownerAtUploadId: animal.ownerId,
            status: "READY",
            ...paging.where,
          },
          select: { id: true, purpose: true, createdAt: true },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          take: paging.limit + 1,
        }),
        paging.limit,
      );
    });
  }

  editAnimal(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    d: AnimalEditDto,
  ) {
    let amount: bigint;
    try {
      amount = parseMinorUnits(d.estimateMinor);
    } catch {
      throw new BadRequestException();
    }
    if (Number(d.weightKg) <= 0) throw new BadRequestException();
    return this.command(
      p,
      key,
      `animal.edit:${id}`,
      { version, d },
      async (tx) => {
        await this.lock(tx, id);
        const animal = await this.patient(tx, p, id, true);
        if (animal.status !== "ACTIVE") throw new ConflictException();
        if (
          d.photoFileId &&
          !(await tx.privateFile.findFirst({
            where: {
              id: d.photoFileId,
              animalId: id,
              ownerAtUploadId: p.userId,
              status: "READY",
              purpose: "animal-photo",
            },
          }))
        )
          throw new NotFoundException();
        const changed = await tx.animal.updateMany({
          where: { id, version },
          data: {
            name: d.name.trim(),
            breed: d.breed.trim(),
            weightKg: d.weightKg,
            estimateMinor: amount,
            ...(d.photoFileId ? { photoFileId: d.photoFileId } : {}),
            version: { increment: 1 },
          },
        });
        if (!changed.count) throw new ConflictException();
        await this.event(tx, p, id, "ANIMAL_EDITED");
        return { id, version: version + 1 };
      },
    );
  }
  archive(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    reason: string,
  ) {
    return this.command(
      p,
      key,
      `animal.archive:${id}`,
      { version, reason },
      async (tx) => {
        await this.lock(tx, id);
        const animal = await this.patient(tx, p, id, true);
        if (
          animal.status !== "ACTIVE" ||
          (await tx.appointment.count({
            where: { animalId: id, status: { in: [...active] } },
          }))
        )
          throw new ConflictException();
        const changed = await tx.animal.updateMany({
          where: { id, version },
          data: { status: "ARCHIVED", version: { increment: 1 } },
        });
        if (!changed.count) throw new ConflictException();
        await this.event(tx, p, id, "ANIMAL_ARCHIVED", { reason });
        return { id, version: version + 1 };
      },
    );
  }
  observation(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    note: string,
  ) {
    return this.command(
      p,
      key,
      `animal.observation:${id}`,
      { note },
      async (tx) => {
        await this.lock(tx, id);
        const animal = await this.patient(tx, p, id, true);
        if (animal.status !== "ACTIVE") throw new ConflictException();
        const record = await tx.healthRecord.create({
          data: {
            animalId: id,
            authorId: p.userId,
            source: "FARMER",
            kind: "observation",
            note: note.trim(),
          },
        });
        await this.event(tx, p, id, "OBSERVATION_RECORDED", {
          recordId: record.id,
        });
        return { id: record.id };
      },
    );
  }
  async vets(q: VetsPageDto) {
    const paging = pageInput(q);
    const rows = await this.db.prisma.user.findMany({
      where: {
        status: "ACTIVE",
        ...(q.search
          ? {
              displayName: { contains: q.search, mode: "insensitive" as const },
            }
          : {}),
        vetCredential: {
          status: "VERIFIED",
          ...(q.district || q.species
            ? {
                profile: {
                  ...(q.district
                    ? {
                        district: {
                          equals: q.district,
                          mode: "insensitive" as const,
                        },
                      }
                    : {}),
                  ...(q.species ? { species: { has: q.species } } : {}),
                },
              }
            : {}),
        },
        memberships: {
          some: {
            role: "VET",
            status: "ACTIVE",
            organization: { kind: "CLINIC", status: "ACTIVE" },
          },
        },
        ...paging.where,
      },
      select: {
        id: true,
        displayName: true,
        createdAt: true,
        vetCredential: {
          select: {
            profile: { select: { district: true, species: true, bio: true } },
          },
        },
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: paging.limit + 1,
    });
    return page(
      rows.map(({ vetCredential, ...row }) => ({
        ...row,
        professional: vetCredential?.profile ?? null,
      })),
      paging.limit,
    );
  }
  async professional(id: string) {
    const row = await this.db.prisma.user.findFirst({
      where: {
        id,
        status: "ACTIVE",
        vetCredential: { status: "VERIFIED" },
        memberships: {
          some: {
            role: "VET",
            status: "ACTIVE",
            organization: { kind: "CLINIC", status: "ACTIVE" },
          },
        },
      },
      select: {
        id: true,
        displayName: true,
        vetCredential: {
          select: {
            profile: {
              select: {
                district: true,
                species: true,
                bio: true,
                version: true,
              },
            },
          },
        },
      },
    });
    if (!row) throw new NotFoundException();
    return {
      id: row.id,
      displayName: row.displayName,
      credentialStatus: "VERIFIED",
      professional: row.vetCredential?.profile ?? null,
    };
  }
  profile(
    p: AccountPrincipal,
    key: string | undefined,
    version: number,
    d: VetProfileDto,
  ) {
    return this.command(p, key, "vet.profile", { version, d }, async (tx) => {
      await this.vet(tx, p);
      await tx.$queryRaw`SELECT user_id FROM palito.vet_credentials WHERE user_id=${p.userId}::uuid FOR UPDATE`;
      const before = await tx.vetProfile.findUnique({
        where: { vetId: p.userId },
      });
      if ((before?.version ?? 0) !== version) throw new ConflictException();
      const data = {
        district: d.district.trim(),
        species: [...new Set(d.species)],
        bio: d.bio.trim(),
        version: version + 1,
      };
      await tx.vetProfile.upsert({
        where: { vetId: p.userId },
        create: { vetId: p.userId, ...data },
        update: data,
      });
      return { version: version + 1 };
    });
  }

  async slots(vetId: string) {
    const vet = await this.db.prisma.vetCredential.findFirst({
      where: {
        userId: vetId,
        status: "VERIFIED",
        user: {
          status: "ACTIVE",
          memberships: {
            some: {
              role: "VET",
              status: "ACTIVE",
              organization: { status: "ACTIVE" },
            },
          },
        },
      },
    });
    if (!vet) throw new NotFoundException();
    return json({
      items: await this.db.prisma.vetSlot.findMany({
        where: { vetId, status: "OPEN", startsAt: { gt: new Date() } },
        select: { id: true, startsAt: true, endsAt: true },
        orderBy: { startsAt: "asc" },
        take: 100,
      }),
    });
  }
  async schedule(p: AccountPrincipal) {
    return this.db.prisma.$transaction(async (tx) => {
      await this.vet(tx, p);
      return json({
        version:
          (await tx.vetSchedule.findUnique({ where: { vetId: p.userId } }))
            ?.version ?? 0,
        items: await tx.vetSlot.findMany({
          where: {
            vetId: p.userId,
            status: { in: ["OPEN", "BOOKED"] },
            endsAt: { gt: new Date() },
          },
          orderBy: { startsAt: "asc" },
          take: 100,
        }),
      });
    });
  }
  availability(
    p: AccountPrincipal,
    key: string | undefined,
    version: number,
    starts: string[],
  ) {
    const dates = starts.map(instant);
    const now = Date.now();
    if (
      dates.some(
        (d) =>
          d.getTime() <= now ||
          d.getTime() > now + 90 * 86400000 ||
          d.getUTCSeconds() !== 0 ||
          d.getUTCMilliseconds() !== 0,
      )
    )
      throw new BadRequestException();
    dates.sort((a, b) => a.getTime() - b.getTime());
    if (
      dates.some(
        (d, i) => i > 0 && d.getTime() - dates[i - 1]!.getTime() < 1800000,
      )
    )
      throw new ConflictException();
    return this.command(
      p,
      key,
      "vet.availability",
      { version, starts },
      async (tx) => {
        await this.vet(tx, p);
        await tx.$queryRaw`SELECT user_id FROM palito.vet_credentials WHERE user_id=${p.userId}::uuid FOR UPDATE`;
        const schedule = await tx.vetSchedule.upsert({
          where: { vetId: p.userId },
          create: { vetId: p.userId },
          update: {},
        });
        if (schedule.version !== version) throw new ConflictException();
        await tx.vetSlot.updateMany({
          where: { vetId: p.userId, status: "OPEN" },
          data: { status: "WITHDRAWN" },
        });
        for (const date of dates) {
          const end = new Date(date.getTime() + 1800000);
          const existing = await tx.vetSlot.findUnique({
            where: {
              vetId_startsAt_endsAt: {
                vetId: p.userId,
                startsAt: date,
                endsAt: end,
              },
            },
          });
          if (existing?.status === "BOOKED") continue;
          await tx.vetSlot.upsert({
            where: {
              vetId_startsAt_endsAt: {
                vetId: p.userId,
                startsAt: date,
                endsAt: end,
              },
            },
            create: { vetId: p.userId, startsAt: date, endsAt: end },
            update: { status: "OPEN" },
          });
        }
        await tx.vetSchedule.update({
          where: { vetId: p.userId },
          data: { version: { increment: 1 } },
        });
        return { version: version + 1 };
      },
    );
  }
  async book(p: AccountPrincipal, key: string | undefined, d: BookingDto) {
    if (!this.config.HEALTHCARE_NO_CHARGE_PILOT)
      throw new ServiceUnavailableException();
    return this.command(p, key, "appointment.book", d, async (tx) => {
      await this.lock(tx, d.animalId);
      const animal = await this.patient(tx, p, d.animalId, true);
      if (animal.status !== "ACTIVE") throw new ConflictException();
      await tx.$queryRaw`SELECT id FROM palito.vet_slots WHERE id=${d.slotId}::uuid FOR UPDATE`;
      const slot = await tx.vetSlot.findUnique({ where: { id: d.slotId } });
      if (
        !slot ||
        slot.status !== "OPEN" ||
        slot.startsAt.getTime() <= Date.now()
      )
        throw new ConflictException();
      if (
        !(await tx.vetCredential.findFirst({
          where: {
            userId: slot.vetId,
            status: "VERIFIED",
            user: {
              status: "ACTIVE",
              memberships: {
                some: {
                  role: "VET",
                  status: "ACTIVE",
                  organization: { status: "ACTIVE" },
                },
              },
            },
          },
        }))
      )
        throw new NotFoundException();
      const appointment = await tx.appointment.create({
        data: {
          animalId: animal.id,
          farmId: animal.farmId,
          farmerId: p.userId,
          vetId: slot.vetId,
          slotId: slot.id,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          mode: d.mode,
          reason: d.reason.trim(),
        },
      });
      await tx.vetSlot.update({
        where: { id: slot.id },
        data: { status: "BOOKED" },
      });
      await tx.careGrant.create({
        data: {
          appointmentId: appointment.id,
          farmerId: p.userId,
          consentVersion: d.consentVersion,
          expiresAt: new Date(slot.endsAt.getTime() + 72 * 3600000),
        },
      });
      await this.event(tx, p, animal.id, "APPOINTMENT_REQUESTED", {
        appointmentId: appointment.id,
      });
      await OutboxWorkerService.enqueue(tx, {
        topic: "APPOINTMENT_BOOKED",
        dedupeKey: `appointment-booked:${appointment.id}`,
        aggregateKind: "appointment",
        aggregateId: appointment.id,
        payload: {
          recipientId: slot.vetId,
          linkKind: "appointment",
          linkId: appointment.id,
        },
      });
      return {
        id: appointment.id,
        version: 1,
        payment: { mode: "NO_CHARGE_PILOT", amountMinor: "0", currency: "BDT" },
      };
    });
  }
  async appointments(p: AccountPrincipal, q: PageDto) {
    const paging = pageInput(q);
    let after = Prisma.empty;
    if (q.cursor) {
      const [time, id] = JSON.parse(
        Buffer.from(q.cursor, "base64url").toString(),
      );
      after = Prisma.sql`AND (a.created_at,a.id)>(${new Date(time)}::timestamptz,${id}::uuid)`;
    }
    const isVet = p.memberships.some((m) => m.role === "VET");
    const ids = await this.db.prisma.$queryRaw<
      { id: string }[]
    >(Prisma.sql`SELECT a.id FROM palito.appointments a JOIN palito.animals n ON n.id=a.animal_id
   WHERE ((a.farmer_id=${p.userId}::uuid AND n.owner_id=${p.userId}::uuid) OR
    (${isVet} AND a.vet_id=${p.userId}::uuid AND n.owner_id=a.farmer_id AND a.status NOT IN ('CANCELLED','REJECTED')
     AND EXISTS(SELECT 1 FROM palito.care_grants g WHERE g.appointment_id=a.id AND g.farmer_id=n.owner_id AND g.revoked_at IS NULL AND g.expires_at>CURRENT_TIMESTAMP)
     AND EXISTS(SELECT 1 FROM palito.vet_credentials v JOIN palito.users u ON u.id=v.user_id JOIN palito.memberships m ON m.user_id=u.id JOIN palito.organizations o ON o.id=m.organization_id WHERE v.user_id=a.vet_id AND v.status='VERIFIED' AND u.status='ACTIVE' AND m.role='VET' AND m.status='ACTIVE' AND o.status='ACTIVE')))
     ${after} ORDER BY a.created_at,a.id LIMIT ${paging.limit + 1}`);
    const rows = await this.db.prisma.appointment.findMany({
      where: { id: { in: ids.map((r) => r.id) } },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    return page(rows, paging.limit);
  }
  async appointmentDetail(p: AccountPrincipal, id: string) {
    return json(
      await this.db.prisma.$transaction((tx) => this.appointment(tx, p, id)),
    );
  }
  decision(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    d: DecisionDto,
  ) {
    return this.command(
      p,
      key,
      `appointment.decision:${id}`,
      { version, d },
      async (tx) => {
        const before = await tx.appointment.findUnique({ where: { id } });
        if (!before) throw new NotFoundException();
        await this.lock(tx, before.animalId);
        await this.vet(tx, p);
        const row = await this.appointment(tx, p, id);
        if (row.vetId !== p.userId) throw new NotFoundException();
        if (row.status !== "REQUESTED") throw new ConflictException();
        const changed = await tx.appointment.updateMany({
          where: { id, version, status: "REQUESTED" },
          data: {
            status: d.decision === "accept" ? "ACCEPTED" : "REJECTED",
            decisionNote: d.note.trim(),
            version: { increment: 1 },
          },
        });
        if (!changed.count) throw new ConflictException();
        if (d.decision === "reject") {
          if (row.slotId)
            await tx.vetSlot.update({
              where: { id: row.slotId },
              data: { status: "OPEN" },
            });
          await tx.careGrant.updateMany({
            where: { appointmentId: id, revokedAt: null },
            data: { revokedAt: new Date() },
          });
        }
        await this.event(tx, p, row.animalId, "APPOINTMENT_DECIDED", {
          appointmentId: id,
          decision: d.decision,
        });
        await OutboxWorkerService.enqueue(tx, {
          topic:
            d.decision === "accept"
              ? "APPOINTMENT_ACCEPTED"
              : "APPOINTMENT_REJECTED",
          dedupeKey: `appointment-decided:${id}:${version + 1}`,
          aggregateKind: "appointment",
          aggregateId: id,
          payload: {
            recipientId: row.farmerId,
            linkKind: "appointment",
            linkId: id,
          },
        });
        return { id, version: version + 1 };
      },
    );
  }
  cancel(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    reason: string,
  ) {
    return this.command(
      p,
      key,
      `appointment.cancel:${id}`,
      { version, reason },
      async (tx) => {
        const before = await tx.appointment.findUnique({ where: { id } });
        if (!before) throw new NotFoundException();
        await this.lock(tx, before.animalId);
        const row = await this.appointment(tx, p, id);
        if (row.vetId === p.userId) await this.vet(tx, p);
        if (!["REQUESTED", "ACCEPTED"].includes(row.status))
          throw new ConflictException();
        const changed = await tx.appointment.updateMany({
          where: { id, version, status: { in: ["REQUESTED", "ACCEPTED"] } },
          data: {
            status: "CANCELLED",
            decisionNote: reason.trim(),
            version: { increment: 1 },
          },
        });
        if (!changed.count) throw new ConflictException();
        if (row.slotId)
          await tx.vetSlot.update({
            where: { id: row.slotId },
            data: { status: "OPEN" },
          });
        await tx.careGrant.updateMany({
          where: { appointmentId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        await this.event(tx, p, row.animalId, "APPOINTMENT_CANCELLED", {
          appointmentId: id,
        });
        await OutboxWorkerService.enqueue(tx, {
          topic: "APPOINTMENT_CANCELLED",
          dedupeKey: `appointment-cancelled:${id}:${version + 1}`,
          aggregateKind: "appointment",
          aggregateId: id,
          payload: {
            recipientId: row.farmerId === p.userId ? row.vetId : row.farmerId,
            linkKind: "appointment",
            linkId: id,
          },
        });
        return { id, version: version + 1 };
      },
    );
  }
  reschedule(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    slotId: string,
  ) {
    return this.command(
      p,
      key,
      `appointment.reschedule:${id}`,
      { version, slotId },
      async (tx) => {
        const before = await tx.appointment.findUnique({ where: { id } });
        if (!before) throw new NotFoundException();
        await this.lock(tx, before.animalId);
        const row = await this.appointment(tx, p, id, true);
        if (!["REQUESTED", "ACCEPTED"].includes(row.status))
          throw new ConflictException();
        const lockIds = [row.slotId, slotId]
          .filter((v): v is string => !!v)
          .sort();
        for (const sid of lockIds)
          await tx.$queryRaw`SELECT id FROM palito.vet_slots WHERE id=${sid}::uuid FOR UPDATE`;
        const next = await tx.vetSlot.findUnique({ where: { id: slotId } });
        if (
          !next ||
          next.status !== "OPEN" ||
          next.vetId !== row.vetId ||
          next.startsAt.getTime() <= Date.now()
        )
          throw new ConflictException();
        const changed = await tx.appointment.updateMany({
          where: { id, version },
          data: {
            slotId,
            startsAt: next.startsAt,
            endsAt: next.endsAt,
            status: "REQUESTED",
            version: { increment: 1 },
          },
        });
        if (!changed.count) throw new ConflictException();
        if (row.slotId)
          await tx.vetSlot.update({
            where: { id: row.slotId },
            data: { status: "OPEN" },
          });
        await tx.vetSlot.update({
          where: { id: slotId },
          data: { status: "BOOKED" },
        });
        const grant = await tx.careGrant.findUniqueOrThrow({
          where: { appointmentId: id },
        });
        if (grant.revokedAt) throw new ConflictException();
        await tx.careGrant.update({
          where: { appointmentId: id },
          data: { expiresAt: new Date(next.endsAt.getTime() + 72 * 3600000) },
        });
        await this.event(tx, p, row.animalId, "APPOINTMENT_RESCHEDULED", {
          appointmentId: id,
        });
        return { id, version: version + 1 };
      },
    );
  }
  withdraw(p: AccountPrincipal, id: string, key: string | undefined) {
    return this.command(
      p,
      key,
      `appointment.withdraw:${id}`,
      {},
      async (tx) => {
        const before = await tx.appointment.findUnique({ where: { id } });
        if (!before) throw new NotFoundException();
        await this.lock(tx, before.animalId);
        const row = await this.appointment(tx, p, id, true);
        await tx.careGrant.updateMany({
          where: { appointmentId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        await this.event(tx, p, row.animalId, "CONSENT_WITHDRAWN", {
          appointmentId: id,
        });
        return { revoked: true };
      },
    );
  }
  start(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
  ) {
    return this.command(
      p,
      key,
      `consultation.start:${id}`,
      { version },
      async (tx) => {
        const before = await tx.appointment.findUnique({ where: { id } });
        if (!before) throw new NotFoundException();
        await this.lock(tx, before.animalId);
        await this.vet(tx, p);
        const row = await this.appointment(tx, p, id);
        if (row.vetId !== p.userId) throw new NotFoundException();
        if (
          row.status !== "ACCEPTED" ||
          Date.now() < row.startsAt.getTime() - 15 * 60000 ||
          Date.now() > row.endsAt.getTime() + 72 * 3600000
        )
          throw new ConflictException();
        const changed = await tx.appointment.updateMany({
          where: { id, version, status: "ACCEPTED" },
          data: { status: "IN_PROGRESS", version: { increment: 1 } },
        });
        if (!changed.count) throw new ConflictException();
        await this.event(tx, p, row.animalId, "CONSULTATION_STARTED", {
          appointmentId: id,
        });
        return { id, consultationId: id, version: version + 1 };
      },
    );
  }
  complete(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    d: CompletionDto,
  ) {
    return this.command(
      p,
      key,
      `consultation.complete:${id}`,
      { version, d },
      async (tx) => {
        const before = await tx.appointment.findUnique({ where: { id } });
        if (!before) throw new NotFoundException();
        await this.lock(tx, before.animalId);
        await this.vet(tx, p);
        const row = await this.appointment(tx, p, id);
        if (row.vetId !== p.userId) throw new NotFoundException();
        if (row.status !== "IN_PROGRESS") throw new ConflictException();
        const changed = await tx.appointment.updateMany({
          where: { id, version, status: "IN_PROGRESS" },
          data: { status: "COMPLETED", version: { increment: 1 } },
        });
        if (!changed.count) throw new ConflictException();
        const record = await tx.healthRecord.create({
          data: {
            animalId: row.animalId,
            authorId: p.userId,
            vetId: p.userId,
            appointmentId: id,
            source: "VET",
            kind: d.kind ?? "checkup",
            note: d.diagnosis.trim(),
            signedAt: new Date(),
          },
        });
        const prescription = await tx.prescription.create({
          data: {
            recordId: record.id,
            animalId: row.animalId,
            vetId: p.userId,
            advice: d.advice.trim(),
            items: {
              create: d.medicines.map((m) => ({
                medicineName: m.name.trim(),
                dose: m.dose.trim(),
                frequency: m.frequency.trim(),
                days: m.days,
              })),
            },
          },
        });
        await tx.prescription.update({
          where: { id: prescription.id },
          data: { signedAt: new Date() },
        });
        if (d.followUpAt) {
          const due = instant(d.followUpAt);
          if (
            due.getTime() <= Date.now() ||
            due.getTime() > Date.now() + 366 * 86400000
          )
            throw new BadRequestException();
          await tx.careReminder.create({
            data: {
              animalId: row.animalId,
              ownerId: row.farmerId,
              recordId: record.id,
              dueAt: due,
            },
          });
        }
        await this.event(tx, p, row.animalId, "CONSULTATION_COMPLETED", {
          appointmentId: id,
          recordId: record.id,
          prescriptionId: prescription.id,
        });
        await OutboxWorkerService.enqueue(tx, {
          topic: "CONSULTATION_COMPLETED",
          dedupeKey: `consultation-completed:${id}`,
          aggregateKind: "prescription",
          aggregateId: prescription.id,
          payload: {
            recipientId: row.farmerId,
            linkKind: "prescription",
            linkId: prescription.id,
          },
        });
        return {
          id,
          version: version + 1,
          recordId: record.id,
          prescriptionId: prescription.id,
        };
      },
    );
  }
  async prescription(p: AccountPrincipal, id: string) {
    return this.db.prisma.$transaction(async (tx) => {
      const row = await tx.prescription.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!row) throw new NotFoundException();
      await this.patient(tx, p, row.animalId);
      return json(row);
    });
  }
  amend(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    d: AmendmentDto,
  ) {
    return this.command(p, key, `record.amend:${id}`, d, async (tx) => {
      const row = await tx.healthRecord.findUnique({ where: { id } });
      if (!row) throw new NotFoundException();
      await this.lock(tx, row.animalId);
      await this.vet(tx, p);
      await this.patient(tx, p, row.animalId);
      if (row.source !== "VET" || row.vetId !== p.userId)
        throw new NotFoundException();
      const record = await tx.healthRecord.create({
        data: {
          animalId: row.animalId,
          authorId: p.userId,
          vetId: p.userId,
          appointmentId: row.appointmentId,
          source: "VET",
          kind: row.kind,
          note: d.note.trim(),
          amendsId: id,
          signedAt: new Date(),
        },
      });
      await this.event(tx, p, row.animalId, "CLINICAL_AMENDMENT", {
        recordId: record.id,
        amendsId: id,
        reason: d.reason,
      });
      return { id: record.id, amendsId: id };
    });
  }
  async reminders(p: AccountPrincipal, q: PageDto = { limit: 25 }) {
    const { limit } = pageInput(q);
    let after = {};
    if (q.cursor) {
      const [time, id] = JSON.parse(
        Buffer.from(q.cursor, "base64url").toString(),
      );
      after = {
        OR: [
          { dueAt: { gt: new Date(time) } },
          { dueAt: new Date(time), id: { gt: id } },
        ],
      };
    }
    const rows = await this.db.prisma.careReminder.findMany({
      where: { ownerId: p.userId, animal: { ownerId: p.userId }, ...after },
      include: {
        adherenceEvents: {
          orderBy: [{ recordedAt: "desc" }, { id: "desc" }],
          take: 5,
        },
      },
      orderBy: [{ dueAt: "asc" }, { id: "asc" }],
      take: limit + 1,
    });
    const items = rows.slice(0, limit);
    const last = items.at(-1);
    return json({
      items,
      nextCursor:
        rows.length > limit && last
          ? Buffer.from(
              JSON.stringify([last.dueAt.toISOString(), last.id]),
            ).toString("base64url")
          : null,
      delivery: "OUTBOX_WORKER_M5",
    });
  }

  reminder(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    enabled: boolean,
  ) {
    return this.command(
      p,
      key,
      `reminder.edit:${id}`,
      { version, enabled },
      async (tx) => {
        const row = await tx.careReminder.findFirst({
          where: { id, ownerId: p.userId, animal: { ownerId: p.userId } },
        });
        if (!row) throw new NotFoundException();
        const result = await tx.careReminder.updateMany({
          where: { id, version },
          data: { enabled, version: { increment: 1 } },
        });
        if (!result.count) throw new ConflictException();
        return { id, version: version + 1, enabled };
      },
    );
  }
  async upload(p: AccountPrincipal, key: string | undefined, d: UploadDto) {
    return this.command(p, key, "file.upload", d, async (tx) => {
      const animal = await this.patient(tx, p, d.animalId);
      const file = await tx.privateFile.create({
        data: {
          animalId: d.animalId,
          uploaderId: p.userId,
          ownerAtUploadId: animal.ownerId,
          purpose: d.purpose,
          contentType: d.contentType,
          declaredBytes: d.sizeBytes,
          expiresAt: new Date(Date.now() + 15 * 60000),
        },
      });
      return {
        id: file.id,
        uploadPath: `/api/v1/files/${file.id}/content`,
        expiresAt: file.expiresAt,
      };
    });
  }
  async content(
    p: AccountPrincipal,
    id: string,
    contentType: string,
    bytes: Buffer,
  ) {
    const before = await this.db.prisma.privateFile.findFirst({
      where: {
        id,
        uploaderId: p.userId,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    });
    if (!before) throw new NotFoundException();
    await this.db.prisma.$transaction((tx) =>
      this.patient(tx, p, before.animalId),
    );
    if (
      !Buffer.isBuffer(bytes) ||
      bytes.length !== before.declaredBytes ||
      contentType !== before.contentType
    )
      throw new BadRequestException();
    let clean: Buffer;
    try {
      const image = sharp(bytes, {
        limitInputPixels: 20000000,
        failOn: "error",
      });
      const info = await image.metadata();
      if (
        !["png", "jpeg"].includes(info.format ?? "") ||
        `image/${info.format}` !== contentType
      )
        throw Error();
      clean = await image
        .rotate()
        .resize({
          width: 2048,
          height: 2048,
          fit: "inside",
          withoutEnlargement: true,
        })
        .png()
        .toBuffer();
      if (clean.length > 4194304) throw Error();
    } catch {
      throw new BadRequestException();
    }
    const hash = createHash("sha256").update(clean).digest("hex");
    await this.db.prisma.$transaction(async (tx) => {
      await this.lock(tx, before.animalId);
      const animal = await this.patient(tx, p, before.animalId);
      if (animal.ownerId !== before.ownerAtUploadId)
        throw new NotFoundException();
      const changed = await tx.privateFile.updateMany({
        where: {
          id,
          uploaderId: p.userId,
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
        data: {
          bytes: new Uint8Array(clean),
          sha256: hash,
          status: "QUARANTINED",
        },
      });
      if (!changed.count) throw new ConflictException();
    });
    return { id, sha256: hash, status: "QUARANTINED" };
  }
  fileComplete(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    hash: string,
  ) {
    return this.command(p, key, `file.complete:${id}`, { hash }, async (tx) => {
      const file = await tx.privateFile.findFirst({
        where: {
          id,
          uploaderId: p.userId,
          status: "QUARANTINED",
          sha256: hash,
          expiresAt: { gt: new Date() },
        },
      });
      if (!file) throw new NotFoundException();
      await this.lock(tx, file.animalId);
      const animal = await this.patient(tx, p, file.animalId);
      if (animal.ownerId !== file.ownerAtUploadId)
        throw new NotFoundException();
      await tx.privateFile.update({ where: { id }, data: { status: "READY" } });
      await this.event(tx, p, file.animalId, "PRIVATE_FILE_READY", {
        fileId: id,
      });
      return { id, status: "READY" };
    });
  }
  private async canReadClaimEvidenceFile(
    tx: Tx,
    p: AccountPrincipal,
    fileId: string,
    animalId: string,
  ): Promise<boolean> {
    const links = await tx.claimEvidenceLink.findMany({
      where: { fileId, claim: { animalId } },
      include: { claim: true },
    });
    if (links.length === 0) return false;
    const insurerOrgIds = p.memberships
      .filter((m) => m.role === "INSURER_STAFF")
      .map((m) => m.organizationId);
    if (insurerOrgIds.length > 0) {
      const matchingOrgIds = links
        .map((l) => l.claim.insurerOrganizationId)
        .filter((orgId) => insurerOrgIds.includes(orgId));
      if (matchingOrgIds.length > 0) {
        const activeInsurer = await tx.membership.findFirst({
          where: {
            userId: p.userId,
            role: "INSURER_STAFF",
            status: "ACTIVE",
            organizationId: { in: matchingOrgIds },
            user: { status: "ACTIVE" },
            organization: { kind: "INSURER", status: "ACTIVE" },
          },
        });
        if (activeInsurer) return true;
      }
    }
    if (p.memberships.some((m) => m.role === "VET")) {
      await this.vet(tx, p);
      const claimIds = links.map((l) => l.claimId);
      const referral = await tx.claimReferralGrant.findFirst({
        where: {
          claimId: { in: claimIds },
          animalId,
          vetId: p.userId,
          status: "ACTIVE",
          expiresAt: { gt: new Date() },
        },
      });
      if (referral) return true;
    }
    return false;
  }

  private async fileAccess(tx: Tx, p: AccountPrincipal, id: string) {
    const file = await tx.privateFile.findUnique({ where: { id } });
    if (!file || (file.status !== "READY" && file.uploaderId !== p.userId))
      throw new NotFoundException();
    const animal = await tx.animal.findUnique({ where: { id: file.animalId } });
    if (!animal || animal.ownerId !== file.ownerAtUploadId)
      throw new NotFoundException();
    try {
      await this.patient(tx, p, file.animalId);
      return file;
    } catch (err) {
      if (
        file.status === "READY" &&
        (await this.canReadClaimEvidenceFile(tx, p, file.id, file.animalId))
      ) {
        return file;
      }
      throw err;
    }
  }
  async fileInfo(p: AccountPrincipal, id: string) {
    return this.db.prisma.$transaction(async (tx) => {
      const file = await this.fileAccess(tx, p, id);
      return json({
        id: file.id,
        status: file.status,
        sha256: file.sha256,
        purpose: file.purpose,
        expiresAt: file.expiresAt,
      });
    });
  }
  async download(p: AccountPrincipal, id: string) {
    return this.db.prisma.$transaction(async (tx) => {
      const file = await this.fileAccess(tx, p, id);
      if (file.status !== "READY" || !file.bytes) throw new NotFoundException();
      return Buffer.from(file.bytes);
    });
  }
}

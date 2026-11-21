import type { Prisma } from "../generated/prisma/client.js";

// Spend checks share this transaction lock across lending, insurance and commerce.
// Ledger accounts remain insert-only for the runtime role.
export async function lockWalletSpend(tx: Prisma.TransactionClient, accountId: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('wallet-spend'), hashtext(${accountId}))`;
}

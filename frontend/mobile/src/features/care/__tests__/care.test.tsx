import { test, expect, jest, beforeEach, afterEach } from "@jest/globals";
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react-native";
import CareScreen from "../screen-enabled.native";
import Disabled from "../screen.native";
const mockAuth: {
  currentUser: { uid: string; getIdToken: () => Promise<string> } | null;
} = { currentUser: null };
let mockAuthListener: (() => void) | undefined;
jest.mock("@react-native-firebase/auth", () => ({
  getAuth: () => mockAuth,
  onAuthStateChanged: (_a: unknown, cb: () => void) => {
    mockAuthListener = cb;
    cb();
    return () => {
      mockAuthListener = undefined;
    };
  },
}));
jest.mock("expo-router", () => ({
  Link: "Text",
  useFocusEffect: (effect: () => void) =>
    jest.requireActual<typeof import("react")>("react").useEffect(effect, [effect]),
}));
jest.mock("expo-crypto", () => ({
  randomUUID: () => "synthetic-care-command-key",
}));
jest.mock("expo-image-picker", () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock("expo-file-system", () => ({ File: jest.fn() }));
const originalFetch = globalThis.fetch;
const profile = {
  userId: "farmer",
  displayName: "Farmer",
  memberships: [] as { role: string }[],
};
const appointments: Record<string, unknown>[] = [];
const writes: { path: string; body: unknown }[] = [];
beforeEach(() => {
  process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED = "true";
  process.env.EXPO_PUBLIC_PALITO_API_ORIGIN = "https://api.palito.test";
  profile.userId = "farmer";
  profile.memberships = [];
  appointments.length = 0;
  writes.length = 0;
  mockAuth.currentUser = {
    uid: "farmer",
    getIdToken: async () => "synthetic-sdk-token",
  };
  Object.defineProperty(globalThis, "fetch", {
    writable: true,
    configurable: true,
    value: jest.fn(async (input: unknown, init?: RequestInit) => {
      const path = String(input).split("/api/v1")[1]!;
      let value: unknown = { items: [], nextCursor: null };
      if (path === "/me") value = profile;
      else if (path.startsWith("/appointments?"))
        value = { items: appointments, nextCursor: null };
      else if (path.startsWith("/prescriptions?"))
        value = {
          items: [{ id: "rx", animalName: "Synced cow", animalTag: "SYNC-01", signedAt: new Date().toISOString() }],
          nextCursor: null,
        };
      else if (path === "/prescriptions/rx")
        value = {
          id: "rx",
          advice: "Signed synthetic advice",
          signedAt: new Date().toISOString(),
          items: [
            {
              medicineName: "Synthetic item",
              dose: "Synthetic dose",
              frequency: "Synthetic frequency",
              days: 1,
            },
          ],
        };
      if (init?.method && init.method !== "GET") {
        writes.push({ path, body: JSON.parse(String(init.body)) });
        value = { id: "new", version: 2, prescriptionId: "rx" };
        if (path.includes("/consultations"))
          appointments[0]!.status = "IN_PROGRESS";
      }
      return { ok: true, json: async () => value };
    }),
  });
});
afterEach(() => {
  Object.defineProperty(globalThis, "fetch", {
    writable: true,
    configurable: true,
    value: originalFetch,
  });
  delete process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED;
  delete process.env.EXPO_PUBLIC_PALITO_API_ORIGIN;
});
test("native farmer form writes the real API and SDK sign-out discards private state", async () => {
  await render(<CareScreen />);
  await fireEvent.press(screen.getByText("তথ্য আনুন · Load / refresh care"));
  await waitFor(() => expect(screen.getByText("Farmer")).toBeTruthy());
  await fireEvent.press(screen.getByText("খামার যোগ · Add farm"));
  await waitFor(() =>
    expect(screen.getByLabelText("খামারের নাম · Farm name")).toBeTruthy(),
  );
  for (const [label, value] of [
    ["খামারের নাম · Farm name", "Test farm"],
    ["জেলা · District", "Dhaka"],
    ["ঠিকানা · Address", "Private address"],
    ["জমি · Area (acres)", "1.25"],
  ])
    await fireEvent.changeText(screen.getByLabelText(label!), value);
  await fireEvent.press(screen.getByText("সংরক্ষণ · Save"));
  await waitFor(() => expect(writes[0]?.path).toBe("/farms"));
  expect(writes[0]!.body).toEqual({
    name: "Test farm",
    district: "Dhaka",
    address: "Private address",
    areaAcres: "1.25",
  });
  mockAuth.currentUser = null;
  mockAuthListener?.();
  await waitFor(() => expect(screen.queryByText("Farmer")).toBeNull());
});
test("native verified-vet consultation form sends structured medicines and renders signed prescription", async () => {
  profile.userId = "vet";
  profile.memberships = [{ role: "VET" }];
  mockAuth.currentUser = {
    uid: "vet",
    getIdToken: async () => "synthetic-mfa-token",
  };
  appointments.push({
    id: "appointment",
    animalId: "animal",
    vetId: "vet",
    farmerId: "farmer",
    startsAt: new Date().toISOString(),
    mode: "visit",
    reason: "Synthetic",
    decisionNote: "",
    status: "IN_PROGRESS",
    version: 3,
  });
  await render(<CareScreen />);
  await fireEvent.press(screen.getByText("তথ্য আনুন · Load / refresh care"));
  await waitFor(() =>
    expect(screen.getByText("Sign consultation & prescription")).toBeTruthy(),
  );
  await fireEvent.press(screen.getByText("Sign consultation & prescription"));
  await waitFor(() =>
    expect(screen.getByLabelText("Clinical finding")).toBeTruthy(),
  );
  for (const [label, value] of [
    ["Clinical finding", "Synthetic finding"],
    ["Advice", "Signed synthetic advice"],
    ["Medicine 1 name", "Synthetic item"],
    ["Medicine 1 dose", "Synthetic dose"],
    ["Medicine 1 frequency", "Synthetic frequency"],
    ["Medicine 1 days", "1"],
  ])
    await fireEvent.changeText(screen.getByLabelText(label!), value);
  await fireEvent.press(screen.getByText("সংরক্ষণ · Save"));
  await waitFor(() =>
    expect(screen.getByText("Signed synthetic advice")).toBeTruthy(),
  );
  expect(writes[0]?.path).toBe("/consultations/appointment/completion");
  expect(writes[0]?.body).toMatchObject({
    medicines: [
      {
        name: "Synthetic item",
        dose: "Synthetic dose",
        frequency: "Synthetic frequency",
        days: 1,
      },
    ],
  });
});
test("native dashboard reads the signed prescription list through the authenticated API", async () => {
  await render(<CareScreen />);
  await waitFor(() => expect(screen.getByText("খামারি ড্যাশবোর্ড · Farmer dashboard")).toBeTruthy());
  await fireEvent.press(screen.getByRole("tab", { name: "প্রেসক্রিপশন · Prescriptions" }));
  await waitFor(() => expect(screen.getByText("Synced cow · SYNC-01")).toBeTruthy());
  expect(globalThis.fetch).toHaveBeenCalledWith(
    "https://api.palito.test/api/v1/prescriptions?limit=25",
    expect.objectContaining({
      headers: { Authorization: "Bearer synthetic-sdk-token" },
    }),
  );
  await fireEvent.press(screen.getByText("প্রেসক্রিপশন দেখুন · View signed prescription"));
  await waitFor(() => expect(screen.getByText("Signed synthetic advice")).toBeTruthy());
});
test("disabled native care never initializes provider transport", async () => {
  process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED = "false";
  await render(<Disabled />);
  expect(
    screen.getByText("Native care requires a configured development build."),
  ).toBeTruthy();
  expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("native administration hides operational actions without an administrator session", async () => {
  await render(<CareScreen operations />);
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/Check sign-in and access/));
  expect(screen.queryByRole("button", { name: /Users & access/ })).toBeNull();
  expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  expect(globalThis.fetch).toHaveBeenCalledWith(
    "https://api.palito.test/api/v1/me",
    expect.objectContaining({ headers: { Authorization: "Bearer synthetic-sdk-token" } }),
  );
});

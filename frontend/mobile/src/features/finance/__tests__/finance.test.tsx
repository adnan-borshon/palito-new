import { test, expect, jest, beforeEach, afterEach } from "@jest/globals";
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react-native";
import FinanceScreen from "../screen-enabled.native";
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
  randomUUID: () => "synthetic-finance-command-key",
}));

const originalFetch = globalThis.fetch;
const profile = {
  userId: "farmer",
  displayName: "Farmer",
  memberships: [] as { role: string }[],
};
const writes: { path: string; body: unknown }[] = [];

beforeEach(() => {
  process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED = "true";
  process.env.EXPO_PUBLIC_PALITO_API_ORIGIN = "https://api.palito.test";
  profile.userId = "farmer";
  profile.memberships = [];
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
      else if (path === "/me/wallet") {
        value = {
          accountCode: "USER_WALLET:farmer",
          balanceMinor: "3500000",
          currency: "BDT",
          sandboxMode: true,
          withdrawable: false,
          disclosure:
            "Sandbox ledger preview only — no real-money transfer or withdrawal is enabled.",
          entries: [],
          paymentIntents: [],
        };
      } else if (path.startsWith("/loans?")) {
        value = {
          items: [
            {
              id: "loan-1",
              quoteId: "quote-1",
              animalId: "animal-1",
              farmerId: "farmer",
              bankOrganizationId: "bank-1",
              purpose: "Dairy feed",
              repaymentSource: "Farm income",
              termVersion: "sandbox-v1",
              principalMinor: "3500000",
              totalPayableMinor: "3500000",
              totalRepayableMinor: "3500000",
              repaidMinor: "0",
              outstandingMinor: "3500000",
              termMonths: 3,
              currency: "BDT",
              status: "ACTIVE",
              decisionNote: "Approved in sandbox",
              version: 2,
              createdAt: new Date().toISOString(),
            },
          ],
          nextCursor: null,
        };
      }
      if (init?.method && init.method !== "GET") {
        writes.push({ path, body: JSON.parse(String(init.body)) });
        value = {
          paymentIntent: { id: "pi-1", status: "CONFIRMED" },
          loanStatus: "PAID",
          outstandingMinor: "0",
          repaidMinor: "3500000",
          allocations: [],
        };
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

test("native finance sandbox displays non-withdrawable ledger balance, submits wallet repayment, and clears on sign-out", async () => {
  await render(<FinanceScreen />);
  await fireEvent.press(
    screen.getByText("তথ্য আনুন · Load / refresh finance sandbox"),
  );
  await waitFor(() => expect(screen.getByText("Farmer")).toBeTruthy());
  expect(
    screen.getByText(/Sandbox ledger balance: BDT 35000\.00/i),
  ).toBeTruthy();
  await fireEvent.press(screen.getByText("Repay from sandbox wallet"));
  await waitFor(() =>
    expect(
      screen.getByLabelText("Amount in poisha (<= 3500000)"),
    ).toBeTruthy(),
  );
  await fireEvent.press(screen.getByText("সংরক্ষণ · Submit"));
  await waitFor(() => expect(writes.length).toBe(1));
  expect(writes[0]).toEqual({
    path: "/loans/loan-1/repayment-intents",
    body: { amountMinor: "3500000", provider: "WALLET" },
  });
  mockAuth.currentUser = null;
  mockAuthListener?.();
  await waitFor(() => expect(screen.queryByText("Farmer")).toBeNull());
});

test("native finance screen stays fail-closed when EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED is false", async () => {
  process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED = "false";
  await render(<Disabled />);
  expect(
    screen.getByText(/requires a configured development build/i),
  ).toBeTruthy();
});

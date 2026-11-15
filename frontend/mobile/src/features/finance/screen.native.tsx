import { lazy, Suspense } from "react";
import { Text } from "react-native";

const Enabled = lazy(() => import("./screen-enabled.native"));

export default function Finance() {
  if (process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED !== "true") {
    return (
      <Text>
        Native financial sandbox requires a configured development build.
      </Text>
    );
  }
  return (
    <Suspense fallback={<Text>Loading financial sandbox…</Text>}>
      <Enabled />
    </Suspense>
  );
}

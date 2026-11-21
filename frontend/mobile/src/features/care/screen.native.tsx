import { lazy, Suspense } from "react";
import { Text } from "react-native";
const Enabled = lazy(() => import("./screen-enabled.native"));
export default function Care({ operations = false }: { operations?: boolean }) {
  if (process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED !== "true")
    return <Text>Native care requires a configured development build.</Text>;
  return (
    <Suspense fallback={<Text>Loading care…</Text>}>
      <Enabled operations={operations} />
    </Suspense>
  );
}

import { Link } from "expo-router";
import { Text, View } from "react-native";
export default function Care() {
  return (
    <View style={{ padding: 24, gap: 16 }}>
      <Text>
        Open farm & care in the web app or a configured native development
        build.
      </Text>
      <Link href="/identity">Sign in</Link>
    </View>
  );
}

import { useEffect, useState } from "react";
import {
  AppState,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link } from "expo-router";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { randomUUID } from "expo-crypto";
import {
  CareFailure,
  CareWorkspace,
  careInitialView,
  careMedicineFields,
  type CareForm,
  type CareRequest,
  type CareTransport,
  type CareView,
} from "@palito/shared";
const transport: CareTransport = async <T,>(
  path: string,
  r: CareRequest = {},
) => {
  const origin = process.env.EXPO_PUBLIC_PALITO_API_ORIGIN;
  if (
    !origin ||
    !origin.startsWith("https://") ||
    new URL(origin).origin !== origin
  )
    throw new Error("Configure HTTPS API");
  const user = getAuth().currentUser;
  if (!user) throw new CareFailure(401);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${await user.getIdToken(true)}`,
  };
  if (r.body !== undefined) headers["Content-Type"] = "application/json";
  if (r.contentType) headers["Content-Type"] = r.contentType;
  if (r.key) headers["Idempotency-Key"] = r.key;
  if (r.version !== undefined) headers["If-Match"] = String(r.version);
  const response = await fetch(`${origin}/api/v1${path}`, {
    method: r.method ?? "GET",
    headers,
    body: r.raw ?? (r.body === undefined ? undefined : JSON.stringify(r.body)),
  });
  if (getAuth().currentUser?.uid !== user.uid) throw new CareFailure(401);
  if (!response.ok) throw new CareFailure(response.status);
  return (r.binary ? await response.arrayBuffer() : await response.json()) as T;
};
const styles = StyleSheet.create({
  page: { padding: 20, gap: 16, backgroundColor: "#edf6ef" },
  card: { padding: 16, gap: 12, backgroundColor: "white", borderRadius: 14 },
  title: { fontSize: 24, fontWeight: "700", color: "#145734" },
  input: {
    borderWidth: 1,
    borderColor: "#9ab5a0",
    padding: 12,
    borderRadius: 8,
    minHeight: 48,
  },
  text: { fontSize: 16, color: "#182e21" },
});
function EntryForm({
  form,
  workspace,
  busy,
}: {
  form: CareForm;
  workspace: CareWorkspace;
  busy: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(form.fields.map((f) => [f.key, f.value])),
  );
  const [count, setCount] = useState(1);
  const fields = [
    ...form.fields,
    ...(form.medicines ? careMedicineFields(count) : []),
  ];
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>
        {form.title}
      </Text>
      {fields.map((field) => (
        <View key={field.key} style={{ gap: 8 }}>
          <Text style={styles.text}>{field.label}</Text>
          {field.type === "check" ? (
            <Switch
              accessibilityLabel={field.label}
              value={values[field.key] === "true"}
              onValueChange={(v) =>
                setValues({ ...values, [field.key]: String(v) })
              }
            />
          ) : field.type === "select" ? (
            <View style={{ gap: 6 }}>
              {field.options?.map((option) => (
                <Button
                  key={option.value}
                  title={`${(values[field.key] ?? field.value) === option.value ? "✓ " : ""}${option.label}`}
                  accessibilityLabel={`${field.label}: ${option.label}`}
                  disabled={busy}
                  onPress={() =>
                    setValues({ ...values, [field.key]: option.value })
                  }
                />
              ))}
            </View>
          ) : (
            <TextInput
              style={styles.input}
              accessibilityLabel={field.label}
              value={values[field.key] ?? ""}
              onChangeText={(v) => setValues({ ...values, [field.key]: v })}
              editable={!busy}
              multiline={field.type === "multiline"}
              keyboardType={field.type === "number" ? "decimal-pad" : "default"}
              autoCapitalize="none"
              maxLength={4000}
            />
          )}
        </View>
      ))}
      {form.medicines && (
        <>
          <Button
            title="Add medicine"
            disabled={busy || count >= 20}
            onPress={() => setCount(count + 1)}
          />
          {count > 1 && (
            <Button
              title="Remove last medicine"
              disabled={busy}
              onPress={() => {
                setValues(
                  Object.fromEntries(
                    Object.entries(values).filter(
                      ([k]) => !k.startsWith(`medicine${count - 1}`),
                    ),
                  ),
                );
                setCount(count - 1);
              }}
            />
          )}
        </>
      )}
      <Button
        title="সংরক্ষণ · Save"
        disabled={busy}
        onPress={() => void workspace.submit(values)}
      />
      <Button
        title="Close form"
        disabled={busy}
        onPress={() => workspace.dismiss()}
      />
    </View>
  );
}
export default function CareScreen() {
  const [view, setView] = useState<CareView>(careInitialView);
  const [workspace] = useState(
    () => new CareWorkspace(transport, randomUUID, (v) => setView(v)),
  );
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), () => workspace.clear());
    const listener = AppState.addEventListener("change", () =>
      workspace.clear(),
    );
    return () => {
      unsubscribe();
      listener.remove();
      workspace.clear();
    };
  }, [workspace]);
  async function image() {
    const id = view.uploadAnimalId,
      uid = getAuth().currentUser?.uid;
    if (!id || !uid) return;
    const selected = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      exif: false,
      allowsMultipleSelection: false,
    });
    if (selected.canceled) return;
    const asset = selected.assets[0];
    if (!asset || getAuth().currentUser?.uid !== uid) return;
    const file = new File(asset.uri);
    if (file.size > 1048576) throw new Error("Choose an image up to 1 MiB.");
    const bytes = await file.bytes();
    await workspace.act(async () => {
      await workspace.passport(id);
      await workspace.upload(
        id,
        bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ) as ArrayBuffer,
        asset.mimeType ?? file.type,
      );
    });
  }
  return (
    <ScrollView
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <Link href="/identity">Sign-in & account</Link>
      <Link href="/staff-identity">Vet MFA sign-in</Link>
      <Link href="/finance">স্যান্ডবক্স ঋণ ও লেজার · Finance sandbox</Link>
      <Text accessibilityRole="header" style={styles.title}>
        {view.title}
      </Text>
      <Button
        title="তথ্য আনুন · Load / refresh care"
        disabled={view.busy}
        onPress={() => void workspace.act(() => workspace.home())}
      />
      {view.profile && (
        <Text style={styles.text}>{view.profile.displayName}</Text>
      )}
      <Text accessibilityRole="alert">
        {view.busy ? "অপেক্ষা করুন · Please wait…" : view.notice}
      </Text>
      {view.actions.map((a) => (
        <Button
          key={a.label}
          title={a.label}
          disabled={view.busy}
          onPress={a.run}
        />
      ))}
      {view.form && (
        <EntryForm
          key={view.form.title}
          form={view.form}
          workspace={workspace}
          busy={view.busy}
        />
      )}
      {view.uploadAnimalId && !view.form && (
        <Button
          title={
            view.uploadOwner
              ? "পশুর ছবি · Upload animal photo"
              : "Upload clinical evidence"
          }
          disabled={view.busy}
          onPress={() => {
            void image().catch(() =>
              workspace.act(async () => {
                throw new Error("Choose a PNG or JPEG image up to 1 MiB.");
              }),
            );
          }}
        />
      )}
      {view.image && (
        <View>
          <Image
            accessibilityLabel="Authorized private animal image"
            source={{ uri: view.image }}
            style={{ height: 300, width: "100%" }}
            resizeMode="contain"
          />
          <Button title="Close image" onPress={() => workspace.dismiss()} />
        </View>
      )}
      {view.cards.map((card) => (
        <View key={card.id} style={styles.card}>
          <Text style={{ fontSize: 19, fontWeight: "600" }}>{card.title}</Text>
          {card.lines.map((line, i) => (
            <Text key={i} style={styles.text}>
              {line}
            </Text>
          ))}
          {card.actions.map((a) => (
            <Button
              key={a.label}
              title={a.label}
              disabled={view.busy}
              onPress={a.run}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

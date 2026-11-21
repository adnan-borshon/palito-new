import { useCallback, useState } from "react";
import {
  AppState,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { randomUUID } from "expo-crypto";
import {
  CARE_REFRESH_MS,
  CareFailure,
  FinanceWorkspace,
  financeInitialView,
  type CareForm,
  type CareRequest,
  type CareTransport,
  type FinanceView,
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
  ) {
    throw new Error("Configure HTTPS API");
  }
  const user = getAuth().currentUser;
  if (!user) throw new CareFailure(401);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${await user.getIdToken()}`,
  };
  if (r.body !== undefined) headers["Content-Type"] = "application/json";
  if (r.key) headers["Idempotency-Key"] = r.key;
  if (r.version !== undefined) headers["If-Match"] = String(r.version);
  const response = await fetch(`${origin}/api/v1${path}`, {
    method: r.method ?? "GET",
    headers,
    body: r.body === undefined ? undefined : JSON.stringify(r.body),
  });
  if (getAuth().currentUser?.uid !== user.uid) throw new CareFailure(401);
  if (!response.ok) throw new CareFailure(response.status);
  return (await response.json()) as T;
};

const styles = StyleSheet.create({
  page: { padding: 20, gap: 16, backgroundColor: "#fdf8ec" },
  card: { padding: 16, gap: 12, backgroundColor: "white", borderRadius: 14 },
  disclosure: {
    padding: 14,
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
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
  workspace: FinanceWorkspace;
  busy: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(form.fields.map((f) => [f.key, f.value])),
  );
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>
        {form.title}
      </Text>
      {form.fields.map((field) => (
        <View key={field.key} style={{ gap: 8 }}>
          <Text style={styles.text}>{field.label}</Text>
          {field.type === "select" ? (
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
              keyboardType={field.type === "number" ? "number-pad" : "default"}
              autoCapitalize="none"
              maxLength={4000}
            />
          )}
        </View>
      ))}
      <Button
        title="সংরক্ষণ · Submit"
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

export default function FinanceScreen() {
  const [view, setView] = useState<FinanceView>(financeInitialView);
  const [workspace] = useState(
    () => new FinanceWorkspace(transport, randomUUID, (v) => setView(v)),
  );
  useFocusEffect(useCallback(() => {
    const active = () => AppState.currentState !== "background" && AppState.currentState !== "inactive";
    const load = () => {
      if (active() && getAuth().currentUser) void workspace.act(() => workspace.open());
    };
    const unsubscribe = onAuthStateChanged(getAuth(), () => {
      workspace.clear();
      load();
    });
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") load();
      else workspace.clear();
    });
    const interval = setInterval(() => {
      if (active()) void workspace.refresh();
    }, CARE_REFRESH_MS);
    return () => {
      unsubscribe();
      listener.remove();
      clearInterval(interval);
      workspace.clear();
    };
  }, [workspace]));

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <Link href="/identity">Sign-in & account</Link>
      <Link href="/staff-identity">Bank / staff MFA sign-in</Link>
      <Link href="/care">খামার ও চিকিৎসা · Farm & care</Link>
      <View style={styles.disclosure}>
        <Text style={styles.text}>{view.disclosure}</Text>
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        {view.title}
      </Text>
      <Button
        title="তথ্য আনুন · Load / refresh finance sandbox"
        disabled={view.busy}
        onPress={() => void workspace.act(() => workspace.open())}
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
      {view.profile && !view.busy && !view.cards.length && !view.form && (
        <Text style={styles.text}>কোনো রেকর্ড নেই · No records to show.</Text>
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

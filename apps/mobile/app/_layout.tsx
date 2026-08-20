import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        initialRouteName="(tabs)"
        screenOptions={{
          headerStyle: { backgroundColor: "#07070a" },
          headerTintColor: "#e8e8ec",
          headerTitleStyle: { fontFamily: "monospace", fontSize: 13 },
          contentStyle: { backgroundColor: "#07070a" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="signal/[id]" options={{ title: "SIGNAL DETAIL" }} />
        <Stack.Screen name="drug/[id]" options={{ title: "DRUG DETAIL" }} />
        <Stack.Screen name="disease/[id]" options={{ title: "DISEASE DETAIL" }} />
        <Stack.Screen name="paper/[id]" options={{ title: "PAPER DETAIL" }} />
        <Stack.Screen name="evidence/index" options={{ title: "EVIDENCE EXPLORER" }} />
        <Stack.Screen name="projects/index" options={{ title: "PROJECTS WORKBENCH" }} />
        <Stack.Screen name="projects/[id]" options={{ title: "PROJECT DETAIL" }} />
        <Stack.Screen name="explore/index" options={{ title: "KNOWLEDGE GRAPH" }} />
      </Stack>
    </>
  );
}

import React from "react";
import { Stack } from "expo-router";

import { headerStyles } from "@/constants/styles";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={headerStyles}>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Profile",
        }}
      />
      <Stack.Screen
        name="employees"
        options={{
          headerTitle: "Werknemers",
        }}
      />

      {/* 
      <Stack.Screen
        name="editemployee"
        options={{
          headerTitle: "Edit employee",
        }}
      />*/}
      <Stack.Screen
        name="addemployee"
        options={{
          headerTitle: "Nieuwe werknemer",
        }}
      />
      {/*<Stack.Screen
        name="archive"
        options={{
          headerTitle: "Archief",
        }}
      /> */}
    </Stack>
  );
}

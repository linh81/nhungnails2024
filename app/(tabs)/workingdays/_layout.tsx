import React from "react";
import { Stack } from "expo-router";

import { headerStyles } from "@/constants/styles";

export default function WorkingDaysLayout() {
  return (
    <Stack screenOptions={headerStyles}>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Werkdagen",
        }}
      />
      <Stack.Screen
        name="editworkingday"
        options={{
          headerTitle: "",
        }}
      />
    </Stack>
  );
}

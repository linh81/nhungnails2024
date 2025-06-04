import React from "react";
import { Stack } from "expo-router";

import { headerStyles } from "@/constants/styles";

export default function RevenueLayout() {
  return (
    <Stack screenOptions={headerStyles}>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Omzet",
        }}
      />
    </Stack>
  );
}

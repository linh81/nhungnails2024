import React from "react";
import { Stack } from "expo-router";

import { headerStyles } from "@/constants/styles";

export default function SalaryLayout() {
  return (
    <Stack screenOptions={headerStyles}>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Salaris",
        }}
      />
      <Stack.Screen
        name="salarydetail"
        options={{
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="salaryworkingday"
        options={{
          headerTitle: "",
        }}
      />
    </Stack>
  );
}

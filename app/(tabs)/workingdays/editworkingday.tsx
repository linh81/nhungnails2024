import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import TimePicker from "@/components/TimePicker";
import { useAuth } from "@/context/AuthContext";
import { useConvertedEmployees, useWorkingHours } from "@/hooks/useTables";
import { EmployeeType } from "@/types/types";
import {
  format,
  formatString,
  getParsedDateFromString,
  isEmployeeActiveOnDate,
} from "@/utils/dateUtils";
import { capitalize } from "@/utils/stringUtils";
import { Ionicons } from "@expo/vector-icons";
import { getDatabase, ref, set } from '@react-native-firebase/database';
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Switch, Text, View } from "react-native-ui-lib";

export default function EditWorkingDayScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useAuth();
  const { data: employees } = useConvertedEmployees();
  const { data: workingHours } = useWorkingHours();
  const { employeeId, selectedDate, goBackAfterSubmit, headerTitle } =
    useLocalSearchParams<{
      employeeId: string;
      selectedDate: string;
      goBackAfterSubmit: string;
      headerTitle: string;
    }>();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [workingHoursData, setWorkingHoursData] = useState(null);
  const [hasWorked, setHasWorked] = useState<boolean>();
  const [needsCheck, setNeedsCheck] = useState<boolean>();
  const [isExtraDay, setIsExtraDay] = useState<boolean>();
  const [startTimeHours, setStartTimeHours] = useState<number | null>(null);
  const [startTimeMinutes, setStartTimeMinutes] = useState<number | null>(null);
  const [endTimeHours, setEndTimeHours] = useState<number | null>(null);
  const [endTimeMinutes, setEndTimeMinutes] = useState<number | null>(null);
  const [extractTimeHours, setExtractTimeHours] = useState<number>();
  const [extractTimeMinutes, setExtractTimeMinutes] = useState<number>();
  const [lastSavedBy, setLastSavedBy] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setWorkingHoursState = (data: any) => {
    if (!data) return;

    setHasWorked(!!data.hasWorked);
    setNeedsCheck(data.needsCheck || false);
    setIsExtraDay(data.isExtraDay || false);
    setStartTimeHours(data.startTimeHours);
    setStartTimeMinutes(data.startTimeMinutes);
    setEndTimeHours(data.endTimeHours);
    setEndTimeMinutes(data.endTimeMinutes);
    setExtractTimeHours(data.extractTimeHours || 0);
    setExtractTimeMinutes(data.extractTimeMinutes || 0);
    setLastSavedBy(data.lastSavedBy || null);
    setIsLoading(false);
  };

  const navigateToNextEmployee = () => {
    if (!selectedDate || !employees) return;

    const activeEmployees = employees.filter((employee: EmployeeType) => {
      return (
        !employee.disabled &&
        isEmployeeActiveOnDate(
          employee,
          getParsedDateFromString(selectedDate, "yyyyMMdd")
        )
      );
    });

    const employeeIndex = activeEmployees.findIndex(
      ({ id }: EmployeeType) => employeeId === id
    );
    const nextEmployee: EmployeeType = activeEmployees[employeeIndex + 1];

    if (nextEmployee) {
      router.replace({
        pathname: "/workingdays/editworkingday",
        params: {
          employeeId: nextEmployee.id,
          selectedDate,
          headerTitle: `${nextEmployee.name} - ${capitalize(
            format(
              getParsedDateFromString(selectedDate, "yyyyMMdd"),
              "EEEEEE dd MMM"
            )
          )}`,
        },
      });
      return;
    }

    router.back();
  };

  useEffect(() => {
    if (!employeeId || !selectedDate || !employees) return;
    setIsLoading(true);
    const employeeData = employees.find(
      (employee: any) => employee.id === employeeId
    );

    if (!employeeData) return;

    const dayName = capitalize(
      format(getParsedDateFromString(selectedDate, "yyyyMMdd"), "EEEE")
    );
    const existingWorkingHoursData = workingHours[employeeId]?.[selectedDate];

    setEmployeeData(employeeData);
    setWorkingHoursData(
      !!existingWorkingHoursData
        ? existingWorkingHoursData
        : employeeData.defaultWorkingDays.find(
          (day: any) => day.name === dayName
        )
    );
  }, [employeeId, selectedDate]);

  useEffect(() => {
    if (!workingHoursData) return;

    setWorkingHoursState(workingHoursData);
  }, [workingHoursData]);

  useEffect(() => {
    if (!navigation) return;

    navigation.setOptions({
      headerTitle,
      headerRight: () => {
        if (goBackAfterSubmit) return null;
        return (
          <Ionicons
            name="play-forward"
            color="white"
            size={20}
            onPress={navigateToNextEmployee}
          />
        );
      },
    });
  }, [navigation]);

  const handleSubmit = async () => {
    if (!employeeId || !selectedDate) return;

    const data = {
      date: formatString(selectedDate, "yyyyMMdd"),
      endTimeHours,
      endTimeMinutes,
      extractTimeHours,
      extractTimeMinutes,
      hasWorked,
      isExtraDay,
      isSaved: true,
      needsCheck,
      startTimeHours,
      startTimeMinutes,
      salary: employeeData.salary,
      eveningSalary: employeeData.eveningSalary,
      extraDaySalary: employeeData.extraDaySalary,
      lastSavedBy: user?.userData.name,
    };

    try {
      await set(ref(getDatabase(), `/workingHours/${employeeId}/${selectedDate}`), data);

      if (goBackAfterSubmit === "true") {
        navigation.goBack();
        return;
      }

      navigateToNextEmployee();
    } catch (error: any) {
      throw new Error(error);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <>
          <View style={styles.row}>
            <Text>Vrije dag</Text>
            <Switch
              value={!hasWorked}
              onValueChange={(value) => setHasWorked(!value)}
            />
          </View>
          {hasWorked && (
            <>
              <View
                style={{
                  paddingVertical: 16,
                  flexDirection: "row",
                  justifyContent: "space-around",
                  borderBottomWidth: 1,
                  borderBottomColor: "#dedede",
                }}
              >
                <View style={styles.column}>
                  <Text style={{ paddingBottom: 8 }}>Start</Text>
                  {startTimeHours !== null && startTimeMinutes !== null && (
                    <TimePicker
                      onHoursValueChange={setStartTimeHours}
                      onMinutesValueChange={setStartTimeMinutes}
                      selectedHours={startTimeHours}
                      selectedMinutes={startTimeMinutes}
                    />
                  )}
                </View>
                <View style={styles.column}>
                  <Text style={{ paddingBottom: 8 }}>Eind</Text>
                  {endTimeHours !== null && endTimeMinutes !== null && (
                    <TimePicker
                      onHoursValueChange={setEndTimeHours}
                      onMinutesValueChange={setEndTimeMinutes}
                      selectedHours={endTimeHours}
                      selectedMinutes={endTimeMinutes}
                    />
                  )}
                </View>
              </View>
              <View style={styles.row}>
                <Text style={{ paddingBottom: 8 }}>Tijd aftrekken</Text>
                {extractTimeHours !== null && extractTimeMinutes !== null && (
                  <TimePicker
                    onHoursValueChange={setExtractTimeHours}
                    onMinutesValueChange={setExtractTimeMinutes}
                    selectedHours={extractTimeHours}
                    selectedMinutes={extractTimeMinutes}
                  />
                )}
              </View>
              <View style={styles.row}>
                <Text>Is extra dag</Text>
                <Switch value={isExtraDay} onValueChange={setIsExtraDay} />
              </View>
            </>
          )}
          <View style={styles.row}>
            <Text>Nog controleren</Text>
            <Switch value={needsCheck} onValueChange={setNeedsCheck} />
          </View>
          <View style={{ padding: 16 }}>
            <Button label="Opslaan" onPress={handleSubmit} />
          </View>

          {!!lastSavedBy && (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontStyle: "italic", color: "green" }}>
                {`Aangepast door ${lastSavedBy}`}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#dedede",
    padding: 16,
  },
  column: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});

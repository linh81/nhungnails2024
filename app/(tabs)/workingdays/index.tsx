import { Ionicons } from "@expo/vector-icons";
import { addWeeks, subWeeks } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { CalendarProvider, WeekCalendar } from "react-native-calendars";
import { Checkbox, Colors, Text, View } from "react-native-ui-lib";

import { getDatabase, ref, set } from '@react-native-firebase/database';

import ListItem from "@/components/ListItem";
import { useAuth } from "@/context/AuthContext";
import { useConvertedEmployees, useWorkingHours } from "@/hooks/useTables";
import { EmployeeType } from "@/types/types";
import { getWorkingDaysData } from "@/utils/dataUtils";
import {
  format,
  getFormattedStringFromDate,
  getParsedDateFromString,
  getWorkingHoursString,
} from "@/utils/dateUtils";
import { capitalize } from "@/utils/stringUtils";

export default function WorkingDaysScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: employees } = useConvertedEmployees();
  const { data: workingHours } = useWorkingHours();
  const { selectedDate: selectedDateFromParams } = useLocalSearchParams<{
    selectedDate: string;
  }>();
  const [selectedDate, setSelectedDate] = useState(
    (selectedDateFromParams &&
      getParsedDateFromString(selectedDateFromParams, "yyyyMMdd")) ||
    new Date()
  );
  const [data, setData] = useState<any>({ employees: [], workingDays: [] });
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [loadingEmployees, setLoadingEmployees] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [optimisticSaves, setOptimisticSaves] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!employees || !workingHours || !selectedDate) return;

    const data = getWorkingDaysData(employees, workingHours, selectedDate);
    setData(data);
  }, [employees, workingHours, selectedDate]);

  const handleSelectDate = (dateString: string) => {
    setSelectedDate(getParsedDateFromString(dateString, "yyyy-MM-dd"));
  };

  const acceptDefaultHours = async (employee: EmployeeType) => {
    const existingWorkingHours =
      workingHours[employee.id]?.[format(selectedDate, "yyyyMMdd")];

    if (existingWorkingHours) {
      return Promise.resolve();
    }

    setLoadingEmployees(prev => new Set([...prev, employee.id]));
    setOptimisticSaves(prev => new Set([...prev, employee.id]));
    setError(null);

    const saveData = {
      ...employee.defaultWorkingDay,
      date: getFormattedStringFromDate(selectedDate),
      extractTimeHours: 0,
      extractTimeMinutes: 0,
      isSaved: true,
      needsCheck: false,
      salary: employee.salary,
      eveningSalary: employee.eveningSalary,
      extraDaySalary: employee.extraDaySalary,
      lastSavedBy: user?.userData.name,
    };

    try {
      const dbRef = ref(getDatabase(), `/workingHours/${employee.id}/${format(selectedDate, "yyyyMMdd")}`);
      await set(dbRef, saveData);
    } catch (error: any) {
      setOptimisticSaves(prev => {
        const newSet = new Set(prev);
        newSet.delete(employee.id);
        return newSet;
      });
      setError(`Failed to save data for ${employee.name}: ${error.message}`);
      throw new Error(error);
    } finally {
      setLoadingEmployees(prev => {
        const newSet = new Set(prev);
        newSet.delete(employee.id);
        return newSet;
      });

      setTimeout(() => {
        setOptimisticSaves(prev => {
          const newSet = new Set(prev);
          newSet.delete(employee.id);
          return newSet;
        });
      }, 1000);
    }
  };

  const areAllSaved = data.employees?.every(
    (employee: any) => !!employee.workingDay?.isSaved || optimisticSaves.has(employee.id)
  );

  const setPreviousWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  const setNextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  const renderRow = ({ item }: { item: any }) => {
    const isSaved = item.workingDay?.isSaved;
    const needsCheck = item.workingDay?.needsCheck;
    const isEmployeeLoading = loadingEmployees.has(item.id);
    const isOptimisticallySaved = optimisticSaves.has(item.id);

    // Use optimistic state if available, otherwise use real state
    const displayAsSaved = isOptimisticallySaved || isSaved;

    return (
      <ListItem
        onPress={
          isEmployeeLoading
            ? undefined
            : () =>
              router.push({
                pathname: "/workingdays/editworkingday",
                params: {
                  employeeId: item.id,
                  selectedDate: format(selectedDate, "yyyyMMdd"),
                  headerTitle: `${item.name} - ${capitalize(
                    format(selectedDate, "EEEEEE dd MMM")
                  )}`,
                },
              })
        }
        leftComponent={
          isEmployeeLoading ? (
            <ActivityIndicator size="small" />
          ) : displayAsSaved ? (
            needsCheck && !isOptimisticallySaved ? (
              <Ionicons name="warning" size={24} color="orange" />
            ) : (
              <Ionicons name="checkmark" size={24} color="green" />
            )
          ) : (
            <Checkbox
              value={displayAsSaved}
              color="red"
              onValueChange={(value) => {
                if (!!value && !isEmployeeLoading) acceptDefaultHours(item);
              }}
            />
          )
        }
        mainComponent={
          <>
            <Text style={{ opacity: isEmployeeLoading ? 0.6 : 1 }}>{item.name}</Text>
            <Text
              style={{
                color: displayAsSaved ? (needsCheck && !isOptimisticallySaved ? "orange" : "green") : "red",
                fontStyle: displayAsSaved ? "normal" : "italic",
                opacity: isEmployeeLoading ? 0.6 : 1,
              }}
            >
              {displayAsSaved
                ? getWorkingHoursString(item.workingDay || item.defaultWorkingDay)
                : getWorkingHoursString(item.defaultWorkingDay)}
            </Text>
          </>
        }
        hasChevron={!isEmployeeLoading}
      />
    );
  };

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Ionicons
            name="close"
            size={20}
            color="white"
            onPress={() => setError(null)}
            style={styles.errorCloseIcon}
          />
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: Colors.white,
          paddingVertical: 8,
          paddingHorizontal: 16,
        }}
      >
        <Ionicons
          name="arrow-back-circle-outline"
          size={32}
          onPress={setPreviousWeek}
        />
        <Text style={{ fontSize: 15, fontWeight: "bold" }}>
          {capitalize(format(selectedDate, "eeee dd MMMM yyyy"))}
        </Text>
        <Ionicons
          name="arrow-forward-circle-outline"
          size={32}
          onPress={setNextWeek}
        />
      </View>
      <CalendarProvider
        date={format(selectedDate, "yyyy-MM-dd")}
        style={{
          maxHeight: 80,
          height: 90,
        }}
        onDateChanged={(date) => handleSelectDate(date)}
      >
        <WeekCalendar testID="testId" firstDay={1} />
      </CalendarProvider>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          height: 8,
          paddingHorizontal: 40,
          paddingBottom: 14,
          backgroundColor: "#fff",
          width: "100%",
          marginTop: -10,
        }}
      >
        {data.workingDays.map((day: any, index: number) => (
          <View
            key={index}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: day.isComplete
                ? "green"
                : index === 6
                  ? "transparent"
                  : "red",
            }}
          />
        ))}
      </View>
      {data.employees.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {!areAllSaved && (
            <ListItem
              leftComponent={
                <Checkbox
                  value={false}
                  color="red"
                  onValueChange={async (value) => {
                    if (!value) return;
                    setIsUpdating(true);

                    try {
                      const updateEmployeeList = data.employees?.map(
                        (employee: any) => {
                          return acceptDefaultHours(employee);
                        }
                      );
                      await Promise.all(updateEmployeeList);
                    } catch (error: any) {
                      throw new Error(error);
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                />
              }
              mainComponent={<Text>Alles opslaan</Text>}
            />
          )}
          <FlatList
            data={data.employees}
            renderItem={renderRow}
            style={{ flex: 1 }}
          ></FlatList>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#ff4444",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  errorText: {
    color: "white",
    fontWeight: "bold",
    flex: 1,
  },
  errorCloseIcon: {
    marginLeft: 10,
  },
});

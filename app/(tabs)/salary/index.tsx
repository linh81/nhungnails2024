import React, { useEffect, useState } from "react";
import { StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native-ui-lib";
import { Ionicons } from "@expo/vector-icons";
import { CalendarProvider, WeekCalendar } from "react-native-calendars";
import { addWeeks, subWeeks } from "date-fns";

import { useAuth } from "@/context/AuthContext";
import {
  format,
  getParsedDateFromString,
  getWeekDays,
} from "@/utils/dateUtils";
import { getEmployeeSalaryData } from "@/utils/dataUtils";
import ListItem from "@/components/ListItem";
import { capitalize } from "@/utils/stringUtils";
import { Colors } from "@/constants/Colors";
import { useConvertedEmployees, useWorkingHours } from "@/hooks/useTables";

export default function SalaryScreen() {
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
  const [selectedWeekDays, setSelectedWeekDays] = useState<Date[]>([]);
  const [data, setData] = useState<any>({ employees: [], workingDays: [] });

  useEffect(() => {
    if (
      !user?.userData.isAdmin ||
      !employees ||
      !workingHours ||
      selectedWeekDays.length === 0
    )
      return;

    const data = getEmployeeSalaryData(
      employees,
      workingHours,
      selectedWeekDays
    );

    setData(data);
  }, [employees, workingHours, selectedWeekDays]);

  useEffect(() => {
    if (!user?.userData?.isAdmin) return;
    setSelectedWeekDays(getWeekDays(selectedDate));
  }, [selectedDate]);

  const setPreviousWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  const setNextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  const handleSelectDate = (dateString: string) => {
    setSelectedDate(getParsedDateFromString(dateString, "yyyy-MM-dd"));
  };

  const renderRow = ({ item }: { item: any }) => {
    return (
      <ListItem
        onPress={() =>
          router.push({
            pathname: "/salary/salarydetail",
            params: {
              employeeId: item.id,
              selectedDates: selectedWeekDays.map((day) =>
                format(day, "yyyyMMdd")
              ),
            },
          })
        }
        leftComponent={
          item.workingDays.length >= 6 ? (
            <Ionicons name="checkmark" size={24} color="green" />
          ) : (
            <Ionicons name="close" size={24} color="red" />
          )
        }
        mainComponent={
          <>
            <Text>{item.name}</Text>
            <Text
              style={{ color: item.workingDays.length >= 6 ? "green" : "red" }}
            >{`€ ${item.salary.total}`}</Text>
          </>
        }
        hasChevron
        style={{ height: 50 }}
      />
    );
  };

  if (!user?.userData?.isAdmin) return null;

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: Colors.text,
          paddingVertical: 8,
          paddingHorizontal: 16,
        }}
      >
        <Ionicons
          name="arrow-back-circle-outline"
          size={32}
          onPress={setPreviousWeek}
        />
        {selectedWeekDays.length > 0 && (
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>
            {`${capitalize(
              format(selectedWeekDays[0], "EEEEEE dd MMM yyyy")
            )} - ${capitalize(
              format(selectedWeekDays[6], "EEEEEE dd MMM yyyy")
            )}`}
          </Text>
        )}
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
        <WeekCalendar
          testID="testId"
          firstDay={1}
          markedDates={selectedWeekDays.reduce((res, day, index) => {
            return {
              ...res,
              [format(day, "yyyy-MM-dd")]: {
                disabled: true,
                disableTouchEvent: true,
                selected: true,
              },
              selected: true,

            };
          }, {})}
        />
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
          zIndex: 100,
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
          <FlatList data={data.employees} renderItem={renderRow}></FlatList>
          <ListItem
            style={{ paddingLeft: 8, paddingRight: 12 }}
            mainComponent={
              <Text style={{ fontWeight: "bold" }}>Totaal deze week</Text>
            }
            rightComponent={
              <Text style={{ fontWeight: "bold" }}>{`€ ${data.employees.reduce(
                (acc: any, employee: any) => acc + employee.salary.total,
                0
              )}`}</Text>
            }
          />
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
});

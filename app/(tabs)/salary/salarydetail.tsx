import { ActivityIndicator, FlatList, StyleSheet } from "react-native";

import { Text, View } from "react-native-ui-lib";
import ListItem from "@/components/ListItem";
import React, { useEffect, useState } from "react";
import { getEmployeeSalaryDetailData } from "@/utils/dataUtils";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  formatString,
  getDaysWorkedStringFromNumber,
  getHoursWorkedByMultipleDays,
  getHoursWorkedStringFromNumber,
  getParsedDateFromString,
  getWorkingHoursString,
  isEmployeeActiveOnDate,
} from "@/utils/dateUtils";
import { EmployeeType } from "@/types/types";
import { useConvertedEmployees, useWorkingHours } from "@/hooks/useTables";

export default function SalaryDetailScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { data: employees } = useConvertedEmployees();
  const { data: workingHours } = useWorkingHours();
  const { employeeId, selectedDates } = useLocalSearchParams<{
    employeeId: string;
    selectedDates: string;
  }>();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [data, setData] = useState<any>({ employees: [], workingDays: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (
      !employeeId ||
      !workingHours ||
      !selectedDates ||
      selectedDates?.length === 0 ||
      !employees
    )
      return;
    setIsLoading(true);
    const employee = employees.find(
      (employee: any) => employee.id === employeeId
    );
    const data = getEmployeeSalaryDetailData(
      employee,
      workingHours,
      selectedDates
        .split(",")
        ?.map((date) => getParsedDateFromString(date, "yyyyMMdd"))
    );

    setEmployeeData(employee);
    setData(data);
    setIsLoading(false);
  }, [employeeId, workingHours, selectedDates]);

  const navigateToNextEmployee = () => {
    if (!selectedDates || !employees) return;
    const parsedSelectedDates = selectedDates
      .split(",")
      ?.map((date) => getParsedDateFromString(date, "yyyyMMdd"));

    const activeEmployees = employees.filter((employee: EmployeeType) => {
      const isEmployeeActive = parsedSelectedDates.some((date: Date) =>
        isEmployeeActiveOnDate(employee, date)
      );
      return !employee.disabled && isEmployeeActive;
    });
    const employeeIndex = activeEmployees.findIndex(
      ({ id }: EmployeeType) => employeeId === id
    );
    const nextEmployee = activeEmployees[employeeIndex + 1];

    if (nextEmployee) {
      router.replace({
        pathname: "/salary/salarydetail",
        params: {
          employeeId: nextEmployee.id,
          selectedDates,
        },
      });
      return;
    }
    router.back();
  };

  useEffect(() => {
    if (!navigation || !employeeData) return;

    navigation.setOptions({
      headerTitle: employeeData.name,
      headerRight: () => (
        <Ionicons
          name="play-forward"
          color="white"
          size={20}
          onPress={navigateToNextEmployee}
        />
      ),
    });
  }, [navigation, employeeData]);

  const renderRow = ({ item, index }: { item: any; index: number }) => {
    const hasEveningSalary = item.calculated.eveningSalary > 0;
    const hasExtraDaySalary = item.calculated.extraDaySalary > 0;

    return (
      <ListItem
        onPress={() =>
          router.push({
            pathname: "/salary/salaryworkingday",
            params: {
              employeeId,
              selectedDate: formatString(item.date, "dd-MM-yyyy", "yyyyMMdd"),
              goBackAfterSubmit: "true",
              headerTitle: item.dateString,
            },
          })
        }
        leftComponent={
          item?.isSaved ? (
            <Ionicons name="checkmark" size={16} color="green" />
          ) : index === 6 ? (
            <Ionicons name="close" size={16} color="transparent" />
          ) : (
            <Ionicons name="close" size={16} color="red" />
          )
        }
        mainComponent={
          <>
            <Text style={styles.dateText}>{item.dateString}</Text>
            <Text
              style={[
                styles.hoursText,
                {
                  color: item?.isSaved || index === 6 ? "green" : "red",
                },
              ]}
            >
              {item?.isSaved
                ? getWorkingHoursString(item)
                : getWorkingHoursString(item.defaultWorkingDay)}
            </Text>
          </>
        }
        rightComponent={
          <View style={{ flexDirection: "row", marginRight: 16 }}>
            <View style={{ alignItems: "flex-end", marginRight: 16 }}>
              {item.normalHoursWorked !== item.hoursWorked && (
                <Text
                  style={styles.hoursWorkedText}
                >{`Normaal (${getHoursWorkedStringFromNumber(
                  item.normalHoursWorked
                )})`}</Text>
              )}
              {item.eveningHoursWorked > 0 && (
                <Text
                  style={styles.hoursWorkedText}
                >{`Avond (${getHoursWorkedStringFromNumber(
                  item.eveningHoursWorked
                )})`}</Text>
              )}

              <Text style={styles.hoursWorkedText}>
                {item.hoursWorked > 0
                  ? `${hasExtraDaySalary
                    ? "Extra dag"
                    : hasEveningSalary
                      ? "Totaal"
                      : ""
                  } (${getHoursWorkedStringFromNumber(item.hoursWorked)})`
                  : "-"}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              {(hasEveningSalary || hasExtraDaySalary) && (
                <>
                  {item.calculated.extraDaySalary ? (
                    <Text style={styles.rightValueText}>
                      {`€ ${item.calculated.extraDaySalary}`}
                    </Text>
                  ) : (
                    <Text style={styles.rightValueText}>
                      {`€ ${item.calculated.normalSalary}`}
                    </Text>
                  )}
                  {!!item.calculated.eveningSalary && (
                    <Text style={styles.rightValueText}>
                      {`€ ${item.calculated.eveningSalary}`}
                    </Text>
                  )}
                </>
              )}
              {!item.calculated.extraDaySalary && (
                <Text
                  style={styles.rightValueText}
                >{`€ ${item.calculated.total}`}</Text>
              )}
            </View>
          </View>
        }
        style={{ height: 60 }}
      />
    );
  };

  return isLoading ? (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  ) : (
    <View style={styles.container}>
      {!data.employee || data.employee.workingDays.length === 0 ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList data={data.employee.workingDays} renderItem={renderRow} />
      )}
      {data.employee && (
        <ListItem
          style={{ paddingLeft: 8, paddingRight: 12, height: 90 }}
          mainComponent={
            <>
              <Text
                style={[styles.summaryText, { fontWeight: "bold" }]}
              >{`Totaal (${getDaysWorkedStringFromNumber(
                getHoursWorkedByMultipleDays(data.employee.workingDays)
              )})`}</Text>
              <Text style={styles.summaryText2}>{`Salaris: € ${data.employee.workingDays?.[0]?.salary || data.employee.salary
                }/dag (8 uur)\nAvond: € ${data.employee.workingDays?.[0]?.eveningSalary ||
                data.employee.eveningSalary
                }/uur\nExtra dag: € ${data.employee.workingDays?.[0]?.extraDaySalary ||
                data.employee.extraDaySalary
                }/dag (8 uur)`}</Text>
            </>
          }
          rightComponent={
            <Text
              style={[styles.totalText, { fontWeight: "bold", width: 60 }]}
            >{`€ ${data.salary.total}`}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 14,
  },
  hoursText: {
    fontSize: 14,
  },
  hoursWorkedText: {
    fontSize: 12,
    lineHeight: 17,
  },
  summaryText: {
    fontSize: 14,
  },
  summaryText2: {
    fontSize: 12,
    lineHeight: 18,
  },
  rightValueText: {
    fontSize: 12,
    lineHeight: 17,
    width: 40,
    textAlign: "right",
  },
  totalText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "right",
  },
});

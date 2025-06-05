import { useAuth } from "@/context/AuthContext";
import { useConvertedEmployees, useConvertedWorkingDays } from "@/hooks/useTables";
import { getFormattedStringFromDate } from "@/utils/dateUtils";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { getDatabase, ref, push, update } from "@react-native-firebase/database";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Switch, Text, TextField, View } from "react-native-ui-lib";

export default function AddEmployeesScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useAuth();
  const { data: employees } = useConvertedEmployees();
  const { data: workingDays } = useConvertedWorkingDays();
  const { employeeId } = useLocalSearchParams<{
    employeeId: string;
  }>();

  const [name, setName] = useState("");
  const [salary, setSalary] = useState(0);
  const [eveningSalary, setEveningSalary] = useState(0);
  const [extraDaySalary, setExtraDaySalary] = useState(0);
  const [order, setOrder] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [startDate, setStartDate] = useState("-");
  const [endDate, setEndDate] = useState("-");

  const setEmployeeState = (employee: any) => {
    setName(employee.name || "");
    setSalary(employee.salary || 0);
    setEveningSalary(employee.eveningSalary || 0);
    setExtraDaySalary(employee.extraDaySalary || 0);
    setOrder(employee.order || 0);
    setDisabled(employee.disabled || false);
    setStartDate(employee.startDate || "-");
    setEndDate(employee.endDate || "-");
  };

  useEffect(() => {
    if (!employees || !employeeId) return;

    const employee = employees.find(
      (employee: any) => employee.id === employeeId
    );

    navigation.setOptions({
      headerTitle: employee ? employee.name : "Nieuwe werknemer",
    });

    if (employee) {
      setEmployeeState(employee);
    }
  }, [employees, employeeId]);

  const handleSubmit = async () => {
    const data = {
      name,
      salary,
      eveningSalary,
      extraDaySalary,
      order,
      disabled,
      startDate: startDate || null,
      endDate: endDate || null,
      isSaved: true,
    };

    try {
      if (employeeId) {
        await update(ref(getDatabase(), `/employees/${employeeId}`), data);
      } else {
        const newEmployee = await push(ref(getDatabase(), "/employees"));
        const newEmployeeId = newEmployee.key;

        await update(ref(getDatabase(), `/employees/${newEmployeeId}`), {
          ...data,
          id: newEmployeeId,
          startDate: startDate || getFormattedStringFromDate(new Date()),
        });

        (workingDays || []).forEach(async (workingDay: any) => {
          const newWorkingDay = await push(
            ref(getDatabase(), `employees/${newEmployeeId}/defaultWorkingDays`)
          );
          const newWorkingDayId = newWorkingDay.key;
          await update(
            ref(
              getDatabase(),
              `employees/${newEmployeeId}/defaultWorkingDays/${newWorkingDayId}`
            ),
            {
              ...workingDay,
              workingDayId: workingDay.id,
              id: null,
            }
          );
        });
      }

      router.back();
    } catch (error: any) {
      throw new Error(error);
    }
  };

  if (!user?.userData?.isAdmin) return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextField
          value={name}
          onChangeText={setName}
          label="Naam"
          style={styles.textfieldValue}
          labelStyle={styles.textfieldLabel}
        />
      </View>
      <View style={styles.row}>
        <TextField
          value={salary.toString()}
          onChangeText={(value) => setSalary(Number(value))}
          label="Salaris per dag (8 uur)"
          style={styles.textfieldValue}
          labelStyle={styles.textfieldLabel}
          keyboardType="number-pad"
        />
      </View>
      <View style={styles.row}>
        <TextField
          value={eveningSalary.toString()}
          onChangeText={(value) => setEveningSalary(Number(value))}
          label="Avond salaris (per uur na 18:00)"
          style={styles.textfieldValue}
          labelStyle={styles.textfieldLabel}
          keyboardType="number-pad"
        />
      </View>
      <View style={styles.row}>
        <TextField
          value={extraDaySalary.toString()}
          onChangeText={(value) => setExtraDaySalary(Number(value))}
          label="Extra dag salaris per dag (8 uur)"
          style={styles.textfieldValue}
          labelStyle={styles.textfieldLabel}
          keyboardType="number-pad"
        />
      </View>
      <View style={styles.row}>
        <TextField
          value={order.toString()}
          onChangeText={(value) => setOrder(Number(value))}
          label="Volgorde"
          style={styles.textfieldValue}
          labelStyle={styles.textfieldLabel}
          keyboardType="number-pad"
        />
      </View>
      <View style={styles.row}>
        <Text>Werknemer verbergen</Text>
        <Switch value={disabled} onValueChange={setDisabled} />
      </View>
      <View style={styles.row}>
        <TextField
          value={startDate}
          onChangeText={setStartDate}
          label="Start datum (dd-mm-yyyy)"
          style={styles.textfieldValue}
          labelStyle={styles.textfieldLabel}
        />
      </View>
      <View style={styles.row}>
        <TextField
          value={endDate}
          onChangeText={setEndDate}
          label="Eind datum (dd-mm-yyyy)"
          style={styles.textfieldValue}
          labelStyle={styles.textfieldLabel}
        />
      </View>
      <View style={{ padding: 16 }}>
        <Button label="Opslaan" onPress={handleSubmit} />
      </View>

      {/* {hasWorked && (
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
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 2,
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
  textfieldLabel: {
    fontSize: 10,
  },
  textfieldValue: {
    fontSize: 14,
  },
});

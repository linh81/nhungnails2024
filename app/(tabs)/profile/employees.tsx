import { useEffect, useState } from "react";
import { View, Switch, Text } from "react-native-ui-lib";
import { useNavigation, useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { EmployeeType } from "@/types/types";
import { FlatList, StyleSheet } from "react-native";
import ListItem from "@/components/ListItem";
import { Ionicons } from "@expo/vector-icons";
import { useConvertedEmployees } from "@/hooks/useTables";

export default function EmployeesScreen() {
  const { data: employees } = useConvertedEmployees();
  const { user } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();

  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeType[]>([]);
  const [showDisabledEmployees, setShowDisabledEmployees] = useState(false);

  useEffect(() => {
    if (!navigation) return;

    navigation.setOptions({
      headerRight: () => {
        return (
          <Ionicons
            name="add"
            color="white"
            size={20}
            onPress={() => router.push({ pathname: "/profile/addemployee" })}
          />
        );
      },
    });
  }, [navigation]);

  useEffect(() => {
    if (!employees) return;

    setFilteredEmployees(
      showDisabledEmployees
        ? employees
        : employees.filter((employee: EmployeeType) => !employee.disabled)
    );
  }, [employees, showDisabledEmployees]);

  if (!user?.userData?.isAdmin) return null;

  const renderRow = ({ item }: { item: any }) => {
    return (
      <ListItem
        onPress={
          () => null
          // router.push({
          //   pathname: "/profile/editemployee",
          //   params: {
          //     employeeId: item.id,
          //   },
          // })
        }
        leftComponent={
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 10 }}>{item.order}</Text>
          </View>
        }
        mainComponent={
          <View style={{ paddingLeft: 8 }}>
            <Text>{item.name}</Text>
            <Text>{`€ ${item.salary}`}</Text>
          </View>
        }
        hasChevron
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList data={filteredEmployees} renderItem={renderRow}></FlatList>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 8,
          paddingVertical: 16,
        }}
      >
        <Switch
          value={showDisabledEmployees}
          onValueChange={(value) => setShowDisabledEmployees(value)}
        />
        <Text style={{ marginLeft: 8 }}>Verborgen werknemers tonen</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

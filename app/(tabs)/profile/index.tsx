import { StyleSheet } from "react-native";
import { Button, Colors, View, Text } from "react-native-ui-lib";

import Constants from "expo-constants";
import { useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import ListItem from "@/components/ListItem";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <ListItem
          onPress={() =>
            router.push({
              pathname: "/profile/employees",
            })
          }
          mainComponent={<Text>Werknemers</Text>}
          hasChevron
        />
      </View>
      <View style={{ padding: 20 }}>
        <Text>Version: {Constants.expoConfig?.version}</Text>
        <Text>Ingelogd als: {user?.userData.name}</Text>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <Button
          label="Uitloggen"
          backgroundColor={Colors.red30}
          onPress={signOut}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
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

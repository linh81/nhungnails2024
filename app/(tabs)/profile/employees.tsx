import { StyleSheet, View, Text } from 'react-native';

export default function EmployeesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>EmployeesScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

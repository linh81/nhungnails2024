import { StyleSheet, View, Text } from 'react-native';

export default function WorkingDaysScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WorkingDaysScreen</Text>
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

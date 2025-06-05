import { StyleSheet, View, Text, Button } from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ProfileScreen</Text>
      <View style={{ paddingHorizontal: 20 }}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
        />
      </View>
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

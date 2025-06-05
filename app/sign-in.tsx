import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already signed in, redirect to protected area
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const signIn = async () => {
    setIsLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      // Navigation happens automatically via auth state change
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button 
        title={isLoading ? "Signing in..." : "Sign In"} 
        onPress={signIn}
        disabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
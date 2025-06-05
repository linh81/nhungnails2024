import React, { createContext, useContext, useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useUsers } from '../hooks/useTables';

// Extended user type that includes both Firebase auth data and custom user data
interface ExtendedUser extends FirebaseAuthTypes.User {
  userData?: any; // Custom user data from the users table
}

interface AuthContextType {
  user: ExtendedUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use the shared users table hook
  const { data: usersData, isLoading: usersLoading } = useUsers();

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((authUser) => {
      setAuthUser(authUser);
      if (!authUser) {
        setUser(null);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Combine auth user with database user data when either changes
  useEffect(() => {
    if (authUser && usersData && !usersLoading) {
      // Find the user with matching email
      let matchingUserData = null;
      
      Object.keys(usersData).forEach(key => {
        const userData = usersData[key];
        if (userData && userData.email === authUser.email) {
          matchingUserData = userData;
        }
      });
      
      // Combine auth user with database user data
      const extendedUser: ExtendedUser = {
        ...authUser,
        userData: matchingUserData
      };
      
      setUser(extendedUser);
      setIsLoading(false);
    } else if (authUser && !usersLoading) {
      // Auth user exists but no users data yet
      setUser(authUser as ExtendedUser);
      setIsLoading(false);
    }
  }, [authUser, usersData, usersLoading]);

  const signOut = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
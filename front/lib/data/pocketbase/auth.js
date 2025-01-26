// `app/(auth)/auth.jsx`

import { useSegments, useRouter, useNavigationContainerRef } from 'expo-router';
import { useState, useEffect, createContext, useContext } from 'react';
import { usePocketBase } from './';
import {Alert} from "react-native";

const AuthContext = createContext({
  signIn: (email, password) => {
    return { error: 'Auth not initialized' };
  },
  signOut: () => {},
  createAccount: () => {},
  createNewAccount: ({ email, password, passwordConfirm, name }) => {},
  refreshAuth: () => {},
  isLoggedIn: false,
  isInitialized: false,
  user: {
    email: undefined, id: undefined,

  },
});

export function useAuth() {
  return useContext(AuthContext);
}

function useProtectedRoute(user, isInitialized) {
  const router = useRouter();
  const segments = useSegments();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const rootNavRef = useNavigationContainerRef();

  useEffect(() => {
    const unsubscribe = rootNavRef?.addListener('state', (event) => {
      setIsNavigationReady(true);
    });
    return function cleanup() {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [rootNavRef.current]);

  useEffect(() => {
    if (!isNavigationReady) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isInitialized) return;
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
    // if(user && !user?.isOnboarded && !inAuthGroup) router.replace('/(auth)/onboarding')

  }, [user, segments, isNavigationReady, isInitialized]);
}

export function AuthProvider({ children }) {
  const { pb } = usePocketBase();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [did, setDid]=useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (pb) {
        const isLoggedIn = pb.authStore.isValid;
        setIsLoggedIn(isLoggedIn);
        setUser(isLoggedIn ? pb.authStore.model : null);
        setIsInitialized(true);
        if (user) {

        }
      }
    };

    checkAuthStatus();
  }, [pb]);

  const appSignIn = async (email, password) => {
    if (!pb) return { error: 'PocketBase not initialized' };

    try {
      const resp = await pb.collection('user').authWithPassword(email, password);
      setUser(pb.authStore.isValid ? pb.authStore.model : null);
      setIsLoggedIn(pb.authStore.isValid ?? false);
      if(!resp.record.verified){
        Alert.alert("Verify Email", "Please verify your email to continue. Check your email for the verification link.",
          [{
            text: "Send Verification Email",
            onPress: async () => {
              await pb.collection('user').requestVerification(resp.record.email);
              Alert.alert("Verification","Verification email sent. Check your email for the verification link.")

            }
          },
            {
              text: "Cancel",
              onPress: async () => {
                console.log("Cancel Pressed")

              },
              style: "cancel"
            }]
        )
        return { user: null };
      }
    } catch (e) {
      return { error: e };
    }
  };

  const appSignOut = async () => {
    if (!pb) return { error: 'PocketBase not initialized' };

    try {
      await pb.authStore.clear();
      setUser(null);
      setIsLoggedIn(false);
      return { user: null };
    } catch (e) {
      return { error: e };
    }
  };

  const createAccount = async ({ email, password, passwordConfirm, name }) => {
    if (!pb) return { error: 'PocketBase not initialized' };
    try {
      const resp = await pb.collection('user').create({
        email,
        password,
        passwordConfirm,
        name: name ?? '',
      });
      await appSignIn(email, password)

      return { user: resp };
    } catch (e) {
      return { error: e };
    }
  };

  const refreshAuth = async () => {
    if (!pb) return { error: 'PocketBase not initialized' };

    try {
      const isLoggedIn = pb.authStore.isValid;
      setIsLoggedIn(isLoggedIn);
      setUser(isLoggedIn ? pb.authStore.model : null);
      return { user: pb.authStore.model };
    } catch (e) {
      return { error: e };
    }
  };

  useProtectedRoute(user, isInitialized);

  return (
    <AuthContext.Provider
      value={{
        signIn: (email, password) => appSignIn(email, password),
        signOut: () => appSignOut(),
        createNewAccount: ({ email, password, passwordConfirm, name }) =>
          createAccount({ email, password, passwordConfirm, name }),
        refreshAuth: () => refreshAuth(),
        isLoggedIn,
        isInitialized,
        user,
        did
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from './lib/supabase';
import HomeScreen from './screens/HomeScreen';
import StoryScreen from './screens/StoryScreen';
import AuthScreen from './screens/AuthScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import PremiumScreen from './screens/PremiumScreen';
import ExtraStoriesScreen from './screens/ExtraStoriesScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (url && url.includes('type=signup')) {
        Alert.alert(
          'Hesabınız Doğrulandı! 🎉',
          'E-posta adresiniz başarıyla doğrulandı. Şimdi giriş yapabilirsiniz.',
          [{ text: 'Tamam' }]
        );
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const checkOnboarding = async () => {
      const done = await AsyncStorage.getItem('onboarding_done');
      if (!done) {
        setShowOnboarding(true);
      }
    };
    checkOnboarding();
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen onFinish={async () => {
        await AsyncStorage.setItem('onboarding_done', 'true');
        setShowOnboarding(false);
      }} />
    );
  }

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Story" component={StoryScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Premium" component={PremiumScreen} />
            <Stack.Screen name="ExtraStories" component={ExtraStoriesScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

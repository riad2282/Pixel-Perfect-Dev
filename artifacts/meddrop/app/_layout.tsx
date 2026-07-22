import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/context/AuthContext';
import { OrdersProvider } from '@/context/OrdersContext';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="medicine-order"
        options={{ title: 'ঔষধ অর্ডার', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff', headerTitleStyle: { fontFamily: 'Inter_700Bold', fontSize: 18 } }}
      />
      <Stack.Screen
        name="cigarette-order"
        options={{ title: 'সিগারেট অর্ডার', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff', headerTitleStyle: { fontFamily: 'Inter_700Bold', fontSize: 18 } }}
      />
      <Stack.Screen
        name="drinks-order"
        options={{ title: 'ড্রিংকস অর্ডার', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff', headerTitleStyle: { fontFamily: 'Inter_700Bold', fontSize: 18 } }}
      />
      <Stack.Screen
        name="order-confirmation"
        options={{ title: 'অর্ডার কনফার্মেশন', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff', headerTitleStyle: { fontFamily: 'Inter_700Bold', fontSize: 18 } }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <OrdersProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </OrdersProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

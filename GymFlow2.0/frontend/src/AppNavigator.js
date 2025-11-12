// src/AppNavigator.js

import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// Importações das telas
import AuthContext from './context/AuthContext';
import AuthStack from './screens/AuthStack';
import HomeScreen from './screens/HomeScreen';
import WorkoutListScreen from './screens/WorkoutListScreen';
import ExercicesListScreen from './screens/ExercicesListScreen';
import WorkoutPlanScreen from './screens/WorkoutPlanScreen';
import MoodScreen from './screens/MoodScreen';
import RankingScreen from './screens/RankingScreen';
import EditProfileScreen from './screens/EditProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { userToken, setUserToken } = useContext(AuthContext);
  const [loadingApp, setLoadingApp] = useState(true); // controle de carregamento local

  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');

        if (savedToken && savedToken !== 'null' && savedToken.trim() !== '') {
          setUserToken(savedToken);
        } else {
          await AsyncStorage.removeItem('userToken');
          setUserToken(null);
        }
      } catch (error) {
        console.error('Erro ao carregar token:', error);
        setUserToken(null);
      } finally {
        setLoadingApp(false); // só termina o carregamento aqui
      }
    };

    loadToken();
  }, []);

  // Enquanto carrega o token, mostra um indicador
  if (loadingApp) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="WorkoutList" component={WorkoutListScreen} />
            <Stack.Screen name="ExercicesList" component={ExercicesListScreen} />
            <Stack.Screen name="WorkoutPlan" component={WorkoutPlanScreen} />
            <Stack.Screen name="Mood" component={MoodScreen} />
            <Stack.Screen name="Ranking" component={RankingScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};

export default AppNavigator;

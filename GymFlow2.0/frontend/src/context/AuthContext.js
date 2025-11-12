// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ---------------- LOGIN ----------------
  const signIn = async (token, userData) => {
    try {
      if (!token || token === 'null' || token.trim() === '') {
        console.warn('Tentativa de login com token inválido.');
        return;
      }

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setUserToken(token);
      setCurrentUser(userData);
    } catch (e) {
      console.error('Erro ao salvar token/dados no AsyncStorage', e);
    }
  };

  // ---------------- LOGOUT ----------------
  const signOut = async () => {
    try {
      console.log('AuthContext: Iniciando signOut()');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUserToken(null);
      setCurrentUser(null);
      console.log('AuthContext: Logout completo');
    } catch (e) {
      console.error('AuthContext: Erro ao remover token/dados:', e);
    }
  };

  // ---------------- INICIALIZAÇÃO ----------------
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userData');

        // Só carrega se o token for realmente válido
        if (token && token !== 'null' && token.trim() !== '') {
          setUserToken(token);
        } else {
          await AsyncStorage.removeItem('userToken');
          setUserToken(null);
        }

        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Erro ao carregar token/dados do AsyncStorage', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userToken,
        currentUser,
        isLoading,
        signIn,
        signOut,
        setUserToken,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

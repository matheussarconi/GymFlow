import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    try {
      const response = await api.post('/login', {
        identifier,
        password,
      });
      const { token, user } = response.data;
      await AsyncStorage.setItem('user', JSON.stringify(user));
      signIn(token, user);
      navigation.navigate('Home');
      
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha no login. Verifique suas credenciais.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerViewAzul}>
        <View style={styles.containerView}>
          <Text style={styles.title}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>
          <TextInput
            style={styles.input}
            placeholder="Usuário ou E-mail"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity onPress={handleLogin} style={styles.button}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>Não tem uma conta? Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffffff',
  },
  containerViewAzul: {
    width: '90%',
    height: '70%',
    alignItems: 'center',
    backgroundColor: '#1C4670',
    borderRadius: 8,
  },
  containerView: {
    width: '85%',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#ffffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffffff',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    marginTop: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    width: '80%',
    backgroundColor: '#2693c7',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  registerText: {
    marginTop: 20,
    color: '#ffffffff',
  },
});

export default LoginScreen;
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

const RegisterScreen = ({ navigation }) => {
  const [nome_usuario, setNomeUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);


  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Você precisa permitir acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0]);
    }
  };

  const handleRegister = async () => {
    if (!nome_usuario || !email || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    const formData = new FormData();
    formData.append('nome_usuario', nome_usuario);
    formData.append('email', email);
    formData.append('password', password);

    if (profileImage) {
      const isWeb = Platform.OS === 'web';
      try {
        if (isWeb) {
          const response = await fetch(profileImage.uri);
          const blob = await response.blob();
          const file = new File([blob], 'profile.jpg', {
            type: blob.type || 'image/jpeg',
          });
          formData.append('profilePicture', file);
        } else {
          formData.append('profilePicture', {
            uri: profileImage.uri,
            name: 'profile.jpg',
            type: 'image/jpeg',
          }); 
        }
      } catch (error) {
        console.error('Erro ao preparar imagem:', error);
        Alert.alert('Erro', 'Não foi possível preparar a imagem.');
        return;
      }
    }

    try {
      const response = await api.post('/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Resposta do servidor:', response.data);

      if (response.data.success) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        setTimeout(
          () => Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!'),
          300
        );
      } else {
        Alert.alert('Erro', response.data.message || 'Erro ao cadastrar.');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error.response?.data || error.message);
      Alert.alert('Erro', 'Erro ao cadastrar usuário.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerViewAzul}>
        <View style={styles.containerView}>
          <Text style={styles.title}>Crie sua conta</Text>

          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Adicionar Foto</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Nome de Usuário"
            value={nome_usuario}
            onChangeText={setNomeUsuario}
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity onPress={handleRegister} style={styles.button}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Já tem uma conta? Faça login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  containerViewAzul: { width: '90%', height: '75%', alignItems: 'center', backgroundColor: '#1C4670', borderRadius: 8 },
  containerView: { width: '85%', alignItems: 'center', borderRadius: 8, marginTop: 100 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#fff' },
  imageContainer: { marginBottom: 20 },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#007bff' },
  imagePlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ccc', borderStyle: 'dashed' },
  imagePlaceholderText: { color: '#666', fontSize: 12, textAlign: 'center' },
  input: { width: '100%', padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 15, backgroundColor: '#fff' },
  button: { width: '80%', backgroundColor: '#2693c7', paddingVertical: 12, borderRadius: 25, alignItems: 'center', marginTop: 10, marginBottom: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  loginText: { marginTop: 20, color: '#007bff', textDecorationLine: 'underline' },
});

export default RegisterScreen;

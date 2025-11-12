import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert,
  ScrollView, ActivityIndicator, Image, TouchableOpacity, Platform
} from 'react-native';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = ({ navigation }) => {
  const { userToken, currentUser, isLoading: authLoading, signOut } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/getDataEditUsers/${currentUser.id}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (response.data.success) {
        const user = response.data.user;
        setUserName(user.userName || '');
        setEmail(user.email || '');

        let imageUrl = user.profilePictureUrl || '';
        if (imageUrl) {
          if (!imageUrl.startsWith('http')) {
            const baseURL = api.defaults.baseURL || 'http://localhost:3030';
            const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
            imageUrl = `${baseURL}${cleanPath}`;
          }
          setProfilePictureUrl(imageUrl);
        } else {
          setProfilePictureUrl(null);
        }
      } else {
        Alert.alert('Erro', 'Não foi possível carregar seus dados.');
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      Alert.alert('Erro', 'Falha ao obter os dados do servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && currentUser && userToken) {
      loadUserData();
    }
  }, [authLoading, currentUser, userToken]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImageUri(uri);
      setProfilePictureUrl(uri);
    }
  };
  const handleUpdateProfile = async () => {
    if (newPassword && newPassword !== confirmNewPassword) {
      Alert.alert('Erro', 'A nova senha e a confirmação não coincidem.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('userName', userName);
      formData.append('email', email);
      if (newPassword) formData.append('password', newPassword);

      if (selectedImageUri) {
        const filename = selectedImageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        formData.append('profilePicture', {
          uri: Platform.OS === 'android' ? selectedImageUri : selectedImageUri.replace('file://', ''),
          name: filename,
          type,
        });
      }

      await api.put(`/editUsers/${currentUser.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`,
        },
      });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteAccount = async () => {
    try {
      const response = await api.delete(`/deleteUsers/${currentUser.id}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (response.data.success) {
        await signOut();
      }else {
        Alert.alert('Erro', 'Não foi possível excluir sua conta.');
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      Alert.alert('Erro', 'Falha ao se conectar ao servidor.');
    }
  }

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2693c7" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.cardContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back-circle-sharp" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Editar Perfil</Text>
        <Text style={styles.subtitle}>Atualize suas informações</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={pickImage} style={styles.profilePictureContainer}>
          {profilePictureUrl ? (
            <Image source={{ uri: profilePictureUrl }} style={styles.profilePicture} />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <Ionicons name="person" size={60} color="#2693c7" />
            </View>
          )}
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.changePhotoText}>Toque para alterar foto</Text>

        <TextInput style={styles.input} placeholder="Nome de Usuário" value={userName} onChangeText={setUserName} />
        <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} />
        <TextInput
          style={styles.input}
          placeholder="Nova senha (opcional)"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar nova senha"
          secureTextEntry
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />

        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && { opacity: 0.6 }]}
          onPress={handleUpdateProfile}
          disabled={isSubmitting}
        >
          <Text style={styles.saveButtonText}>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Excluir Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ecece3',
    borderWidth: 2,
    borderColor: '#2693c7',
    borderRadius: 6,
    margin: 8,
  },
  cardContainer: {
    backgroundColor: '#1C4670',
    borderRadius: 10,
    margin: 10,
    padding: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
    color: 'white',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    padding: 4,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '400',
    textAlign: 'left',
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecece3',
  },
  loadingText: {
    marginTop: 10,
    color: '#1C4670',
    fontSize: 16,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 10,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#2693c7',
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#2693c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#2693c7',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePhotoText: {
    textAlign: 'center',
    color: '#2693c7',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 25,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2693c7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#2693c7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;

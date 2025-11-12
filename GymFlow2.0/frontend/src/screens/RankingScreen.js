import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const RankingScreen = ({ navigation, route }) => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    loadUserData();
    fetchRanking();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const fetchRanking = async () => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (!userToken) {
        Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
        navigation.replace('Login');
        return;
      }
      console.log('URL:', api.defaults.baseURL);
      
      const response = await api.get('/ranking', {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });

      console.log('Ranking response:', response.data);
      
      if (response.data.success) {
        setRanking(response.data.ranking);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar o ranking');
      }
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        code: error.code,
        response: error.response
      });
      
      if (error.code === 'ERR_NETWORK') {
        Alert.alert(
          'Erro de Conexão', 
          'Não foi possível conectar ao servidor. Verifique se o servidor está rodando.'
        );
      } else {
        Alert.alert('Erro', 'Falha ao carregar ranking');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRanking();
  };

  const getMedalEmoji = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}º`;
    }
  };

  const renderRankingItem = ({ item }) => {
    const isCurrentUser = item.userId.toString() === currentUserId;
    
    return (
      <View style={[
        styles.rankingItem,
        isCurrentUser && styles.currentUserItem
      ]}>
        <View style={styles.positionContainer}>
          <Text style={styles.positionText}>
            {getMedalEmoji(item.position)}
          </Text>
        </View>

        <View style={styles.userImageContainer}>
          {item.profilePictureUrl ? (
            <Image
              source={{ uri: `${api.defaults.baseURL}${item.profilePictureUrl}` }}
              style={styles.userImage}
            />
          ) : (
            <View style={styles.defaultImage}>
              <Text style={styles.defaultImageText}>
                {item.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={[
            styles.userName,
            isCurrentUser && styles.currentUserName
          ]}>
            {item.userName}
            {isCurrentUser && ' (Você)'}
          </Text>
        </View>

        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>{item.points}</Text>
          <Text style={styles.pointsLabel}>pontos</Text>
        </View>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>🏆</Text>
      <Text style={styles.emptyTitle}>Nenhum ranking ainda</Text>
      <Text style={styles.emptySubtitle}>
        Complete treinos para ganhar pontos!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Carregando ranking...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back-circle-sharp" size={20} color="#4A90E2"/>
            <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏆 Ranking</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={ranking}
        renderItem={renderRankingItem}
        keyExtractor={(item) => item.userId.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A90E2']}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
    marginLeft: 5,
},

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 15,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserItem: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  positionContainer: {
    width: 50,
    alignItems: 'center',
  },
  positionText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userImageContainer: {
    marginRight: 15,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
  },
  defaultImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultImageText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currentUserName: {
    color: '#4A90E2',
  },
  pointsContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default RankingScreen;
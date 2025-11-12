import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const WorkoutPlanScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [nomeTreino, setNomeTreino] = useState('');
  const [tipoTreino, setTipoTreino] = useState('academia');
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userToken } = useContext(AuthContext);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : null;

      if (!userData || !userData.id) {
        Alert.alert('Erro', 'Usuário não identificado. Faça login novamente.');
        return;
      }

      const response = await api.get(`/viewWorkouts/${userData.id}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      if (response.data.success) {
        setWorkouts(response.data.workouts);
      }
    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os treinos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleGoBack = async () =>{
    navigation.navigate('Home')
  }

  const handleCreatePlan = async () => {
    if (!nomeTreino) {
      Alert.alert('Erro', 'Digite o nome do treino.');
      return;
    }

    try {
      const storedUser = await AsyncStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : null;

      if (!userData || !userData.id) {
        Alert.alert('Erro', 'Usuário não identificado. Faça login novamente.');
        return;
      }

      await api.post('/createWorkout', {
        nomeTreino,
        tipoTreino,
        userId: userData.id
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      Alert.alert('Sucesso', 'Plano criado!');
      setModalVisible(false);
      setNomeTreino('');
      setTipoTreino('academia');
      loadWorkouts();
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      Alert.alert('Erro', 'Não foi possível criar o plano.');
    }
  };

  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => {
        console.log('Treino selecionado:', item);
        navigation.navigate('WorkoutPlan', {
          workoutId: item.id,
          workoutType: item.tipo,
          workoutName: item.workoutName
        });
      }}
    >
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutName}>{item.workoutName}</Text>
        <View style={[
          styles.badge,
          item.tipo === 'academia' ? styles.badgeGym : styles.badgeCardio
        ]}>
          <Text style={styles.badgeText}>
            {item.tipo === 'academia' ? 'Academia' : 'Cardio'}
          </Text>
        </View>
      </View>
      <View style={styles.workoutFooter}>
        <Ionicons
          name={item.tipo === 'academia' ? 'barbell-outline' : 'bicycle-outline'}
          size={24}
          color="#2693c7"
        />
        <Ionicons name="chevron-forward" size={24} color="#999" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.outerContainer}>
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back-circle-sharp" size={20} color="#fff"/>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Seus Planos de treino</Text>
        <Text style={styles.subtitle}>{workouts.length} treino(s) cadastrado(s)</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2693c7" />
          <Text style={styles.loadingText}>Carregando treinos...</Text>
        </View>
      ) : workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum treino cadastrado</Text>
          <Text style={styles.emptySubtext}>
            Clique no botão + para criar seu primeiro plano
          </Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => `${item.tipo}-${item.id}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={48} color="#111" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Plano de Treino</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do treino"
              value={nomeTreino}
              onChangeText={setNomeTreino}
            />
            <Text style={styles.label}>Tipo:</Text>
            <View style={styles.selectContainer}>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  tipoTreino === 'academia' && styles.selectedButton,
                ]}
                onPress={() => setTipoTreino('academia')}
              >
                <Text style={styles.selectText}>Academia</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  tipoTreino === 'cardio' && styles.selectedButton,
                ]}
                onPress={() => setTipoTreino('cardio')}
              >
                <Text style={styles.selectText}>Cardio</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} onPress={handleCreatePlan}>
                <Text style={styles.modalBtnText}>Criar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'flex-start',
  },
  cardContainer: {
    backgroundColor: '#1C4670',
    borderRadius: 10,
    margin: 10,
    padding: 15,
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
  listContainer: {
    padding: 10,
    paddingBottom: 120,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2693c7',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C4670',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeGym: {
    backgroundColor: '#2693c7',
  },
  badgeCardio: {
    backgroundColor: '#ff6b6b',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#1C4670',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C4670',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: '#2693c7',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1C4670',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#2693c7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#ecece3',
  },
  label: {
    fontSize: 16,
    color: '#1C4670',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  selectContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
    justifyContent: 'space-between',
  },
  selectButton: {
    flex: 1,
    backgroundColor: '#ecece3',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2693c7',
  },
  selectedButton: {
    backgroundColor: '#2693c7',
  },
  selectText: {
    color: '#1C4670',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    backgroundColor: '#2693c7',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#ccc',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: -4,
    paddingVertical: 4,
    borderRadius: 6,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
    color: 'white'
  },
});

export default WorkoutPlanScreen;
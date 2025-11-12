import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, FlatList, Image, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/AuthContext';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const WorkoutPlanScreen = ({ navigation, route }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [nomeTreino, setNomeTreino] = useState(route.params?.workoutName || '');
  const [tipoTreino, setTipoTreino] = useState(route.params?.workoutType || 'academia');
  const [currentWorkoutId, setCurrentWorkoutId] = useState(route.params?.workoutId || null);
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const { userToken } = useContext(AuthContext);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  useEffect(() => {
    if (route.params?.workoutId) {
      setCurrentWorkoutId(route.params.workoutId);
      setTipoTreino(route.params.workoutType || 'academia');
      setNomeTreino(route.params.workoutName || '');
    }
  }, [route.params]);

  useFocusEffect(
    React.useCallback(() => {
      if (!currentWorkoutId) return;
      fetchWorkoutExercises();
    }, [currentWorkoutId, tipoTreino])
  );

  const fetchWorkoutExercises = async () => {
    if (!currentWorkoutId) return;
    try {
      const response = await api.get(`/workoutExercises/${currentWorkoutId}/${tipoTreino}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (response.data.success) {
        setWorkoutExercises(response.data.exercises);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os exercícios');
      }
    } catch (error) {
      setWorkoutExercises([]);
      Alert.alert('Erro', 'Falha ao carregar exercícios');
    }
  };

  const handleOpenModal = () => setModalVisible(true);

  const handleNavigateToExercises = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      if (!userData || !userData.id) {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        return;
      }
      if (!currentWorkoutId) {
        Alert.alert('Aviso', 'Por favor, crie um treino primeiro', [
          { text: 'OK', onPress: () => setModalVisible(true) }
        ]);
        return;
      }
      navigation.navigate('ExercicesList', {
        workoutId: currentWorkoutId,
        workoutType: tipoTreino,
        workoutName: nomeTreino, // Passa o nome do treino
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir a lista de exercícios');
    }
  };

  const handleOpenExerciseModal = (exercise) => {
    setSelectedExercise(exercise);
    setWeight(exercise.usedWeight?.toString() || '');
    setReps(exercise.reps?.toString() || '');
    setSets(exercise.sets?.toString() || '');
    setExerciseModalVisible(true);
  };

  const handleSaveExerciseDetails = async () => {
    if (!weight || !reps || !sets) {
      Alert.alert('Erro', 'Preencha todos os campos (peso, repetições e séries)');
      return;
    }
    if (isNaN(weight) || isNaN(reps) || isNaN(sets)) {
      Alert.alert('Erro', 'Por favor, insira apenas números válidos');
      return;
    }
    try {
      const response = await api.post('/updateExerciseDetails', {
        gymWorkoutExerciseId: selectedExercise.gymWorkoutExerciseId,
        weight: parseFloat(weight),
        reps: parseInt(reps),
        sets: parseInt(sets)
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (response.data.success) {
        Alert.alert('Sucesso', 'Dados salvos com sucesso!');
        setExerciseModalVisible(false);
        setWeight('');
        setReps('');
        setSets('');
        setSelectedExercise(null);
        await fetchWorkoutExercises();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os dados. Tente novamente.');
    }
  };

  const handleUpdateWorkout = async () => {
    if (!nomeTreino.trim()) {
      Alert.alert('Erro', 'O nome do treino não pode estar vazio.');
      return;
    }
    try {
      const response = await api.put(
        `/updateWorkout/${currentWorkoutId}`,
        { workoutName: nomeTreino, tipoTreino },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (response.data.success) {
        Alert.alert('Sucesso', 'Treino atualizado com sucesso!');
        setModalVisible(false);
        await fetchWorkoutExercises();
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o treino.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar o treino. Tente novamente.');
    }
  };

  const handleDeleteWorkout = async () => {
    try {
      const tipoParaEnviar = tipoTreino || (route.params?.workoutType) || 'academia';
      const response = await api.delete(
        `/deleteWorkout/${currentWorkoutId}/${tipoParaEnviar}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (response.data.success) {
        Alert.alert('Sucesso', 'Treino excluído com sucesso!');
        setModalVisible(false);
        navigation.navigate('WorkoutList');
      } else {
        Alert.alert('Erro', 'Não foi possível excluir o treino.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao excluir o treino. Tente novamente.');
    }
  };

  const handleExcludeExercise = async () => {
    try {
      const exerciseUniqueId = selectedExercise?.gymWorkoutExerciseId ?? selectedExercise?.cardioExerciseId;
      const exerciseType = selectedExercise?.gymWorkoutExerciseId ? 'academia' : 'cardio';
      if (!exerciseUniqueId) {
        Alert.alert('Erro', 'ID do exercício inválido.');
        return;
      }
      const parsedId = parseInt(exerciseUniqueId, 10);
      const response = await api.delete(
        `/deleteExercise/${parsedId}/${exerciseType}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (response.data.success) {
        Alert.alert('Sucesso', 'Exercício removido com sucesso!');
        setExerciseModalVisible(false);
        await fetchWorkoutExercises();
      } else {
        Alert.alert('Erro', response.data.message || 'Falha ao remover o exercício.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao remover o exercício.');
    }
  };

  const handleGoBack = () => navigation.navigate('WorkoutList');

  const handleStartWorkout = async () => {
    if (!isWorkoutActive) {
      setIsWorkoutActive(true);
      Toast.show({
        type: 'success',
        text1: 'Treino iniciado',
        position: 'bottom'
      });
    } else {
      setIsWorkoutActive(false);
      Toast.show({
        type: 'info',
        text1: 'Treino finalizado',
        position: 'bottom'
      });
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const userData = storedUser ? JSON.parse(storedUser) : null;
        if (userData && userData.id) {
          await api.post('/addPoint', { userId: userData.id });
        }
      } catch (error) {}
    }
  };

  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => handleOpenExerciseModal(item)}
      activeOpacity={0.7}
    >
      {item.exercisePhoto ? (
        <Image
          source={{ uri: `http://localhost:3030${item.exercisePhoto}` }}
          style={styles.exerciseImage}
        />
      ) : (
        <View style={[styles.exerciseImage, styles.placeholderImage]}>
          <Ionicons name="barbell" size={32} color="#fff" />
        </View>
      )}
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.exerciseName}</Text>
        {item.usedWeight && item.sets && item.reps ? (
          <Text style={styles.exerciseDetails}>
            {item.sets} séries X {item.reps} reps X {item.usedWeight}kg
          </Text>
        ) : (
          <Text style={styles.exerciseDetailsEmpty}>Toque para adicionar detalhes</Text>
        )}
      </View>
      <Feather name="chevron-right" size={24} color="#2693c7" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.outerContainer}>
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back-circle-sharp" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{nomeTreino}</Text>
        {workoutExercises.length > 0 && (
          <Text style={styles.subtitle}>{workoutExercises.length} exercício(s)</Text>
        )}
      </View>
      {workoutExercises.length > 0 ? (
        <FlatList
          data={workoutExercises}
          keyExtractor={(item, index) =>
            item.gymWorkoutExerciseId?.toString() ||
            item.cardioExerciseId?.toString() ||
            index.toString()
          }
          renderItem={renderExerciseItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Feather name="clipboard" size={64} color="#1C4670" style={{ opacity: 0.3 }} />
          <Text style={styles.emptyText}>
            {currentWorkoutId
              ? 'Nenhum exercício adicionado ainda.\nClique no botão + para adicionar exercícios!'
              : 'Crie um treino para começar.\nClique no botão de editar!'}
          </Text>
        </View>
      )}
      <TouchableOpacity style={styles.playPauseButton}
        onPress={handleStartWorkout}
        activeOpacity={0.7}>
        <MaterialCommunityIcons name="play-pause" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.editButton}
        onPress={handleOpenModal}
        activeOpacity={0.7}
      >
        <Feather name="edit" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addExercisesButton}
        onPress={handleNavigateToExercises}
        activeOpacity={0.7}
      >
        <Feather name="plus-circle" size={24} color="white" />
      </TouchableOpacity>
      {/* Modal de Edição de Treino */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Editar Treino</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do treino"
                  value={nomeTreino}
                  onChangeText={setNomeTreino}
                />
                <TouchableOpacity
                  style={styles.modalTreinoBtn}
                  onPress={handleUpdateWorkout}
                >
                  <Feather name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.modalBtnText}>Salvar</Text>
                </TouchableOpacity>
                {currentWorkoutId && (
                  <TouchableOpacity style={[styles.modalTreinoBtn, { backgroundColor: 'red' }]} onPress={handleDeleteWorkout}>
                    <Feather name="trash-2" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.modalBtnText}>Excluir Treino</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.modalTreinoBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Modal de Detalhes do Exercício */}
      <Modal
        visible={exerciseModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setExerciseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setExerciseModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedExercise?.exerciseName}</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 20"
                placeholderTextColor="#999"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Repetições</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 12"
                placeholderTextColor="#999"
                value={reps}
                onChangeText={setReps}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Séries</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 3"
                placeholderTextColor="#999"
                value={sets}
                onChangeText={setSets}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={handleSaveExerciseDetails}
              >
                <Feather name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.modalBtnText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: 'red' }]}
                onPress={handleExcludeExercise}
              >
                <Feather name="trash-2" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.modalBtnText}>Excluir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setExerciseModalVisible(false);
                  setWeight('');
                  setReps('');
                  setSets('');
                }}
              >
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
  },
  cardContainer: {
    backgroundColor: '#1C4670',
    borderRadius: 10,
    margin: 10,
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'left',
  },
  subtitle: {
    color: '#2693c7',
    fontSize: 14,
    marginTop: 4,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#1C4670',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  exerciseCard: {
    backgroundColor: '#1C4670',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#2693c7',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseDetails: {
    color: '#2693c7',
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseDetailsEmpty: {
    color: '#888',
    fontSize: 13,
    fontStyle: 'italic',
  },
  playPauseButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#2693c7',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  editButton: {
    position: 'absolute',
    right: 90,
    bottom: 30,
    backgroundColor: '#2693c7',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addExercisesButton: {
    position: 'absolute',
    right: 160,
    bottom: 30,
    backgroundColor: '#2693c7',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1C4670',
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#2693c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
    color: '#1C4670',
  },
  label: {
    fontSize: 16,
    color: '#1C4670',
    marginBottom: 8,
    fontWeight: '600',
  },
  selectContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'space-between',
  },
  selectButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2693c7',
  },
  selectedButton: {
    backgroundColor: '#2693c7',
  },
  selectText: {
    color: '#1C4670',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedText: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: '#2693c7',
    borderRadius: 8,
    padding: 14,
    marginHorizontal: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalTreinoBtn: {
    flex: 1,
    backgroundColor: '#2693c7',
    borderRadius: 8,
    padding: 14,
    marginHorizontal: 5,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    width: 180
  },
  cancelBtn: {
    backgroundColor: '#888',
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

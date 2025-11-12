import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../components/BackButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const ExercicesListScreen = ({ navigation, route }) => {
  const [exercicios, setExercicios] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const { userToken } = useContext(AuthContext);
  const { workoutId, workoutType, workoutName } = route.params || {};

  useEffect(() => {
    console.log('Parâmetros recebidos:', { workoutId, workoutType });

    const fetchExercicios = async () => {
      try {
        const response = await api.get('/exercicios', {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        });
        console.log('Exercícios carregados:', response.data.length);
        setExercicios(response.data);
      } catch (error) {
        console.error('Erro ao buscar exercícios:', error);
        Alert.alert('Erro', 'Não foi possível carregar os exercícios');
      }
    };

    if (userToken) fetchExercicios();
  }, [userToken]);

  const toggleExerciseSelection = (id_exer) => {
    setSelectedExercises(prev => {
      if (prev.includes(id_exer)) {
        return prev.filter(id => id !== id_exer);
      } else {
        return [...prev, id_exer];
      }
    });
  };

  const handleAddExercicios = async () => {
    if (selectedExercises.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um exercício.');
      return;
    }

    if (!workoutId || !workoutType) {
      Alert.alert('Erro', 'Informações do treino não encontradas.');
      console.error('WorkoutId ou WorkoutType ausente:', { workoutId, workoutType });
      return;
    }

    let userId = null;
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      userId = parsed?.id;

      if (!userId) {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        return;
      }
    } catch (err) {
      console.error('Erro ao ler user do AsyncStorage:', err);
      Alert.alert('Erro', 'Não foi possível recuperar as informações do usuário');
      return;
    }

    try {

      const promises = selectedExercises.map((id_exer, index) => {
        console.log(`Preparando exercício ${index + 1}/${selectedExercises.length}:`, id_exer);

        return api.post('/addExerciseToWorkout',
          {
            workoutId: Number(workoutId),
            workoutType: workoutType,
            exerciseId: Number(id_exer),
            userId: Number(userId)
          },
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      });

      const results = await Promise.all(promises);
      console.log('Todas as requisições concluídas:', results.length);

      setSelectedExercises([]);


      setTimeout(() => {
        Alert.alert(
          'Sucesso!',
          `${selectedExercises.length} exercício(s) adicionado(s) ao treino!`
        );
        navigation.navigate('WorkoutPlan', {
          workoutId,
          workoutType,
          workoutName // <-- Adicione esta linha!
        });
      }, 500);

    } catch (error) {
      console.error('ERRO AO ADICIONAR EXERCÍCIOS');
      console.error('Erro completo:', error);
      console.error('Resposta do erro:', error.response?.data);

      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível adicionar os exercícios. Tente novamente.'
      );
    }
  };
  const handleGoBack = async () => {
    navigation.navigate('WorkoutPlan', {
      workoutId,
      workoutType,
      workoutName
    });
  };
  const renderItem = ({ item }) => {
    const isSelected = selectedExercises.includes(item.id_exer);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          console.log('Exercício selecionado/desmarcado:', item.nomeExer, item.id_exer);
          toggleExerciseSelection(item.id_exer);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          {item.foto_exer ? (
            <Image
              source={{ uri: `http://localhost:3030${item.foto_exer}` }}
              style={styles.cardImage}
              onError={() => console.log('Erro ao carregar imagem:', item.foto_exer)}
            />
          ) : (
            <View style={[styles.cardImage, styles.placeholderImage]}>
              <Ionicons name="barbell" size={24} color="#fff" />
            </View>
          )}
          <Text style={styles.cardText}>{item.nomeExer}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <Ionicons name="checkmark" size={24} color="#fff" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerCard}>
        {/* Botão de voltar reutilizável */}
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back-circle-sharp" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.headerText}>Exercícios</Text>
        {selectedExercises.length > 0 && (
          <Text style={styles.selectedCount}>
            {selectedExercises.length} selecionado(s)
          </Text>
        )}
      </View>

      {exercicios.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Carregando exercícios...</Text>
        </View>
      ) : (
        <FlatList
          data={exercicios}
          keyExtractor={item => item.id_exer.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {selectedExercises.length > 0 && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddExercicios}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#fff" />
          <Text style={styles.addButtonText}>
            Adicionar ao Treino ({selectedExercises.length})
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecece3',
    padding: 8,
  },
  headerCard: {
    backgroundColor: '#1C4670',
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 2,
    padding: 12,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '400',
    textAlign: 'center',
  },
  selectedCount: {
    color: '#2693c7',
    fontSize: 14,
    marginTop: 4,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#1C4670',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1C4670',
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 2,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#2693c7',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '400',
    flexShrink: 1,
  },
  checkbox: {
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#2693c7',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: '#2693c7',
    borderColor: '#2693c7',
  },
  addButton: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#2693c7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 5,
  },
  backButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },

});

export default ExercicesListScreen;

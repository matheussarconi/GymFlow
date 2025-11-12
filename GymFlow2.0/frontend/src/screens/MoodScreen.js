import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MoodScreen = ({ navigation }) => {
  const feelingsTips = [
    {
      id: '1',
      title: 'Ansiedade',
      description:
        'A ansiedade pode ser reduzida com respiração profunda e exercícios leves. Experimente uma caminhada ao ar livre ou alongamentos por 10 minutos.',
      activity: 'Caminhada leve ou ioga',
      icon: 'walk-outline',
      color: '#4A90E2',
    },
    {
      id: '2',
      title: 'Estresse',
      description:
        'O estresse diário pode ser amenizado com pausas curtas, alongamentos e exercícios respiratórios. Reserve 5 minutos para focar apenas na respiração.',
      activity: 'Alongamentos ou meditação guiada',
      icon: 'leaf-outline',
      color: '#50C878',
    },
    {
      id: '3',
      title: 'Cansaço físico ou mental',
      description:
        'O cansaço pode ser um sinal de falta de energia e sono. Faça um breve treino de baixa intensidade para reativar a circulação.',
      activity: 'Caminhar ou pedalar lentamente',
      icon: 'bicycle-outline',
      color: '#F5A623',
    },
    {
      id: '4',
      title: 'Desânimo',
      description:
        'Quando estiver sem vontade, comece com algo simples. Pequenos movimentos ajudam a liberar endorfina e melhoram o humor.',
      activity: 'Agachamentos leves ou corrida leve',
      icon: 'fitness-outline',
      color: '#E74C3C',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Equilíbrio entre corpo e mente</Text>
      <Text style={styles.subtitle}>
        Veja como o exercício pode ajudar a aliviar sentimentos do dia a dia:
      </Text>

      {/* frase solicitada */}
      <Text style={styles.reminder}>E lembre-se: mente sã corpo são</Text>

      {feelingsTips.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={46} color={item.color} />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.text}>{item.description}</Text>
          <Text style={[styles.activity, { color: item.color }]}>
            {item.activity}
          </Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
        <Text style={styles.backText}>Voltar para o início</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 8,
  },
  reminder: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
  },
  text: {
    fontSize: 15,
    color: '#555',
    marginTop: 6,
    textAlign: 'center',
  },
  activity: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 30,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

export default MoodScreen;

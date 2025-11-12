import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const HomeScreen = ({ navigation }) => {
  const [currentDay] = useState(5);
  const totalDays = 30;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.accountContainer}>
        <TouchableOpacity style={styles.accountBt} onPress={()=> navigation.navigate('EditProfile')}>
          <MaterialCommunityIcons name="account" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.viewrContainer}>
        {/*div dos cards do topo */}
        <View style={styles.topo}>
          {/* Card grande - Plano de treino */}
          <TouchableOpacity
            style={[styles.cardTreino, styles.cardFull]}
            onPress={() => navigation.navigate('WorkoutList')}
          >
            <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.gradient}>
              <Text style={styles.title}>Seu plano de treino</Text>
              <Text style={styles.subtitle}>{currentDay} dias de {totalDays}</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[styles.progressBar, { width: `${(currentDay / totalDays) * 100}%` }]}
                />
              </View>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6454/6454195.png' }} style={styles.imageTreino} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Card grande - Sentimentos */}
          <TouchableOpacity
            style={[styles.cardSentimentos, styles.cardFull]}
            onPress={() => navigation.navigate('Mood')}
          >
            <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.gradient}>
              <Text style={styles.title}>Como está se sentindo hoje?</Text>
              <Text style={styles.smallText}>Dicas de exercícios para melhorar seu ânimo</Text>
              <Image source={{ uri: 'https://images.vexels.com/media/users/3/126615/isolated/preview/c5989809e0bb7b8c780aa6c4d85c5653-buddhist-meditation-pose-icon.png' }} style={styles.imageSentimentos} />
            </LinearGradient>
          </TouchableOpacity>

        </View>

      <View style={styles.inferior}>

        <View style={styles.esquerda}>
          {/*Mapa*/}
          <TouchableOpacity
            style={[styles.cardMapa]}
            onPress={() => navigation.navigate('ExerciseMap')}
          >
            <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.gradient}>
              <Text style={styles.title}>Mapa com locais de exercícios</Text>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/592/592245.png' }} style={styles.imageMapa} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Progresso */}
          <TouchableOpacity
            style={[styles.cardProgresso]}
            onPress={() => navigation.navigate('Progress')}
          >
            <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.gradient}>
              <Text style={styles.title}>Seu progresso</Text>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1810/1810679.png' }} style={styles.imageProgresso} />
            </LinearGradient>
          </TouchableOpacity>

        </View>
          {/* Ranking */}
          <TouchableOpacity
            style={[styles.cardRanking, styles.cardHalfTall]}
            onPress={() => navigation.navigate('Ranking')}
          >
            <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.gradient}>
              <Text style={styles.titleRanking}>Ranking</Text>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3629/3629625.png' }} style={styles.imageRanking} />
            </LinearGradient>
          </TouchableOpacity>
      </View>

        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffffff',
    padding: 10,
  },
  viewrContainer: {
    marginTop: 10,
    padding: 20,
    gap: 50,
  },
  topo: {
    gap: 25,
  },
  accountContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  accountBt: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },


  cardTreino:{
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    width: '100%',
    height: 140,
  },
  cardSentimentos:{
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    width: '100%',
    height: 140,
  },
  inferior:{
    display:'flex',
    alignItems:'center',
    flexDirection:'row',
    gap: 60
  },
  esquerda: {
    flex: 1,
    flexDirection: 'column',
    gap: 20
  },
  cardMapa: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    width: '115%',
    height: 180,
  },
  cardProgresso: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    width: '115%',
    height: 180,
  },
  cardRanking: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    width: '35%',
    height: 390,
  }, 
  gradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  titleRanking: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  smallText: {
    fontSize: 16,
    color: '#fff',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
  },
  imageTreino: {
    position: 'absolute',
    right: 35,
    width: 105,
    height: 105,
    bottom: 30,
    resizeMode: 'contain',
  },
  imageSentimentos: {
    position: 'absolute',
    right: 10,
    bottom: 40,
    width: 85,
    height: 85,
    resizeMode: 'contain',
  },
  imageMapa: {
    position: 'absolute',
    right: 35,
    width: 87,
    height: 87,
    bottom: 30,
    resizeMode: 'contain',
  },
  imageProgresso: {
    position: 'absolute',
    right: 40,
    width: 93,
    height: 93,
    bottom: 30,
    resizeMode: 'contain',
  },
  imageRanking: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    transform: [{ translateX: -60 }],
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },    
  imageCenter: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
});

export default HomeScreen;

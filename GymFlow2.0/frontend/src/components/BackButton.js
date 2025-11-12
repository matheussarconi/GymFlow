import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const BackButton = ({
  label = 'Voltar',
  color = '#fff',
  iconColor = 'black',
  size = 20,
  goTo,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (goTo) {
      navigation.navigate(goTo); // Vai para uma tela específica
    } else {
      navigation.goBack(); // Volta para a tela anterior
    }
  };

  return (
    <TouchableOpacity style={styles.backButton} onPress={handlePress} activeOpacity={0.7}>
      <Ionicons name="arrow-back-circle-sharp" size={size} color={iconColor} />
      <Text style={[styles.backButtonText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  },
});

export default BackButton;

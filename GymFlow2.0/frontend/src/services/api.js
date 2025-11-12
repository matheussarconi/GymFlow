import axios from 'axios';
import { Platform } from 'react-native';

// Configuração de URL base conforme plataforma
const getBaseURL = () => {
  // Se estiver rodando no emulador Android
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3030'; // IP especial para emulador Android
  }
  
  // Se estiver rodando no iOS ou web
  if (Platform.OS === 'ios' || Platform.OS === 'web') {
    return 'http://localhost:3030';
  }
  
  // Se estiver testando em dispositivo físico, use o IP da sua máquina
  // Substitua pelo seu IP local (ex: 192.168.1.100)
  // return 'http://192.168.1.100:3030';
  
  return 'http://localhost:3030';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
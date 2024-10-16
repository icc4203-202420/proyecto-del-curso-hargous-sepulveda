import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8', // Fondo opcional para el contenedor
  },
  signupForm: {
    width: '90%', // Usa un porcentaje en lugar de un maxWidth
    maxWidth: 400,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5, // Sombra para Android
    alignSelf: 'center', // Center the form within the container
  },
  signupInput: {
    width: '100%',
    padding: 10,
    marginTop: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f0f2f5',
    color: '#000',
    textAlign: 'left', // Asegura que el texto dentro del input esté alineado a la izquierda
  },
  signupButton: {
    width: '100%',
    padding: 10,
    backgroundColor: '#1877f2',
    color: '#fff',
    borderRadius: 5,
    fontSize: 16,
    cursor: 'pointer',
  },
  signupButtonHover: {
    backgroundColor: '#165dbb',
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
});

export default styles;

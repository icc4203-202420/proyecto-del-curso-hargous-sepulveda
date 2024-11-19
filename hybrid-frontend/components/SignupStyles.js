import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E2E42', 
  },
  signupForm: {
    width: '90%',
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
    elevation: 5, 
    alignSelf: 'center',
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
    textAlign: 'left', 
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
  link: {
    marginTop: 15,
    color: '#007bff',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
  title: {
    marginBottom: 20,
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
  },
});

export default styles;

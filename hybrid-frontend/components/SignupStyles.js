import { StyleSheet } from 'react-native';

const SignupStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  form: {
    maxWidth: 400,
    width: '100%',
    padding: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    marginTop: 5,
    marginBottom: 15,
    borderRadius: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#f0f2f5',
    color: '#000',
  },
  button: {
    width: '100%',
    padding: 10,
    backgroundColor: '#1877f2',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 10,
  },
});

export default SignupStyles;

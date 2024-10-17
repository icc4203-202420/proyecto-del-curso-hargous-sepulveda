import { StyleSheet, Platform } from 'react-native';

const LoginStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E2E42',
    padding: 20,
  },
  form: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4, // Shadow effect on Android
      },
      web: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      },
    }),
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f7f7f7',
  },
  inputError: {
    borderColor: 'red',
  },
  button: {
    width: '100%',
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorList: {
    color: 'red',
    marginTop: 10,
  },
  successMessage: {
    color: 'green',
    marginTop: 10,
  },
  userMessage: {
    color: '#333',
    marginTop: 10,
  },
  redirect: {
    color: '#007bff',
    marginTop: 10,
  },
  link: {
    textDecorationLine: 'underline',
  },
});

export default LoginStyles;

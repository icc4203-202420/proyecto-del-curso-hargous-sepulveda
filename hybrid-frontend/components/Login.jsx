import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { BACKEND_URL } from '@env'; 

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Email no válido').required('El email es requerido'),
  password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es requerida'),
});

const Login = ({ navigation }) => {
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'user[email]': values.email,
          'user[password]': values.password,
        }).toString(),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data); 

      if (response.ok) {
        setServerError('');

        setTimeout(() => {
          setSuccessMessage('Has sido logueado exitosamente.');


          const receivedToken = response.headers.get('Authorization');
          const user = data.status.data.user;

          if (user) {
            AsyncStorage.setItem('jwtToken', receivedToken);
            AsyncStorage.setItem('userId', String(user.id)); 
            AsyncStorage.setItem('userName', `${user.first_name} ${user.last_name}`);

            console.log('Token almacenado:', receivedToken);
            console.log('ID del usuario almacenado:', user.id);
            console.log('Nombre del usuario almacenado:', `${user.first_name} ${user.last_name}`);


            setTimeout(() => {
              navigation.navigate('Home');
              resetForm();
            }, 300); 
          } else {
            setServerError('Error: El usuario no fue devuelto en la respuesta.');
          }
        }, 300); 
      } else {
        setServerError(data.status.message || 'Correo electrónico o contraseña incorrectos.');
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      setServerError('Error en el servidor. Intenta nuevamente más tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View style={styles.form}>
            <Text style={styles.title}>Iniciar Sesión</Text>
            <TextInput
              style={styles.input}
              placeholder="Correo Electrónico"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              inputMode="email"
              autoCapitalize="none"
            />
            {touched.email && errors.email && (
              <Text style={styles.error}>{errors.email}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
            />
            {touched.password && errors.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}
            <Pressable style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Enviando...' : 'Iniciar Sesión'}
              </Text>
            </Pressable>
            {successMessage ? (
              <Text style={styles.success}>{successMessage}</Text>
            ) : null}
            {serverError ? (
              <Text style={styles.error}>{serverError}</Text>
            ) : null}
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.link}>
                ¿No tienes una cuenta? Regístrate aquí
              </Text>
            </Pressable>
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f4f7',
    padding: 20,
  },
  form: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    marginBottom: 20,
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
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
  button: {
    width: '100%',
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
  link: {
    marginTop: 15,
    color: '#007bff',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  success: {
    color: 'green',
    marginBottom: 10,
  },
});

export default Login;

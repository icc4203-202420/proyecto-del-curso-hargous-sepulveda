import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './SignupStyles'; 
import { BACKEND_URL } from '@env';  

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    handle: '',
    password: '',
    passwordConfirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigation = useNavigation();

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName) {
      newErrors.firstName = 'El nombre es obligatorio.';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'El apellido es obligatorio.';
    }

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        newErrors.email = 'Introduce un correo electrónico válido.';
      }
    }

    if (!formData.handle) {
      newErrors.handle = 'El nombre de usuario es obligatorio.';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Las contraseñas no coinciden.';
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            handle: formData.handle,
            password: formData.password,
            password_confirmation: formData.passwordConfirmation,
          },
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
  
        const existingUserErrors = [];
        if (errorData.errors) {
          if (errorData.errors.email) {
            existingUserErrors.push('El correo electrónico ya está en uso.');
          }
          if (errorData.errors.handle) {
            existingUserErrors.push('El nombre de usuario ya está en uso.');
          }
        }
  
        if (existingUserErrors.length > 0) {
          Alert.alert('Error', existingUserErrors.join('\n'));
        } else {
          Alert.alert('Error', 'Hubo un problema con la red.');
        }
        return;
      }
  
      const result = await response.json();
      console.log('Registro exitoso:', result);
      setSuccessMessage('Registro exitoso. Serás redirigido al inicio de sesión.');
      resetForm();
  
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
  
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo registrar. Inténtalo de nuevo.');
    }
  };
  

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      handle: '',
      password: '',
      passwordConfirmation: '',
    });
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <View style={styles.signupForm}>
      <TextInput
        style={styles.signupInput}
        placeholder="Nombre"
        value={formData.firstName}
        onChangeText={(value) => handleChange('firstName', value)}
      />
      {errors.firstName && <Text style={styles.error}>{errors.firstName}</Text>}

      <TextInput
        style={styles.signupInput}
        placeholder="Apellido"
        value={formData.lastName}
        onChangeText={(value) => handleChange('lastName', value)}
      />
      {errors.lastName && <Text style={styles.error}>{errors.lastName}</Text>}

      <TextInput
        style={styles.signupInput}
        placeholder="Correo electrónico"
        value={formData.email}
        onChangeText={(value) => handleChange('email', value)}
        keyboardType="email-address"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        style={styles.signupInput}
        placeholder="Nombre de usuario"
        value={formData.handle}
        onChangeText={(value) => handleChange('handle', value)}
      />
      {errors.handle && <Text style={styles.error}>{errors.handle}</Text>}

      <TextInput
        style={styles.signupInput}
        placeholder="Contraseña"
        value={formData.password}
        onChangeText={(value) => handleChange('password', value)}
        secureTextEntry
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <TextInput
        style={styles.signupInput}
        placeholder="Confirmar contraseña"
        value={formData.passwordConfirmation}
        onChangeText={(value) => handleChange('passwordConfirmation', value)}
        secureTextEntry
      />
      {errors.passwordConfirmation && <Text style={styles.error}>{errors.passwordConfirmation}</Text>}

      <Button title="Registrarse" onPress={handleSubmit} />
      {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}

      <Text>
        ¿Ya tienes una cuenta? 
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}> Iniciar sesión</Text>
      </Text>
    </View>
  );
};

export default Signup;

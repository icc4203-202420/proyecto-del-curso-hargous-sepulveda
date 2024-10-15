import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextStyle } from 'react-native';
import SignupStyles from './SignupStyles'; 

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignup = () => {
    if (!email || !password) {
      setError('Todos los campos son obligatorios.');
    } else {
      setError(null);
      console.log('Registering with', email, password);
    }
  };

  return (
    <View style={SignupStyles.container}>
      <View style={SignupStyles.form}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Registrarse</Text>
        <TextInput
          style={SignupStyles.input}
          placeholder="Correo Electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={SignupStyles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error && <Text style={SignupStyles.error}>{error}</Text>}
        <TouchableOpacity style={SignupStyles.button} onPress={handleSignup}>
          <Text style={SignupStyles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Signup;

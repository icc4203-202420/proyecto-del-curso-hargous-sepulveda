import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CreateReview = () => {
  return (
    <View style={styles.container}>
      <Text>Escribe tu evaluación aquí</Text>
      {/* Aquí podrías agregar tu formulario de evaluación */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CreateReview;

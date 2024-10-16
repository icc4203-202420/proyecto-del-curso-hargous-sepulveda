import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from "./Header";
const BarList = () => {
  return (
    <View style={styles.container1}>
      <Header/>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Aquí va BarList</Text>
    </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container1: {
    flex: 1,
    padding: 0,
    backgroundColor: '#525277',
  },});
export default BarList;

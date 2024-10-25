import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BeerList from './components/BeerList';
import BarList from './components/BarList';
import Events from './components/Events';
import Account from './components/Account';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Beer from './components/Beer';
import Bar from './components/Bar';
import { AuthProvider, useAuth } from './components/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Beers"
        component={BeerList}
        options={{
          tabBarIcon: () => <Icon name="beer" type="font-awesome" size={24} />,
          tabBarLabel: 'Beers',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Bars"
        component={BarList}
        options={{
          tabBarIcon: () => <Icon name="glass" type="font-awesome" size={24} />,
          tabBarLabel: 'Bars',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="HomeTab"
        component={Home}
        options={{
          tabBarIcon: () => <Icon name="home" type="font-awesome" size={24} />,
          tabBarLabel: 'Home',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Events"
        component={Events}
        options={{
          tabBarIcon: () => <Icon name="calendar" type="font-awesome" size={24} />,
          tabBarLabel: 'Events',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Account"
        component={Account}
        options={{
          tabBarIcon: () => <Icon name="user" type="font-awesome" size={24} />,
          tabBarLabel: 'Account',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <MainNavigator isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function MainNavigator({ isLoggedIn, setIsLoggedIn }) {
  const { loading } = useAuth();

  if (loading) {
    return null;  
  }

  return (
    <Stack.Navigator initialRouteName={isLoggedIn ? "Home" : "Login"}>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signup"
        component={Signup}
        options={{ headerShown: true, headerTitle: "Sign Up" }}
      />
      <Stack.Screen
        name="Home"
        component={Tabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BeerList"
        component={BeerList}
        options={{ headerTitle: "Beer List" }}
      />
      <Stack.Screen
        name="BarList"
        component={BarList}
        options={{ headerTitle: "Bar List" }}
      />
      <Stack.Screen
        name="Events"
        component={Events}
        options={{ headerTitle: "Events" }}
      />
      <Stack.Screen
        name="Beer"
        component={Beer}
        options={{ headerTitle: "Beer Details" }}
      />
      <Stack.Screen
        name="Bar"
        component={Bar}
        options={{ headerTitle: "Bar Details" }}
      />
    </Stack.Navigator>
  );
}

function RefreshHandler() {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Refrescando datos en cada redirección...');
    });

    return unsubscribe; 
  }, [navigation]);

  return null; 
}

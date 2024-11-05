import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications'; // Importa las notificaciones
import BeerList from './components/BeerList';
import BarList from './components/BarList';
import UserList from './components/UserList';
import EventList from './components/EventList';
import Account from './components/Account';
import EventDetails from './components/EventDetails';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Beer from './components/Beer';
import Bar from './components/Bar';
import UserProfile from './components/UserProfile';
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
        component={EventList}
        options={{
          tabBarIcon: () => <Icon name="calendar" type="font-awesome" size={24} />,
          tabBarLabel: 'Events',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="UserList"
        component={UserList}
        options={{
          tabBarButton: () => null, 
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
      const token = await SecureStore.getItemAsync('jwtToken');
      setIsLoggedIn(!!token);

      if (token) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Una Chelita???',
            body: 'Sigues Logeado en BeerHub...'
          },
          trigger: null,
        });
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <AuthProvider>
          <NavigationContainer>
            <MainNavigator isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaView>
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
        options={{ headerShown: false, headerTitle: "Beer List" }}
      />
      <Stack.Screen
        name="BarList"
        component={BarList}
        options={{ headerShown: false, headerTitle: "Bar List" }}
      />
      <Stack.Screen
        name="Events"
        component={EventList}
        options={{ headerShown: false, headerTitle: "Events" }}
      />
      <Stack.Screen
        name="Beer"
        component={Beer}
        options={{ headerTitle: "Beer Details" }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetails}
        options={{ headerTitle: "Event Details" }}
      />
      <Stack.Screen
        name="Bar"
        component={Bar}
        options={{ headerTitle: "Bar Details" }}
      />
      <Stack.Screen
        name="UserList"
        component={UserList}
        options={{ headerShown: false, headerTitle: "UserList" }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{ headerTitle: "User Details" }}
      />
    </Stack.Navigator>
  );
}

function RefreshHandler() {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Refrescando datos en cada redirecciÃ³n...');
    });

    return unsubscribe; 
  }, [navigation]);

  return null; 
}

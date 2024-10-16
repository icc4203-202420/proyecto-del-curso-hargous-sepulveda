import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import BeerList from './components/BeerList';
import BarList from './components/BarList';
import Events from './components/Events';
import Account from './components/Account';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Beer from './components/Beer';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Beers"
        component={BeerList}
        options={{
          tabBarIcon: () => <Icon name="beer" type="font-awesome" />,
        }}
      />
      <Tab.Screen
        name="Bars"
        component={BarList}
        options={{
          tabBarIcon: () => <Icon name="glass" type="font-awesome" />,
        }}
      />
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: () => <Icon name="home" type="font-awesome" />,
        }}
      />
      <Tab.Screen
        name="Events"
        component={Events}
        options={{
          tabBarIcon: () => <Icon name="calendar" type="font-awesome" />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={Account}
        options={{
          tabBarIcon: () => <Icon name="user" type="font-awesome" />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Home" component={Tabs} /> 
        <Stack.Screen name="Beer" component={Beer} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}


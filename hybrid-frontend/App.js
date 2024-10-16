import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import { NavigationContainer } from '@react-navigation/native';
import BeerList from './components/BeerList';
import BarList from './components/BarList';
import Events from './components/Events';
import Account from './components/Account';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';


const Tab = createBottomTabNavigator();

export default function Footer() {



  return (
    <NavigationContainer>
      <Tab.Navigator>
        {/* Tabs visible only when authenticated */}
        {(
          <>
            <Tab.Screen
              name="Beers"
              component={BeerList}
              options={{
                tabBarIcon: () => <Icon name="beer" type="font-awesome" />
              }}
            />
            <Tab.Screen
              name="Bars"
              component={BarList}
              options={{
                tabBarIcon: () => <Icon name="glass" type="font-awesome" />
              }}
            />
            <Tab.Screen
              name="Home"
              component={Home}
              options={{
                tabBarIcon: () => <Icon name="home" type="font-awesome" />
              }}
            />
            <Tab.Screen
              name="Events"
              component={Events}
              options={{
                tabBarIcon: () => <Icon name="calendar" type="font-awesome" />
              }}
            />
            <Tab.Screen
              name="Account"
              component={Account}
              options={{
                tabBarIcon: () => <Icon name="user" type="font-awesome" />
              }}
            />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}


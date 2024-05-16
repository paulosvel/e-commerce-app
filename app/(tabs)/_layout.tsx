import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CategorySelection from "../../components/CategorySelection";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import HomeStack from "../../navigators/gridNavigator";
const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: "Αρχική",
          headerShown: false,
          tabBarIcon: ({}) => <Entypo name="home" size={24} color="black" />,
        }}
      />
      <Tab.Screen
        name="Test"
        component={CategorySelection}
        options={{
          tabBarLabel: "",
          // tabBarButton:()=> null,
          headerShown: false,
          tabBarIcon: ({}) => (
            <Ionicons name="barcode-outline" size={24} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="Test2"
        component={CategorySelection}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({}) => (
            <Feather name="shopping-cart" size={24} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="Test3"
        component={CategorySelection}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({}) => (
            <FontAwesome5 name="gas-pump" size={24} color="black" />
          ),
          // tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Test4"
        component={CategorySelection}
        options={{
          tabBarLabel: "",

          tabBarIcon: ({}) => <Entypo name="list" size={24} color="black" />,
          // tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
}

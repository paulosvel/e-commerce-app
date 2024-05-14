import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategorySelection from "../components/CategorySelection";
import ProductDetailsComponent from "../components/ProductDetailsComponent";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        title: "",
        headerShadowVisible: false, // applied here
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="CategorySelection"
        component={CategorySelection}
        options={{
          headerShown: false,
          headerTitle: "Category Selection",
        }}
      />
      <Stack.Screen
        name="ProductDetailsComponent"
        component={ProductDetailsComponent}
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: {
            backgroundColor: "#007AFF",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack.Navigator>
  );
}

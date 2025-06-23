import {
  Montserrat_400Regular,
  Montserrat_700Bold,
  useFonts,
} from "@expo-google-fonts/montserrat";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppLoading from "expo-app-loading";
import LoginScreen from "./pages/accounts/LoginScreen";
import RegisterScreen from "./pages/accounts/RegisterScreen";
import Main from "./pages/Main";
import AddProductScreen from "./pages/products/AddProductScreen";
import AllProductsScreen from "./pages/products/AllProductsScreen";
import EditProductScreen from "./pages/products/EditProductScreen";
import MyProductsScreen from "./pages/products/MyProductsScreen";
import ProductDetailScreen from "./pages/products/ProductDetailScreen";
import PublicProfileScreen from "./pages/products/PublicProfileScreen";
import EditProfileScreen from "./pages/profile/EditProfileScreen";
import MyProfileScreen from "./pages/profile/MyProfileScreen";
import SettingsScreen from "./pages/SettingsScreen";
import WelcomeScreen from "./pages/WelcomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  const screenOptions = {
    headerTitle: "SWAPIFY",
    headerStyle: { backgroundColor: "#153243" },
    headerTintColor: "#fff",
    headerTitleStyle: { fontWeight: "bold", fontFamily: "Montserrat_700Bold" },
    gestureEnabled: true,
    animation: "slide_from_right",
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions} initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="MyProfile" component={MyProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} />
        <Stack.Screen name="MyProduct" component={MyProductsScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="EditProduct" component={EditProductScreen} />
        <Stack.Screen name="AllProducts" component={AllProductsScreen}  />
        <Stack.Screen name="SettingScreen" component={SettingsScreen} />
        <Stack.Screen
          name="PublicProfile"
          component={PublicProfileScreen}
          options={({ route }) => ({ title: route.params.username })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

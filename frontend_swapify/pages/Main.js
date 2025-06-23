// import { StyleSheet, Text, View } from "react-native";

// export default function Main({ navigation }) {
//   return (
//     <View style={styles.container}>
//       <Text onPress={() => navigation.navigate("MyProfile")}>profile</Text>
//       <Text onPress={() => navigation.navigate("AllProducts")}>Tüm Ürünler</Text>
//       <Text onPress={() => navigation.navigate("SettingScreen")}>Çıkış</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     paddingTop: 50,
//     gap: 40,
//   },
// });

import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AllProductsScreen from "./products/AllProductsScreen";
import MyProfileScreen from "./profile/MyProfileScreen";

const Tab = createBottomTabNavigator();

export default function Main() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#153243",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Ürünler") {
            iconName = focused ? "list-circle" : "list-circle-outline";
          } else if (route.name === "Profil") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Ürünler" component={AllProductsScreen} />
      <Tab.Screen name="Profil" component={MyProfileScreen} />
    </Tab.Navigator>
  );
}

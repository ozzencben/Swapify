import { StyleSheet, Text, View } from "react-native";

export default function Main({ navigation }) {
  return (
    <View style={styles.container}>
      <Text onPress={() => navigation.navigate("MyProfile")}>profile</Text>
      <Text onPress={() => navigation.navigate("AddProduct")}>Add Product</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
    gap: 40,
  },
});

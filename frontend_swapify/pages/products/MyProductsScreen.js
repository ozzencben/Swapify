import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getMyProducts } from "../../api/ApiProductsService";

export default function MyProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchMyProducts();
    }, [])
  );

  const fetchMyProducts = async () => {
    setLoading(true);
    try {
      const response = await getMyProducts();
      setProducts(response.data);
    } catch (error) {
      console.error("Ürünler alınırken hata oluştu", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() =>
        navigation.navigate("ProductDetail", {
          productId: item.id,
          onProductDeleted: fetchMyProducts,
        })
      }
      style={({ pressed }) => [styles.buttonBox, pressed && styles.pressed]}
    >
      <Text style={styles.title}> {item.title} </Text>
      <Text style={styles.description}> {item.description} </Text>
    </Pressable>
  );

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.container}>
      {products.length === 0 ? (
        <Text>Henüz ürün eklemediniz.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  buttonBox: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
  },
  description: {
    marginTop: 4,
    color: "#555",
  },
});

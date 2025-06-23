import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getProductById, updateProduct } from "../../api/ApiProductsService";
import api from "../../api/api";

export default function EditProductScreen({ route, navigation }) {
  const { productId } = route.params;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [isSale, setIsSale] = useState(false);
  const [isTrade, setIsTrade] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("products/categories/");
      setCategories(res.data);
    } catch (err) {
      console.error("Kategoriler alınamadı", err);
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await getProductById(productId);
      setTitle(data.title);
      setDescription(data.description);
      setLocation(data.location);
      setPrice(data.price ? data.price.toString() : "");
      setIsSale(data.is_sale);
      setIsTrade(data.is_trade);
      setCategoryId(data.category?.id || null);
    } catch (err) {
      Alert.alert("Hata", "Ürün bilgisi alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!title || !description || !categoryId) {
      Alert.alert("Tüm alanları doldurun");
      return;
    }

    try {
      await updateProduct(productId, {
        title,
        description,
        location,
        price: parseFloat(price),
        is_sale: isSale,
        is_trade: isTrade,
        category_id: categoryId,
      });

      Alert.alert("Başarılı", "Ürün güncellendi");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Hata", "Ürün güncellenemedi");
      console.error(err);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Başlık</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} />

      <Text style={styles.label}>Açıklama</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 80 }]}
        multiline
      />

      <Text style={styles.label}>Konum</Text>
      <TextInput
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />

      <Text style={styles.label}>Fiyat</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Kategori</Text>
      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setCategoryId(cat.id)}
            style={[
              styles.categoryButton,
              categoryId === cat.id && styles.categorySelected,
            ]}
          >
            <Text style={styles.categoryText}>{cat.name}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.toggleContainer}>
        <Pressable
          onPress={() => setIsSale(!isSale)}
          style={[styles.toggleButton, isSale && styles.toggleActive]}
        >
          <Text style={styles.toggleText}>
            {isSale ? "Satılık ✔️" : "Satılık Değil"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setIsTrade(!isTrade)}
          style={[styles.toggleButton, isTrade && styles.toggleActive]}
        >
          <Text style={styles.toggleText}>
            {isTrade ? "Takasa Uygun ✔️" : "Takas Yok"}
          </Text>
        </Pressable>
      </View>

      <Pressable onPress={handleUpdate} style={styles.submitButton}>
        <Text style={styles.submitText}>Güncelle</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 10,
  },
  categoryButton: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  categorySelected: {
    backgroundColor: "#4CAF50",
  },
  categoryText: {
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginVertical: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#ccc",
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#2196F3",
  },
  toggleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

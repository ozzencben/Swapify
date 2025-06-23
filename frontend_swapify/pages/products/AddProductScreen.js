import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import api from "../../api/api";

const AddProductScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isTrade, setIsTrade] = useState(false);
  const [isSale, setIsSale] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("İzin gerekli", "Görsel seçmek için izin vermelisiniz.");
      }
    })();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("products/categories/");
      setCategories(response.data);
    } catch (error) {
      Alert.alert("Kategori alınamadı", error.message);
    }
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsMultipleSelection: true,
        selectionLimit: 5, // Android'de bazı sürümlerde gerekiyor
        quality: 1,
      });

      if (!result.canceled) {
        console.log("Seçilen görseller:", result.assets);
        setImages(result.assets);
      }
    } catch (error) {
      console.error("Görsel seçerken hata:", error);
    }
  };

  const handleAddProduct = async () => {
    if (!title || !description || !categoryId || (!isSale && !isTrade)) {
      Alert.alert("Lütfen tüm gerekli alanları doldurun.");
      return;
    }

    try {
      const productRes = await api.post("products/items/", {
        title,
        description,
        location,
        category: categoryId,
        is_trade: isTrade,
        is_sale: isSale,
      });

      const productId = productRes.data.id;

      for (const asset of images) {
        const formData = new FormData();
        formData.append("image", {
          uri: asset.uri,
          type: "image/jpeg",
          name: `image-${Date.now()}.jpg`,
        });

        await api.post(`products/items/${productId}/upload_image/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      Alert.alert("Ürün başarıyla eklendi!");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Ürün eklenemedi", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.label}>Başlık</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
        />

        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={description}
          onChangeText={setDescription}
          multiline
          blurOnSubmit={false}
          returnKeyType="done"
        />

        <Text style={styles.label}>Konum</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          returnKeyType="next"
        />

        <Text style={styles.label}>Kategori</Text>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setCategoryId(cat.id)}
              style={({ pressed }) => [
                styles.categoryButton,
                categoryId === cat.id && styles.categorySelected,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.categoryText}>{cat.name}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.toggleContainer}>
          <Pressable
            onPress={() => setIsSale(!isSale)}
            style={({ pressed }) => [
              styles.toggleButton,
              isSale && styles.toggleActive,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.toggleText}>
              {isSale ? "Satılık ✔️" : "Satılık Değil"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setIsTrade(!isTrade)}
            style={({ pressed }) => [
              styles.toggleButton,
              isTrade && styles.toggleActive,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.toggleText}>
              {isTrade ? "Takasa Uygun ✔️" : "Takas Yok"}
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={pickImages} style={styles.imagePicker}>
          <Text style={styles.imagePickerText}>Resim Seç</Text>
        </Pressable>

        {images.length > 0 &&
          images.map((img, i) => (
            <Image
              key={i}
              source={{ uri: img.uri }}
              style={styles.previewImage}
            />
          ))}

        <Pressable onPress={handleAddProduct} style={styles.submitButton}>
          <Text style={styles.submitText}>Ürünü Ekle</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
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
  imagePicker: {
    marginTop: 20,
    backgroundColor: "#ff9800",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  imagePickerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 10,
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

export default AddProductScreen;

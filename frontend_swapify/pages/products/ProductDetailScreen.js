import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { deleteProduct, getProductById } from "../../api/ApiProductsService";

export default function ProductDetailScreen({ route, navigation }) {
  const { productId, onProductDeleted } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchProductDetail();
    }, [])
  );

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      const data = await getProductById(productId);
      setProduct(data);

      const storedUsername = await AsyncStorage.getItem("username");
      setIsOwner(
        storedUsername?.toLowerCase() === data.owner_username?.toLowerCase()
      );
    } catch (error) {
      Alert.alert("Hata", "Ürün bilgisi alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Silme Onayı", "Bu ürünü silmek istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(productId);
            Alert.alert("Başarılı", "Ürün silindi.");
            if (onProductDeleted) {
              onProductDeleted();
            }
            navigation.goBack();
          } catch (error) {
            Alert.alert("Hata", "Ürün silinirken hata oluştu.");
          }
        },
      },
    ]);
  };

  if (loading || !product) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  const firstImageUri =
    product.images && product.images.length > 0
      ? product.images[0].image
      : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{product.title}</Text>

      {firstImageUri && (
        <>
          <Pressable onPress={() => setModalVisible(true)}>
            <Image source={{ uri: firstImageUri }} style={styles.image} />
          </Pressable>
          <Modal visible={modalVisible} transparent>
            <View style={styles.modalContainer}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.modalBackdrop}
              >
                <Image
                  source={{ uri: firstImageUri }}
                  style={styles.modalImage}
                />
              </Pressable>
            </View>
          </Modal>
        </>
      )}

      <Text style={styles.description}>{product.description}</Text>

      {/* Bilgi Kutuları */}
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>💰 Fiyat:</Text>
        <Text style={styles.infoValue}>
          {product.price ? `${product.price} ₺` : "Belirtilmemiş"}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>📍 Konum:</Text>
        <Text style={styles.infoValue}>
          {product.location || "Belirtilmemiş"}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>📂 Kategori:</Text>
        <Text style={styles.infoValue}>
          {product.category?.name || "Kategori yok"}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>🛒 Satılık mı?:</Text>
        <Text style={styles.infoValue}>
          {product.is_sale ? "Evet" : "Hayır"}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>🔁 Takasa uygun mu?:</Text>
        <Text style={styles.infoValue}>
          {product.is_trade ? "Evet" : "Hayır"}
        </Text>
      </View>

      <Text
        style={[styles.infoValue, styles.ownerLink]}
        onPress={() =>
          navigation.navigate("PublicProfile", {
            username: product.owner_username,
          })
        }
      >
        Satıcı: {product.owner_username}
      </Text>

      <View style={styles.buttonContainer}>
        {isOwner ? (
          <>
            <Pressable
              onPress={() => navigation.navigate("EditProduct", { productId })}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.actionButtonText}>Düzenle</Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.actionButton,
                styles.deleteButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.actionButtonText}>Sil</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={() =>
              Alert.alert(
                "Teklif Ver",
                "Teklif verme özelliği yakında eklenecek."
              )
            }
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.actionButtonText}>Teklif Ver</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#153243",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    color: "#444",
  },
  infoBox: {
    backgroundColor: "#f1f4f6",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#153243",
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
  },
  ownerLink: {
    marginTop: 8,
    textAlign: "right",
    color: "#1e90ff",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#153243",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#c62828",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
    borderRadius: 12,
  },
});

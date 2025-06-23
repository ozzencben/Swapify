import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getPublicProfile } from "../../api/ApiAccountsService";
import { getProducts } from "../../api/ApiProductsService";

export default function PublicProfileScreen({ route, navigation }) {
  const { username } = route.params;
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchProducts();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getPublicProfile(username);
      setProfile(data);
    } catch (error) {
      Alert.alert("Hata", "Kullanıcı profili alınamadı.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts({ owner__username: username });
      setProducts(data);
    } catch (error) {
      Alert.alert("Hata", "Ürünler alınamadı.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const renderProduct = ({ item }) => (
    <Pressable
      style={styles.productContainer}
      onPress={() =>
        navigation.navigate("ProductDetail", { productId: item.id })
      }
    >
      {item.images?.[0]?.image ? (
        <Image
          source={{ uri: item.images[0].image }}
          style={styles.productImage}
        />
      ) : (
        <View style={[styles.productImage, styles.noImage]}>
          <Text>Resim yok</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text>{item.price ? `${item.price} ₺` : "Fiyat yok"}</Text>
      </View>
    </Pressable>
  );

  if (loadingProfile || loadingProducts) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>Kullanıcı bulunamadı.</Text>
      </View>
    );
  }

  // Profil fotoğrafı için fallback baş harf
  const initials = profile.username
    ? profile.username.charAt(0).toUpperCase()
    : "?";

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        {profile.profile_image ? (
          <Image
            source={{ uri: profile.profile_image }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text style={styles.profileInitial}>{initials}</Text>
          </View>
        )}

        <View style={styles.profileInfo}>
          <Text style={styles.username}>{profile.username}</Text>
          {profile.email && <Text style={styles.email}>{profile.email}</Text>}
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          {profile.date_joined && (
            <Text style={styles.joinDate}>
              Üye: {new Date(profile.date_joined).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Ürünler</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        ListEmptyComponent={
          <Text style={{ textAlign: "center" }}>
            Bu kullanıcıya ait ürün yok.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileHeader: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#888",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: { fontSize: 24, fontWeight: "bold" },
  email: { fontSize: 14, color: "#666", marginTop: 4 },
  bio: { fontSize: 16, marginTop: 8, fontStyle: "italic" },
  joinDate: { fontSize: 12, color: "#999", marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  productContainer: {
    flexDirection: "row",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  productImage: { width: 100, height: 100 },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  productInfo: { flex: 1, padding: 8, justifyContent: "center" },
  productTitle: { fontSize: 16, fontWeight: "600" },
});

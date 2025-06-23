import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getCategories, getProducts } from "../../api/ApiProductsService";

export default function AllProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isTrade, setIsTrade] = useState(null);
  const [isSale, setIsSale] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchFilters();
      fetchProducts();
    }, [])
  );

  const fetchFilters = async () => {
    try {
      const categoryData = await getCategories();
      setCategories(categoryData);
    } catch (err) {
      console.log("Kategori alınamadı", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts();
      setProducts(response);
    } catch (error) {
      console.error("Ürünler alınamadı.", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchTrade = isTrade === null || item.is_trade === isTrade;
    const matchSale = isSale === null || item.is_sale === isSale;
    const matchCategory =
      selectedCategory === null || item.category === selectedCategory;

    return matchSearch && matchTrade && matchSale && matchCategory;
  });

  const renderItem = ({ item }) => {
    const firstImageUri =
      item.images?.[0]?.image ?? "https://via.placeholder.com/100";
    const labels = [];
    if (item.is_sale) labels.push("Satılık");
    if (item.is_trade) labels.push("Takas");

    return (
      <Pressable
        onPress={() =>
          navigation.navigate("ProductDetail", { productId: item.id })
        }
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressed,
        ]}
      >
        <Image source={{ uri: firstImageUri }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.badgesContainer}>
            {labels.map((label) => (
              <View key={label} style={styles.badge}>
                <Text style={styles.badgeText}>{label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.price}>
            {item.price ? `${item.price} ₺` : "Fiyat: Belirtilmemiş"}
          </Text>
          <Text style={styles.owner}>Satıcı: {item.owner_username}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Ürün ara..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#999"
      />

      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.filterButton,
            isSale && styles.activeFilterButton,
          ]}
          onPress={() => setIsSale(isSale === true ? null : true)}
        >
          <Text
            style={[
              styles.filterText,
              isSale && styles.activeFilterText,
            ]}
          >
            Satılık
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            isTrade && styles.activeFilterButton,
          ]}
          onPress={() => setIsTrade(isTrade === true ? null : true)}
        >
          <Text
            style={[
              styles.filterText,
              isTrade && styles.activeFilterText,
            ]}
          >
            Takas
          </Text>
        </Pressable>
      </View>

      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Tüm Kategoriler" value={null} />
        {categories.map((cat) => (
          <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
        ))}
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" color="#153243" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>Hiç ürün bulunamadı.</Text>}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f5f7",
    padding: 12,
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  activeFilterButton: {
    backgroundColor: "#153243",
  },
  filterText: {
    color: "#333",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "600",
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  image: {
    width: 100,
    height: 100,
  },
  infoContainer: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#153243",
  },
  description: {
    fontSize: 14,
    color: "#333",
    marginVertical: 4,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 6,
    marginVertical: 4,
  },
  badge: {
    backgroundColor: "#153243",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  owner: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#666",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#555",
  },
});

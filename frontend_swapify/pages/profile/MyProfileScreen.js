import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getMyProfile, updateProfileImage } from "../../api/ApiAccountsService";

export default function MyProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
    } catch (error) {
      console.error("Profil alınamadı", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeProfileImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Galeriye erişim izni gerekli!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      try {
        await updateProfileImage(imageUri);
        fetchProfile(); // Profil güncellendikten sonra yeniden veri çek
      } catch (error) {
        console.error("Fotoğraf güncelleme hatası", error);
        alert("Profil fotoğrafı güncellenemedi.");
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Profil verisi alınamadı.</Text>
      </View>
    );
  }

  const initial = profile.username?.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {profile.profile_image ? (
          <Image
            source={{ uri: profile.profile_image }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        )}

        <Pressable
          onPress={handleChangeProfileImage}
          style={({ pressed }) => [
            styles.cameraButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Ionicons name="camera" size={20} color="#4F46E5" />
        </Pressable>
      </View>

      <Text style={styles.name}>
        {profile.first_name} {profile.last_name}
      </Text>
      <Text style={styles.email}>{profile.email}</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Kullanıcı Adı:</Text>
        <Text>{profile.username}</Text>

        {profile.bio ? (
          <>
            <Text style={styles.label}>Hakkında:</Text>
            <Text>{profile.bio}</Text>
          </>
        ) : null}

        {profile.location ? (
          <>
            <Text style={styles.label}>Konum:</Text>
            <Text>{profile.location}</Text>
          </>
        ) : null}
      </View>

      <Pressable
        onPress={() => navigation.navigate("EditProfile")}
        style={({ pressed }) => [
          styles.updateButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={styles.updateButtonText}>Bilgileri Güncelle</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
  },
  avatarContainer: {
    alignSelf: "center",
    position: "relative",
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  avatarFallback: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
    elevation: 3,
  },
  name: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 12,
  },
  email: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  label: {
    fontWeight: "bold",
    marginTop: 8,
    color: "#374151",
  },
  updateButton: {
    marginTop: 24,
    backgroundColor: "#153243",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

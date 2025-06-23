import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getMyProfile, updateMyProfile } from "../../api/ApiAccountsService";

export default function EditProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigation = useNavigation();

  // Form alanları
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setBio(data.bio || "");
        setLocation(data.location || "");
        setProfileImage(data.profile_image || null);
      } catch (error) {
        Alert.alert("Hata", "Profil bilgileri alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("İzin Gerekli", "Fotoğraf seçmek için izin vermelisiniz.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.cancelled) {
      setProfileImage(result.uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // profileImage uri ise, backend'e uygun formatta göndermek gerekebilir (FormData)
      // Burada basitçe örnek olarak json kullanılıyor, ihtiyaç halinde multipart/form-data yapmalısın.
      const updatedData = {
        first_name: firstName,
        last_name: lastName,
        bio,
        location,
        // profile_image: profileImage, // backend multipart/form-data beklerse burası değişecek
      };

      await updateMyProfile(updatedData, profileImage);
      Alert.alert("Başarılı", "Profil güncellendi.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Hata", "Profil güncelleme başarısız.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={pickImage} style={styles.avatarContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>
              {(profile?.username || "U").charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.changePhotoText}>Fotoğrafı Değiştir</Text>
      </Pressable>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Ad</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Adınızı girin"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Soyad</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Soyadınızı girin"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Hakkında</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={bio}
          onChangeText={setBio}
          placeholder="Kendiniz hakkında kısa bilgi"
          multiline
          maxLength={500}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Konum</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Konumunuzu girin"
        />
      </View>

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={({ pressed }) => [
          styles.saveButton,
          {
            opacity: pressed ? 0.7 : 1,
            backgroundColor: saving ? "#a5b4fc" : "#153243",
          },
        ]}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Kaydediliyor..." : "Güncelle"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
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
  changePhotoText: {
    marginTop: 8,
    color: "#153243",
    fontWeight: "600",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

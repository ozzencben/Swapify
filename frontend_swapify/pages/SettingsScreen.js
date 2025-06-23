import { Alert, Button } from "react-native";
import { logout } from "../api/ApiAccountsService";

export default function SettingsScreen({ navigation }) {
  const handleLogout = async () => {
    try {
      await logout();
      // Kullanıcıyı login ekranına yönlendir
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      Alert.alert("Hata", "Çıkış yapılırken bir hata oluştu.");
    }
  };

  return <Button title="Çıkış Yap" onPress={handleLogout} />;
}

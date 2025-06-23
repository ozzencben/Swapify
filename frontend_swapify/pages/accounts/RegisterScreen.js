import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { register } from "../../api/ApiAccountsService";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_again, setPassword_again] = useState("");

  const handleRegister = async () => {
    console.log("handleRegister çağrıldı");
    if (password !== password_again) {
      Alert.alert("Hata", "Şifreler eşleşmiyor. Lütfen kontrol edin.");
      return;
    }
    try {
      await register({
        username,
        first_name,
        last_name,
        email,
        password,
        password_again,
      });
      navigation.navigate("Login");
    } catch (error) {
      console.error("Kayıt başarısız", error);
      Alert.alert(
        "Hata",
        "Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin ve tekrar deneyin."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", width: "100%" }}>
        <Text style={styles.text}>
          Belki senin de ataşın bir eve dönüşecek.
        </Text>
        <Text style={styles.bigText}>Hadi, Kayıt Ol.</Text>
      </View>
      <View style={{ alignItems: "center", width: "80%" }}>
        <TextInput
          style={styles.input}
          placeholder="Kullanıcı Adı"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="İsim"
          value={first_name}
          onChangeText={setFirst_name}
        />
        <TextInput
          style={styles.input}
          placeholder="Soyisim"
          value={last_name}
          onChangeText={setLast_name}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre Tekrar"
          value={password_again}
          onChangeText={setPassword_again}
          secureTextEntry={true}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [styles.buttonBox, pressed && styles.pressed]}
          onPress={handleRegister}
        >
          {({ pressed }) => (
            <Text
              style={[styles.button, { color: pressed ? "#fff" : "#153243" }]}
            >
              Kayıt Ol
            </Text>
          )}
        </Pressable>
        <View style={styles.questionBox}>
          <Text style={styles.question}>Ya da zaten bir hesabın var mı?</Text>
          <Text
            style={{
              fontWeight: "bold",
              textDecorationLine: "underline",
              top: -20,
            }}
            onPress={() => navigation.navigate("Login")}
          >
            Giriş Yap
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
    paddingTop: 30,
  },
  text: {
    fontSize: 18,
    fontFamily: "Montserrat_400Regular",
    textAlign: "center",
    width: "60%",
  },
  bigText: {
    fontSize: 30,
    fontFamily: "Montserrat_400Regular",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#153243",
    fontSize: 18,
    fontFamily: "Montserrat_400Regular",
    marginBottom: 15,
    paddingVertical: 5,
  },
  buttonContainer: {
    marginVertical: 40,
    gap: 20,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonBox: {
    borderWidth: 1,
    borderColor: "#153243",
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
  },
  pressed: {
    backgroundColor: "#284B63",
  },
  button: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
  },
  questionBox: { alignItems: "center" },
  question: {
    fontFamily: "Montserrat_400Regular",
    color: "#153243",
    fontSize: 16,
    textAlign: "center",
    width: "50%",
  },
});

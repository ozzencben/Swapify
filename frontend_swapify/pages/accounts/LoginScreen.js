import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { login } from "../../api/ApiAccountsService";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await login(username, password);
      navigation.navigate("AllProducts");
    } catch (error) {
      console.error("Giriş başarısız", error);
      Alert.alert("Hata", "Kullanıcı adı veya şifre hatalı");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Seni görmek ne güzel!</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Kullanıcı Adı"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [styles.buttonBox, pressed && styles.pressed]}
          onPress={handleLogin}
        >
          {({ pressed }) => (
            <Text
              style={[styles.button, { color: pressed ? "#fff" : "#153243" }]}
            >
              Giriş Yap
            </Text>
          )}
        </Pressable>
        <View style={styles.questionBox}>
          <Text style={styles.question}>Ya da henüz bir hesabın yok mu?</Text>
          <Text
            style={{
              fontWeight: "bold",
              textDecorationLine: "underline",
              top: -20,
            }}
            onPress={() => navigation.navigate("Register")}
          >
            Kaydol
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
    paddingTop: 100,
    gap: 10,
  },
  heading: {
    fontSize: 40,
    fontFamily: "Montserrat_400Regular",
    color: "#153243",
    textAlign: "center",
    width: "85%",
  },
  inputContainer: {
    width: "80%",
    gap: 20,
    marginTop: 30,
  },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#153243",
    fontSize: 18,
    fontFamily: "Montserrat_400Regular",
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
    borderBottomColor: "#153243",
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
  },
  pressed: {
    backgroundColor: "#284B63",
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

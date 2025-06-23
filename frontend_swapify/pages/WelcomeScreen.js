import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={{ width: "100%", alignItems: "center" }}>
        <Text style={styles.heading}>Swapify: Anında Takas</Text>
        <Image
          source={require("../assets/images/swap-rm-bg.png")}
          style={styles.image}
        />
        <Text style={styles.sentence}>
          Kullanmadığını değiştir, ihtiyacını keşfet!
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [styles.buttonBox, pressed && styles.pressed]}
        >
          {({ pressed }) => (
            <Text
              style={[styles.button, { color: pressed ? "#fff" : "#153243" }]}
            >
              Kayıt Ol
            </Text>
          )}
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.buttonBox, pressed && styles.pressed]}
          onPress={() => navigation.navigate("Login")}
        >
          {({ pressed }) => (
            <Text
              style={[styles.button, { color: pressed ? "#fff" : "#153243" }]}
            >
              Giriş Yap
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 80,
    paddingTop: 20,
  },
  heading: {
    fontFamily: "Montserrat_400Regular",
    textAlign: "center",
    fontSize: 18,
    top: 50,
  },
  sentence: {
    textTransform: "uppercase",
    fontSize: 20,
    fontFamily: "Montserrat_400Regular",
    textAlign: "center",
    width: "70%",
    top: -50,
  },
  image: {
    width: "100%",
    height: 400,
    resizeMode: "contain",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "85%",
  },
  buttonBox: {
    // backgroundColor: "#153243",
    borderWidth: 1,
    borderColor: "#153243",
    padding: 10,
    borderRadius: 10,
    width: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    fontSize: 18,
    color: "#153243",
  },
  pressed: {
    backgroundColor: "#284B63",
  },
});

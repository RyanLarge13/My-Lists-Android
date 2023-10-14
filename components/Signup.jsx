import { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Animated, TextInput } from "react-native";
import Toast from "react-native-toast-message";
import Ripple from "react-native-material-ripple";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Axios from "axios";

const Signup = ({ setUser, setLoading, setLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const slideIn = useRef(new Animated.Value(100)).current;

  const toast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
    });
  };

  useEffect(() => {
    Animated.spring(slideIn, {
      toValue: 0,
      duration: 750,
      useNativeDriver: true,
      friction: 2,
    }).start();
  }, []);

  const signup = () => {
    if (!username || !email || !password) {
      return toast(
        "error",
        "Incomplete form",
        `Please complete the form to signup!`
      );
    }
    const newUser = {
      id: ObjectId.createFromTime(new Date().getSeconds()),
      username,
      email,
      password,
      lists: [],
    };
    if (!online) {
      AsyncStorage.getItem("user")
        .then((res, err) => {
          if (err || !res) {
            AsyncStorage.setItem("user", JSON.stringify(newUser));
            setUser(user);
            toast(
              "success",
              "New Account Created!",
              `please sign in ${newUser.username}`
            );
            setLogin(true);
          }
          if (res) {
            const storedUser = JSON.parse(res);
            if (
              username === storedUser.username ||
              email === storedUser.email ||
              password === storedUser.password
            ) {
              setLogin(true);
              toast(
                "error",
                "Your account already exsists",
                `Please login ${storedUser.username}`
              );
            }
            if (
              username !== storedUser.username ||
              email !== storedUser.email ||
              password !== storedUser.password
            ) {
              toast(
                "error",
                "An Account Already Exsists",
                `please sign in as ${storedUser.username}`
              );
              setLogin(true);
            }
          }
        })
        .catch((err) => {
          AsyncStorage.setItem("user", JSON.stringify(newUser));
          setUser(user);
          toast(
            "auccess",
            "New Account Created!",
            `please login ${newUser.username}`
          );
        });
    }
    if (!!online) {
      setLoading(true);
      Axios.post("https://my-lists-android-production.up.railway.app/signup", {
        username,
        email,
        password,
      })
        .then((res) => {
          toast(
            "success",
            "Your New Account Was Created!",
            `You can now login ${username}`
          );
          setLoading(false);
          setTimeout(() => {
            setLogin(true);
          }, 1000);
        })
        .catch((err) => {
          if (err.response) {
            setLoading(false);
            toast("error", err.response.data.message);
          }
          if (!err.repsonse) {
            setLoading(false);
            AsyncStorage.getItem("user")
              .then((res, err) => {
                if (err || !res) {
                  AsyncStorage.setItem("user", JSON.stringify(newUser));
                  setUser(user);
                  setLogin(true);
                  toast(
                    "success",
                    "New Account Created!",
                    `please login ${newUser.username}`
                  );
                }
                if (res) {
                  const storedUser = JSON.parse(res);
                  if (
                    username === storedUser.username ||
                    email === storedUser.email ||
                    password === storedUser.password
                  ) {
                    setLogin(true);
                    toast(
                      "error",
                      "Your account already exsists",
                      `Please login ${storedUser.username}`
                    );
                  }
                  if (
                    username !== storedUser.username ||
                    email !== storedUser.email ||
                    password !== storedUser.password
                  ) {
                    toast(
                      "error",
                      "An Account Already Exsists",
                      `please sign in as ${storedUser.username}`
                    );
                    setLogin(true);
                  }
                }
              })
              .catch((err) => {
                AsyncStorage.setItem("user", JSON.stringify(newUser));
                setUser(user);
                toast(
                  "success",
                  "New Account Created!",
                  `please sign in ${newUser.username}`
                );
              });
          }
        });
    }
  };

  return (
    <Animated.View style={{ translateY: slideIn }}>
      <View style={styles.textInputs}>
        <TextInput
          onChangeText={(text) => setUsername(text)}
          style={styles.input}
          placeholder="Username"
          keyboardType="default"
        />
        <TextInput
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
        />
        <TextInput
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
        />
      </View>
      <Ripple onPress={() => signup()} style={styles.submit}>
        <Text>Signup</Text>
      </Ripple>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  textInputs: {
    marginBottom: 50,
  },
  input: {
    marginVertical: 10,
    marginHorizontal: 20,
    paddingVertical: 8,
    textAlign: "center",
    elevation: 5,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  submit: {
    marginBottom: 100,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: "#f210f7",
    elevation: 5,
  },
});

export default Signup;

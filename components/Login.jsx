import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
} from "react-native";
import Ripple from "react-native-material-ripple";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Axios from "axios";

const Login = ({ online, setLoading, setUser, setLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tries, setTries] = useState(0);

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

  const login = () => {
    if (!online) {
      AsyncStorage.getItem("user")
        .then((res, err) => {
          if (!res || err) {
            toast("error", "Please Sign Up First");
            setLogin(false);
          }
          if (res) {
            const currentUser = JSON.parse(res);
            if (
              currentUser.username === username &&
              currentUser.password === password
            ) {
              setUser(currentUser);
              toast("success", "You are now loggedin & offline");
            }
            if (currentUser.username !== username) {
              return toast("error", "Incorrect username");
            }
            if (currentUser.password !== password) {
              return toast("error", "Incorrect password");
            }
          }
        })
        .catch((err) => {
          if (tries === 1) {
            return toast("error", "Please Reload The App");
            setTries(0);
          }
          toast("error", "Something Went Wrong Please Try Again", null);
          setTries((prev) => prev + 1);
        });
    }
    if (!!online) {
      setLoading(true);
      Axios.post("http://localhost:8080/login", {
        username,
        password,
      })
        .then((res) => {
          AsyncStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);
          setLoading(false);
          toast("success", "Online", res.data.message);
        })
        .catch((err) => {
          if (err.response) {
            setUser(false);
            setLoading(false);
            toast("error", err.response.data.message);
          }
          if (!err.response) {
            AsyncStorage.getItem("user").then((res, error) => {
              const storedUser = JSON.parse(res);
              if (!res || error) {
                setUser(false);
                setLoading(false);
                toast("error", "Please Sign Up First", null);
                setLogin(false);
              }
              if (res) {
                setUser(storedUser);
                setLoading(false);
                toast("success", "You Are now logged in offline", null);
              }
            });
          }
        });
    }
  };

  const sync = (fetchedUser, currentUser) => {
    const fetchedLists = fetchedUser.lists;
    const currentLists = currentUser.lists;

    const unmatchedLists = fetchedLists.filter(
      (fetchedList) =>
        !currentLists.some(
          (currentList) => currentList.title === fetchedList.title
        )
    );
    const unmatchedItems = fetchedLists.filter(
      (fetchedList) =>
        !currentLists.some((currentList) =>
          fetchedList.listItems.filter(
            (fetchedItem) =>
              !currentList.listItems.some(
                (currentItem) => currentItem.body === fetchedItem.body
              )
          )
        )
    );
    currentUser.lists.push(unmatchedLists);
    AsyncStorage.setItem("user", currentUser);
    setUser(currentUser);
    setLoading(false);
    toast("success", "Synced");
  };

  return (
    <Animated.View style={{ translateY: slideIn }}>
      <View style={styles.textInputs}>
        <TextInput
          onChangeText={(text) => setUsername(text)}
          style={styles.input}
          placeholder="Username"
        />
        <TextInput
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          placeholder="Password"
        />
      </View>
      <Ripple onPress={() => login()} style={styles.submit}>
        <Text>Login</Text>
      </Ripple>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  textInputs: {
    marginBottom: 50,
  },
  input: {
    marginHorizontal: 20,
    marginVertical: 10,
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

export default Login;

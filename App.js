import { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  Image,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import Spinner from "react-native-loading-spinner-overlay";
import Icon from "react-native-vector-icons/Entypo";
import IconIon from "react-native-vector-icons/Ionicons";
import Ripple from "react-native-material-ripple";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Axios from "axios";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Lists from "./components/Lists";
import Settings from "./components/Settings";

export default function App() {
  const [user, setUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState(false);
  const [online, setOnline] = useState(false);
  const [tries, setTries] = useState(0);
  const [settings, setSettings] = useState(false);

  const slideIn = useRef(new Animated.Value(100)).current;
  const fadeAndSlide = useRef(new Animated.Value(100)).current;

  const toast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
    });
  };

  useEffect(() => {
    setLoading(true);
    NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        setOnline(state.isConnected);
        getOnlineAccount();
      }
      if (!state.isConnected) {
        setOnline(false);
        getOfflineAccount();
      }
    });
    Animated.spring(slideIn, {
      toValue: 0,
      duration: 750,
      useNativeDriver: true,
      friction: 2,
    }).start();
    Animated.spring(fadeAndSlide, {
      toValue: 0,
      delay: 1000,
      duration: 500,
      friction: 2,
      useNativeDriver: true,
    });
  }, []);

  const syncUser = (fetchedUser, storedUser) => {
    let set = new Set();
    const allLists = [...fetchedUser.lists, ...storedUser.lists];
    let mergedLists = allLists.filter((listObj) => {
      if (!set.has(listObj._id)) {
        set.add(listObj._id);
        return true;
      }
    }, set);
    const newUser = {
      id: fetchedUser.id,
      username: fetchedUser.username,
      email: fetchedUser.email,
      lists: mergedLists,
    };
    AsyncStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    setLoading(false);
    Axios.post(
      "https://my-lists-android-production.up.railway.app/update",
      { newLists: mergedLists },
      {
        headers: {
          Authorization: newUser.id.toString(),
        },
      }
    )
      .then((res) => {
        toast("success", res.data.message, null);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const signUpExsistingOfflineUser = (currentUser) => {
    if (!currentUser.password) {
      AsyncStorage.removeItem("user");
      setUser(false);
      setLoading(false);
      setLogin(true);
      return toast("error", "Please Log Back In");
    }
    Axios.post("https://my-lists-android-production.up.railway.app/signup", {
      username: currentUser.username,
      email: currentUser.email,
      password: currentUser.password,
    })
      .then((res) => {
        setLoading(false);
        toast(
          "success",
          "Your New Account Was Created!",
          `You can now login ${currentUser.username}`
        );
        setTimeout(() => {
          setLogin(true);
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
        AsyncStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);
        setLoading(false);
        toast(
          "success",
          "Logged In Offline",
          "Your account will sync when online"
        );
      });
  };

  const getOnlineAccount = () => {
    AsyncStorage.getItem("user")
      .then((res, err) => {
        if (err || !res) {
          setUser(false);
          setLoading(false);
          toast("success", "Welcome!!", "Signup or Login to get started!");
        }
        if (res) {
          const currentUser = JSON.parse(res);
          Axios.get(
            "https://my-lists-android-production.up.railway.app/update",
            {
              headers: { Authorization: currentUser.id.toString() },
            }
          )
            .then((response) => {
              return syncUser(response.data.user, currentUser);
            })
            .catch((error) => {
              if (error.response) {
                toast("success", "Creating New Account", "Please Wait");
                signUpExsistingOfflineUser(currentUser);
              }
              if (!error.response) {
                AsyncStorage.setItem("user", JSON.stringify(currentUser));
                setUser(currentUser);
                setLoading(false);
                toast(
                  "success",
                  "Logged In Offline",
                  "Your account will sync when online"
                );
              }
            });
        }
      })
      .catch((err) => {
        setLoading(false);
        if (tries === 1) {
          return toast("error", "Apologies, please reload the app");
        }
        toast("error", "Something Went wrong, try signing in again");
        setTries((prev) => prev + 1);
      });
  };

  const getOfflineAccount = () => {
    AsyncStorage.getItem("user")
      .then((res, err) => {
        if (err || !res) {
          setUser(false);
          setLoading(false);
          toast("success", "Welcome!!", "Signup or Login to get started!");
        }
        if (res) {
          const currentUser = JSON.parse(res);
          setUser(currentUser);
          setLoading(false);
          toast("success", "You Are offline!", null);
        }
      })
      .catch((err) => {
        setLoading(false);
        if (tries === 1) {
          return toast("error", "Apologies, please reload the app");
        }
        toast("error", "Something Went wrong, try signing in again");
        setTries((prev) => prev + 1);
      });
  };

  const logout = () => {
    !!online && AsyncStorage.removeItem("user");
    setUser(false);
    setLogin(true);
    toast("success", "You have successfully logged out!", null);
  };

  return (
    <>
      <View style={styles.container}>
        <Image style={styles.img} source={require("./assets/bg.jpg")} />
        <Spinner visible={loading} />
        {!!user ? (
          <Lists
            setLoading={setLoading}
            user={user}
            setUser={setUser}
            online={online}
          />
        ) : (
          <>
            <Pressable
              onPress={() => setLogin((prev) => !prev)}
              style={!login ? styles.loginBtn : styles.signupBtn}
            >
              <Icon
                name={
                  !login
                    ? "chevron-with-circle-right"
                    : "chevron-with-circle-left"
                }
                style={styles.loginIcon}
              />
              <Text style={{ fontSize: 10, color: "#fff" }}>
                {!login ? "Login" : "Signup"}
              </Text>
            </Pressable>
            {!login ? (
              <Signup
                setUser={setUser}
                setLoading={setLoading}
                setLogin={setLogin}
              />
            ) : (
              <Login
                online={online}
                setLoading={setLoading}
                setUser={setUser}
                setLogin={setLogin}
              />
            )}
          </>
        )}
        <StatusBar hidden={true} />
        {user && (
          <>
            <Ripple onPress={() => logout()} style={styles.logout}>
              <Icon name="chevron-with-circle-left" style={styles.logoutIcon} />
              <Text style={{ color: "#fff", fontSize: 10 }}>Logout</Text>
            </Ripple>
            <Ripple onPress={() => setSettings(true)} style={styles.settings}>
              <IconIon style={styles.settingsIcon} name="settings-outline" />
              <Text style={{ color: "#fff", fontSize: 10 }}>Settings</Text>
            </Ripple>
            <Settings
              settings={settings}
              setSettings={setSettings}
              user={user}
              setUser={setUser}
              loading={setLoading}
              online={online}
            />
          </>
        )}
      </View>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#444",
    flex: 1,
    justifyContent: "flex-end",
  },
  img: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
  },
  loginBtn: {
    position: "absolute",
    top: 50,
    right: 50,
  },
  signupBtn: {
    position: "absolute",
    top: 50,
    left: 50,
  },
  loginIcon: {
    fontSize: 30,
    color: "#fff",
    textAlign: "center",
  },
  logout: {
    position: "absolute",
    top: 25,
    left: 25,
  },
  logoutIcon: {
    textAlign: "center",
    fontSize: 30,
    color: "#fff",
  },
  settings: {
    position: "absolute",
    top: 25,
    right: 25,
  },
  settingsIcon: {
    textAlign: "center",
    fontSize: 30,
    color: "#fff",
  },
});

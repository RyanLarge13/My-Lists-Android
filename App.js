import { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  Pressable,
  Alert,
  Animated,
  Image,
} from "react-native";
import ObjectId from "bson-objectid";
import NetInfo from "@react-native-community/netinfo";
import Spinner from "react-native-loading-spinner-overlay";
import Icon from "react-native-vector-icons/Entypo";
import IconIon from "react-native-vector-icons/Ionicons";
import Ripple from "react-native-material-ripple";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Axios from "axios";
import Login from "./components/Login";
import Lists from "./components/Lists";
import Settings from "./components/Settings";

export default function App() {
  const [user, setUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    //AsyncStorage.removeItem("user");
    setLoading(true);
    NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        setOnline(state.isConnected);
        getOnlineAccount();
        //getChanges();
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

  const getChanges = () => {
    setInterval(() => {
      AsyncStorage.getItem("user")
        .then((res, err) => {
          if (res) {
            const storedUser = JSON.parse(res);
            Axios.get(
              `https://my-lists-android-production.up.railway.app/sync/${storedUser.id}`
            )
              .then((res) => {
                AsyncStorage.setItem("user", JSON.stringify(res.data.user));
                setUser(res.data.user);
                toast("success", res.data.message, null);
              })
              .catch((err) => {
                console.log(err.response);
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }, 10000);
  };

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
      	console.log(err)
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
          if (!online) {
            setUser(currentUser);
            setLoading(false);
            toast("success", "You Are offline!", null);
          }
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

  const signup = () => {
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
                  "auccess",
                  "New Account Created!",
                  `please sign in ${newUser.username}`
                );
              });
          }
        });
    }
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
              style={styles.loginBtn}
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
              <Animated.View style={{ translateY: slideIn }}>
                <View style={styles.textInputs}>
                  <TextInput
                    onChangeText={(text) => setUsername(text)}
                    style={styles.input}
                    placeholder="Username"
                  />
                  <TextInput
                    onChangeText={(text) => setEmail(text)}
                    style={styles.input}
                    placeholder="Email"
                  />
                  <TextInput
                    onChangeText={(text) => setPassword(text)}
                    style={styles.input}
                    placeholder="Password"
                  />
                </View>
                <Ripple onPress={() => signup()} style={styles.submit}>
                  <Text>Signup</Text>
                </Ripple>
              </Animated.View>
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
  loginBtn: {
    position: "absolute",
    top: 50,
    right: 50,
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

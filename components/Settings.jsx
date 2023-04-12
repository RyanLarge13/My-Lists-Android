import { useState } from "react";
import { View, Text, Modal, TextInput, StyleSheet } from "react-native";
import Ripple from "react-native-material-ripple";
import Toast from "react-native-toast-message";
import Axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Settings = ({
  settings,
  setSettings,
  user,
  setUser,
  loading,
  online,
}) => {
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const toast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
    });
  };

  const changeUsername = () => {
    if (!online) {
      setSettings(false);
      return toast(
        "error",
        "Offline",
        "You must be online to change your username"
      );
    }
    if (!!online) {
      loading(true);
      Axios.put(
        "https://my-lists-android-production.up.railway.app/user/username/update",
        { newUsername },
        { headers: { Authorization: user.id.toString() } }
      )
        .then((res) => {
          loading(false);
          AsyncStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);
          setSettings(false);
          toast("success", "Updated", res.data.message);
        })
        .catch((err) => {
          setSettings(false);
          loading(false);
          return toast(
            "error",
            "Offline",
            "You must be online to change your username"
          );
        });
    }
  };

  const changeEmail = () => {
    if (!online) {
      setSettings(false);
      return toast(
        "error",
        "Offline",
        "You must be online to change your email"
      );
    }
    if (!!online) {
      loading(true);
      Axios.put(
        "https://my-lists-android-production.up.railway.app/user/email/update",
        { newEmail },
        { headers: { Authorization: user.id.toString() } }
      )
        .then((res) => {
          loading(false);
          AsyncStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);
          setSettings(false);
          toast("success", "Updated", res.data.message);
        })
        .catch((err) => {
          setSettings(false);
          loading(false);
          toast(
            "error",
            "Offline",
            "You must be online to delete your account"
          );
        });
    }
  };

  const deleteAccount = () => {
    if (!online) {
setSettings(false);
      return toast(
        "error",
        "Offline",
        "You must be online to delete your account"
      );
    }
    if (!!online) {
      loading(true);
      Axios.delete(`https://my-lists-android-production.up.railway.app/user/${user.id}`, {
        headers: { Authorization: user.id.toString() },
      })
        .then((res) => {
          loading(false);
          AsyncStorage.removeItem("user");
          setUser(false);
          toast("success", "Deleted", res.data.message);
        })
        .catch((err) => {
setSettings(false);
          loading(false);
          toast(
            "error",
            "Offline",
            "You must be online to delete your account"
          );
        });
    }
  };

  return (
    <Modal
      transparent={false}
      visible={settings}
      animationType="fade"
      onRequestClose={() => setSettings(false)}
    >
      {user && (
        <View style={styles.container}>
          <Text style={{ color: "#fff", fontSize: 30 }}>Settings</Text>
          <View style={styles.userInfo}>
            <Text style={{ color: "#fff", fontSize: 20, marginBottom: 10 }}>
              {user.username}
            </Text>
            <Text style={{ color: "#fff", fontSize: 10 }}>{user.email}</Text>
          </View>
          <View style={styles.form}>
            <TextInput
              onChangeText={(text) => setNewUsername(text)}
              placeholder="New Username"
              style={styles.input}
            />
            <Ripple onPress={() => changeUsername()} style={styles.submit}>
              <Text>Submit</Text>
            </Ripple>
            <TextInput
              onChangeText={(text) => setNewEmail(text)}
              placeholder="Update Email"
              style={styles.input}
            />
            <Ripple onPress={() => changeEmail()} style={styles.submit}>
              <Text>Submit</Text>
            </Ripple>
          </View>
          <Ripple onPress={() => deleteAccount()} style={styles.delete}>
            <Text>Delete Account</Text>
          </Ripple>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#222",
  },
  userInfo: {
    alignItems: "center",
  },
  form: {
    width: "90%",
    justifyContent: "center",
  },
  input: {
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    elevation: 5,
  },
  submit: {
    width: "100%",
    alignSelf: "center",
    padding: 10,
    borderRadius: 5,
    elevation: 5,
    backgroundColor: "#88ff88",
  },
  delete: {
    padding: 10,
    borderRadius: 5,
    elevation: 5,
    backgroundColor: "#f88",
  },
});

export default Settings;

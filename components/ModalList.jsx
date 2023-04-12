import { useState } from "react";
import { Modal, StyleSheet, Text, View, TextInput } from "react-native";
import Ripple from "react-native-material-ripple";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import Axios from "axios";
import { colors } from "../constants.js";

const ModalList = ({
  setLoading,
  user,
  setUser,
  list,
  setList,
  optionsModal,
  setOptionsModal,
  online,
}) => {
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const toast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
    });
  };

  const deleteList = () => {
    if (!online) {
      AsyncStorage.getItem("user")
        .then((res, err) => {
          const storedUser = JSON.parse(res);
          const newListOfLists = storedUser.lists.filter(
            (aList) => aList._id !== list._id
          );
          storedUser.lists = newListOfLists;
          AsyncStorage.setItem("user", JSON.stringify(storedUser));
          setUser(storedUser);
          setOptionsModal(false);
          setLoading(false);
          toast("success", `Successfully deleted ${list.title}`, null);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    if (!!online) {
      setLoading(true);
      Axios.delete(`http://localhost:8080/lists/remove/${list._id}`, {
        headers: { Authorization: user.id.toString() },
      })
        .then((res) => {
          setUser(res.data.user);
          AsyncStorage.setItem("user", JSON.stringify(res.data.user));
          setLoading(false);
          setOptionsModal(false);
          toast("success", res.data.message, `${list.title} was deleted`);
        })
        .catch((err) => {
          AsyncStorage.getItem("user")
            .then((res, err) => {
              const storedUser = JSON.parse(res);
              const newListOfLists = storedUser.lists.filter(
                (aList) => aList._id !== list._id
              );
              storedUser.lists = newListOfLists;
              AsyncStorage.setItem("user", JSON.stringify(storedUser));
              setUser(storedUser);
              setOptionsModal(false);
              setLoading(false);
              toast("success", `Successfully deleted ${list.title}`, null);
            })
            .catch((err) => {
              console.log(err);
            });
        });
    }
  };

  const updateTitle = () => {
    setLoading(true);
    if (!online) {
      AsyncStorage.getItem("user")
        .then((res, err) => {
          if (!res || err) {
            console.log("No user");
          }
          if (res) {
            const storedUser = JSON.parse(res);
            const theList = storedUser.lists.filter(
              (aList) => aList._id === list._id
            );
            storedUser.lists.indexOf(theList).title = title;
            AsyncStorage.setItem("user", JSON.stringify(storedUser));
            setUser(storedUser);
            setOptionsModal(false);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
    if (!!online) {
      Axios.patch(
        `http://localhost:8080/lists/update/${title}/${list._id}`,
        {},
        { headers: { Authorization: user.id.toString() } }
      )
        .then((res) => {
          setUser(res.data.user);
          AsyncStorage.setItem("user", JSON.stringify(res.data.user));
          setLoading(false);
          setOptionsModal(false);
          toast("success", res.data.message, null);
        })
        .catch((err) => {
          if (err.response) {
            setLoading(false);
            toast("error", err.response.data.message);
          }
          if (!err.response) {
            AsyncStorage.getItem("user")
              .then((res, err) => {
                if (!res || err) {
                  console.log("No user");
                }
                if (res) {
                  const storedUser = JSON.parse(res);
                  const theList = storedUser.lists.filter(
                    (aList) => aList._id === list._id
                  );
                  storedUser.lists[storedUser.lists.indexOf(theList[0])].title =
                    title;
                  AsyncStorage.setItem("user", JSON.stringify(storedUser));
                  setUser(storedUser);
                  setOptionsModal(false);
                  setLoading(false);
                }
              })
              .catch((err) => {
                console.log(err);
              });
          }
        });
    }
  };

  const updateColor = (color) => {
    setLoading(true);
    if (!online) {
      AsyncStorage.getItem("user")
        .then((res, err) => {
          if (!res || err) {
            console.log(err);
          }
          if (res) {
            const storedUser = JSON.parse(res);
            const theList = storedUser.lists.filter(
              (aList) => aList._id === list._id
            );
            storedUser.lists[storedUser.lists.indexOf(theList[0])].color =
              color;
            setList(theList[0]);
            AsyncStorage.setItem("user", JSON.stringify(storedUser));
            setUser(storedUser);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
    if (!!online) {
      setSelectedColor(color);
      Axios.post(
        `http://localhost:8080/lists/update/color/${list._id}`,
        { color },
        { headers: { Authorization: user.id.toString() } }
      )
        .then((res) => {
          setUser(res.data.user);
          AsyncStorage.setItem("user", JSON.stringify(res.data.user));
          const newList = res.data.user.lists.filter(
            (filteredList) => filteredList._id === list._id
          );
          setList(newList[0]);
          setLoading(false);
        })
        .catch((err) => {
        	AsyncStorage.getItem("user")
        .then((res, err) => {
          if (!res || err) {
            console.log(err);
          }
          if (res) {
            const storedUser = JSON.parse(res);
            const theList = storedUser.lists.filter(
              (aList) => aList._id === list._id
            );
            storedUser.lists[storedUser.lists.indexOf(theList[0])].color =
              color;
            setList(theList[0]);
            AsyncStorage.setItem("user", JSON.stringify(storedUser));
            setUser(storedUser);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.log(err);
        }); 
        });
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={optionsModal}
      onRequestClose={() => setOptionsModal(false)}
    >
      {list && (
        <View style={[{ backgroundColor: list.color }, styles.container]}>
          <Text style={styles.title}>{list.title}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder={list.title}
              onChangeText={(text) => setTitle(text)}
              style={styles.input}
            />
            <Ripple onPress={() => updateTitle()} style={styles.changeTitle}>
              <Text>Update Title</Text>
            </Ripple>
          </View>
          <Text>Change Color</Text>
          <View style={styles.colorPicker}>
            {colors.map((color, index) => (
              <Ripple
                key={index}
                onPress={() => updateColor(color.color)}
                style={[
                  { backgroundColor: color.color },
                  styles.colorElem,
                  color.color === list.color && { width: 30, height: 30 },
                ]}
              ></Ripple>
            ))}
          </View>
          <Ripple onPress={() => deleteList()} style={styles.delete}>
            <Text>Delete</Text>
          </Ripple>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    marginBottom: 50,
  },
  inputContainer: {
    marginTop: 50,
    marginBottom: 100,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  input: {
    width: "100%",
    textAlign: "center",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    elevation: 5,
  },
  changeTitle: {
    marginTop: 25,
    padding: 10,
    borderRadius: 5,
    elevation: 5,
    backgroundColor: "#88ff88",
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  colorElem: {
    margin: 10,
    width: 25,
    height: 25,
    borderRadius: 50,
    elevation: 5,
  },
  delete: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    elevation: 5,
    backgroundColor: "#ff6666",
  },
});

export default ModalList;

import { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import Ripple from "react-native-material-ripple";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/AntDesign";
import ObjectId from "bson-objectid";
import Axios from "axios";

const ListItems = ({
  listId,
  color,
  name,
  items,
  setItems,
  id,
  user,
  setUser,
  loading,
  showItems,
  setShowItems,
  online,
}) => {
  let count = 1;
  const [modal, setModal] = useState(false);
  const [itemBody, setItemBody] = useState("");
  const [optionsModal, setOptionsModal] = useState(false);
  const [singleItem, setSingleItem] = useState(null);
  const [newBodyText, setNewBodyText] = useState("");

  const toast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
    });
  };

  const addItem = () => {
    loading(true);
    const newItem = {
      _id: ObjectId.createFromTime(new Date().getSeconds()),
      body: itemBody,
      complete: false,
      _createdAt: new Date(),
      listId: id,
    };
    if (!online) {
      AsyncStorage.getItem("user")
        .then((res, err) => {
          if (!res || err) {
            console.log(err);
          }
          if (res) {
            const storedUser = JSON.parse(res);
            const theList = storedUser.lists.filter(
              (aList) => aList._id === listId
            );
            storedUser.lists[
              storedUser.lists.indexOf(theList[0])
            ].listItems.push(newItem);
            setModal(false);
            setItems(
              storedUser.lists[storedUser.lists.indexOf(theList[0])].listItems
            );
            AsyncStorage.setItem("user", JSON.stringify(storedUser));
            setUser(storedUser);
            loading(false);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
    if (!!online) {
      Axios.post("http://localhost:8080/listitem/add", newItem, {
        headers: {
          Authorization: user.id.toString(),
        },
      })
        .then((res) => {
          setModal(false);
          AsyncStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);
          const theList = res.data.user.lists.filter((list) => list._id === id);
          setItems(theList[0].listItems);
          loading(false);
        })
        .catch((err) => {
          if (!err.response) {
            AsyncStorage.getItem("user")
              .then((res, err) => {
                if (!res || err) {
                  console.log(err);
                }
                if (res) {
                  const storedUser = JSON.parse(res);
                  const theList = storedUser.lists.filter(
                    (aList) => aList._id === listId
                  );
                  storedUser.lists[
                    storedUser.lists.indexOf(theList[0])
                  ].listItems.push(newItem);
                  setModal(false);
                  setItems(
                    storedUser.lists[storedUser.lists.indexOf(theList[0])]
                      .listItems
                  );
                  AsyncStorage.setItem("user", JSON.stringify(storedUser));
                  setUser(storedUser);
                  loading(false);
                }
              })
              .catch((err) => {
                console.log(err);
              });
          }
          if (err.response) {
            toast("error", err.response.data.message, null);
          }
        });
    }
  };

  const openOptions = (item) => {
    setOptionsModal(true);
    setSingleItem(item);
  };

  const startTimer = (item) => {
    if (count === 0) return toggleComplete(item);
    count = 0;
    setTimeout(() => {
      count = 1;
    }, 500);
  };

  const toggleComplete = (item) => {
    count = 1;
    loading(true);
    if (!online) {
      loading(false);
      AsyncStorage.getItem("user")
        .then((res, err) => {
          const storedUser = JSON.parse(res);
          const theList = storedUser.lists.filter(
            (aList) => aList._id === listId
          );
          const theItem = theList[0].listItems.filter(
            (anItem) => anItem._id === item._id
          );
          theItem[0].complete = !theItem[0].complete;
          setItems(
            storedUser.lists[storedUser.lists.indexOf(theList[0])].listItems
          );
          AsyncStorage.setItem("user", JSON.stringify(storedUser));
          setUser(storedUser);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    if (!!online) {
      Axios.patch(
        "http://localhost:8080/listitem/update/complete",
        {
          listId: listId,
          itemId: item._id,
          newComplete: !item.complete,
        },
        {
          headers: {
            Authorization: user.id.toString(),
          },
        }
      )
        .then((res) => {
          AsyncStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);
          const newList = res.data.user.lists.filter(
            (list) => list._id === listId
          );
          const newItems = newList[0].listItems;
          setItems(newItems);
          loading(false);
        })
        .catch((err) => {
          loading(false);
          AsyncStorage.getItem("user")
            .then((res, err) => {
              const storedUser = JSON.parse(res);
              const theList = storedUser.lists.filter(
                (aList) => aList._id === listId
              );
              const theItem = theList[0].listItems.filter(
                (anItem) => anItem._id === item._id
              );
              theItem[0].complete = !theItem[0].complete;
              setItems(
                storedUser.lists[storedUser.lists.indexOf(theList[0])].listItems
              );
              AsyncStorage.setItem("user", JSON.stringify(storedUser));
              setUser(storedUser);
            })
            .catch((err) => {
              console.log(err);
            });
        });
    }
  };

  const updateBody = (itemId) => {
    loading(true);
    if (!online) {
      loading(false);
      AsyncStorage.getItem("user")
        .then((res, err) => {
          if (!res || err) {
          }
          if (res) {
            const storedUser = JSON.parse(res);
            const theList = storedUser.lists.filter(
              (aList) => aList._id === listId
            );
            const theItem = theList[0].listItems.filter(
              (anItem) => anItem._id === itemId
            );
            theItem[0].body = newBodyText;
            setOptionsModal(false);
            AsyncStorage.setItem("user", JSON.stringify(storedUser));
            setUser(storedUser);
            setItems(theList[0].listItems);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
    if (!!online) {
      Axios.patch(
        "http://localhost:8080/listitem/new/body",
        {
          listId: listId,
          itemId: itemId,
          newBody: newBodyText,
        },
        { headers: { Authorization: user.id.toString() } }
      )
        .then((res) => {
          AsyncStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);
          const newList = res.data.user.lists.filter(
            (aList) => aList._id === listId
          );
          const newItems = newList[0].listItems;
          setItems(newItems);
          loading(false);
        })
        .catch((err) => {
          loading(false);
          AsyncStorage.getItem("user")
            .then((res, err) => {
              if (!res || err) {
              }
              if (res) {
                const storedUser = JSON.parse(res);
                const theList = storedUser.lists.filter(
                  (aList) => aList._id === listId
                );
                const theItem = theList[0].listItems.filter(
                  (anItem) => anItem._id === itemId
                );
                theItem[0].body = newBodyText;
                setOptionsModal(false);
                AsyncStorage.setItem("user", JSON.stringify(storedUser));
                setUser(storedUser);
                setItems(theList[0].listItems);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        });
    }
  };

  const deleteItem = (itemId) => {
    loading(true);
    if (!online) {
      loading(false);
      AsyncStorage.getItem("user")
        .then((res, err) => {
          if (!res || err) {
            console.log(err);
          }
          if (res) {
            const storedUser = JSON.parse(res);
            const theList = storedUser.lists.filter(
              (aList) => aList._id === listId
            );
            const newItems = theList[0].listItems.filter(
              (anItem) => anItem._id !== itemId
            );
            theList[0].listItems = newItems;
            setOptionsModal(false);
            AsyncStorage.setItem("user", JSON.stringify(storedUser));
            setUser(storedUser);
            setItems(newItems);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
    if (!!online) {
      Axios.delete(
        `http://localhost:8080/listitem/remove/${listId}/${itemId}`,
        {
          headers: { Authorization: user.id.toString() },
        }
      )
        .then((res) => {
          const theList = res.data.user.lists.filter(
            (list) => listId === list._id
          );
          const theItems = theList[0].listItems;
          setItems(theItems);
          setOptionsModal(false);
          AsyncStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);
          loading(false);
        })
        .catch((err) => {
          loading(false);
          AsyncStorage.getItem("user")
            .then((res, err) => {
              if (!res || err) {
                console.log(err);
              }
              if (res) {
                const storedUser = JSON.parse(res);
                const theList = storedUser.lists.filter(
                  (aList) => aList._id === listId
                );
                const newItems = theList[0].listItems.filter(
                  (anItem) => anItem._id !== itemId
                );
                theList[0].listItems = newItems;
                setOptionsModal(false);
                AsyncStorage.setItem("user", JSON.stringify(storedUser));
                setUser(storedUser);
                setItems(newItems);
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
      transparent={true}
      animationType="fade"
      visible={showItems}
      onRequestClose={() => setShowItems(false)}
    >
      <View
        style={[
          color ? { backgroundColor: color } : { backgroundColor: "#fff" },
          styles.containerOutter,
        ]}
      >
        <View style={styles.containerInner}>
          <Text style={styles.title}>{name && name}</Text>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modal}
            onRequestClose={() => setModal(false)}
          >
            <View style={styles.modal}>
              <TextInput
                onChangeText={(text) => setItemBody(text)}
                style={styles.input}
                placeholder={`New ${name} Item`}
              />
              <Ripple
                onPress={() => addItem()}
                style={[{ backgroundColor: color }, styles.add]}
              >
                <Text>Add</Text>
              </Ripple>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={optionsModal}
            onRequestClose={() => setOptionsModal(false)}
          >
            <View style={styles.editContainer}>
              {!!singleItem && (
                <View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      onChangeText={(text) => setNewBodyText(text)}
                      placeholder={singleItem.body}
                      style={styles.input}
                    />
                    <Ripple
                      onPress={() => updateBody(singleItem._id)}
                      style={styles.edit}
                    >
                      <Text>Edit</Text>
                    </Ripple>
                  </View>
                  <Ripple
                    style={styles.delete}
                    onPress={() => deleteItem(singleItem._id)}
                  >
                    <Text>Delete</Text>
                  </Ripple>
                </View>
              )}
            </View>
          </Modal>
          <ScrollView style={{ marginTop: 100 }} indicatorStyle="white">
            <View style={styles.listContainer}>
              {items &&
                items.length > 0 &&
                items.map((item) => (
                  <Ripple
                    onPress={() => startTimer(item)}
                    key={item._id}
                    onLongPress={() => openOptions(item)}
                    style={[
                      item.complete
                        ? { backgroundColor: "#aaa" }
                        : { backgroundColor: "#fff" },
                      styles.listItem,
                    ]}
                  >
                    <Text>{item.body}</Text>
                    <View
                      style={[
                        { backgroundColor: item.complete ? "#f88" : color },
                        styles.listItemTag,
                      ]}
                    ></View>
                  </Ripple>
                ))}
            </View>
          </ScrollView>
        </View>
      </View>
      <Ripple onPress={() => setModal(true)} style={styles.addBtn}>
        <Icon name="pluscircle" style={[{ color: color }, styles.addIcon]} />
      </Ripple>
    </Modal>
  );
};

const styles = StyleSheet.create({
  containerOutter: {
    flex: 1,
  },
  containerInner: {
    margin: 7,
    paddingVertical: 25,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 5,
  },
  title: {
    fontSize: 25,
    marginBottom: 25,
    color: "#fff",
  },
  addBtn: {
    position: "absolute",
    bottom: 7,
    right: 7,
    padding: 15,
    borderRadius: 5,
    backgroundColor: "#000",
  },
  addIcon: {
    fontSize: 30,
  },
  modal: {
    padding: 25,
    width: "100%",
    backgroundColor: "#222",
    borderRadius: 5,
    elevation: 5,
    position: "absolute",
    bottom: 0,
  },
  input: {
    marginVertical: 10,
    paddingVertical: 8,
    textAlign: "center",
    elevation: 5,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  add: {
    marginTop: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    elevation: 5,
  },
  listContainer: {
    marginVertical: 50,
    paddingHorizontal: 25,
    height: "50%",
    minWidth: "100%",
  },
  listItem: {
    width: "100%",
    padding: 15,
    marginVertical: 15,
    borderRadius: 5,
    elevation: 5,
    overflow: "hidden",
    position: "relative",
  },
  listItemTag: {
    position: "absolute",
    left: -2,
    top: 0,
    bottom: 0,
    width: 7,
    borderRadius: 5,
  },
  editContainer: {
    position: "absolute",
    padding: 15,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "#222",
    borderRadius: 5,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 100,
  },
  input: {
    borderRadius: 5,
    backgroundColor: "#fff",
    padding: 10,
    margin: 10,
    elevation: 5,
    textAlign: "center",
  },
  edit: {
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#88ff88",
    elevation: 5,
  },
  delete: {
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#ff8888",
    elevation: 5,
  },
});

export default ListItems;

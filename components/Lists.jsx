import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Vibration,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import Ripple from "react-native-material-ripple";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ObjectId from "bson-objectid";
import Axios from "axios";
import ListItems from "./ListItems";
import ModalList from "./ModalList";
import { colors } from "../constants.js";

const Lists = ({ setLoading, user, setUser, online }) => {
  const [lists, setLists] = useState([]);
  const [listItems, setListItems] = useState([]);
  const [listName, setListName] = useState(null);
  const [listId, setListId] = useState(null);
  const [showItems, setShowItems] = useState(false);
  const [modal, setModal] = useState(false);
  const [optionsModal, setOptionsModal] = useState(false);
  const [listTitle, setListTitle] = useState("");
  const [list, setList] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showColor, setShowColor] = useState(null);

  useEffect(() => {
    setLists(user.lists);
  }, [user]);

  const toast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
    });
  };

  const addList = () => {
    const newList = {
      _id: ObjectId.createFromTime(new Date().getSeconds()),
      title: listTitle,
      color: selectedColor ? selectedColor : "#fff",
      _createdAt: new Date(),
      listItems: [],
    };
    if (!online) {
      toast("success", `New List Item Added: ${newList.title}`);
      AsyncStorage.getItem("user")
        .then((res, err) => {
          const storedUser = JSON.parse(res);
          storedUser.lists.push(newList);
          AsyncStorage.setItem("user", JSON.stringify(storedUser));
          setUser(storedUser);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    if (!!online) {
      setLoading(true);
      setModal(false);
      Axios.patch("https://my-lists-android-production.up.railway.app/lists/add", newList, {
        timeout: 8000,
        headers: {
          Authorization: user.id.toString(),
        },
      })
        .then((res) => {
          setSelectedColor(null);
          setUser(res.data.user);
          setLoading(false);
          setModal(false);
          toast("success", "Update", `Added ${newList.title}!`);
        })
        .catch((err) => {
          setLoading(false);
          if (err.response) {
            toast("error", "Failed", err.response.data.message);
          } else {
            toast("success", `New List Item Added: ${newList.title}`);
            AsyncStorage.getItem("user")
              .then((res, err) => {
                const storedUser = JSON.parse(res);
                storedUser.lists.push(newList);
                AsyncStorage.setItem("user", JSON.stringify(storedUser));
                setUser(storedUser);
              })
              .catch((err) => {
                console.log(err);
              });
          }
        });
    }
  };

  const openOptions = (list) => {
    Vibration.vibrate(25);
    setLoading(true);
    setList(list);
    setOptionsModal(true);
    setLoading(false);
  };

  return (
    <>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.text}>Welcome</Text>
          <Text style={styles.text}>{user.username}</Text>
          <View>
            {lists && lists.length > 0 && (
              <View style={styles.listContainer}>
                {lists.map((list) => (
                  <Ripple
                    onPress={() => {
                      setListItems(list.listItems);
                      setListName(list.title);
                      setListId(list._id);
                      setShowItems(true);
                      setShowColor(list.color);
                    }}
                    onLongPress={() => openOptions(list)}
                    key={list._id}
                    style={[{ backgroundColor: list.color }, styles.list]}
                  >
                    <Text>{list.title}</Text>
                    <Text>
                      {
                        list.listItems.filter((item) => item.complete === true)
                          .length
                      }
                      /{list.listItems.length}
                    </Text>
                  </Ripple>
                ))}
              </View>
            )}
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modal}
            onRequestClose={() => {
              setModal(false);
              setSelectedColor(null);
            }}
          >
            <View style={styles.modal}>
              <View style={styles.colorPicker}>
                {colors.map((color, index) => (
                  <Ripple
                    key={index}
                    onPress={() =>
                      setSelectedColor((prev) =>
                        prev === color.color ? null : color.color
                      )
                    }
                    style={[
                      { backgroundColor: color.color },
                      styles.colorElem,
                      selectedColor === color.color && { elevation: 5 },
                    ]}
                  ></Ripple>
                ))}
              </View>
              <TextInput
                onChangeText={(text) => setListTitle(text)}
                style={styles.input}
                placeholder="New List Title"
              />
              <Ripple
                onPress={() => addList()}
                style={[
                  selectedColor
                    ? { backgroundColor: selectedColor }
                    : { backgroundColor: "#88ff88" },
                  styles.add,
                ]}
              >
                <Text>Add</Text>
              </Ripple>
            </View>
          </Modal>
          <ModalList
            setLoading={setLoading}
            user={user}
            setUser={setUser}
            list={list}
            setList={setList}
            optionsModal={optionsModal}
            setOptionsModal={setOptionsModal}
            online={online}
          />
          <ListItems
            listId={listId}
            color={showColor}
            name={listName}
            items={listItems}
            setItems={setListItems}
            id={listId}
            user={user}
            setUser={setUser}
            loading={setLoading}
            showItems={showItems}
            setShowItems={setShowItems}
            online={online}
          />
        </View>
      </ScrollView>
      <Ripple onPress={() => setModal(true)} style={styles.addBtn}>
        <Icon name="pluscircle" style={styles.addIcon} />
      </Ripple>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    justifyContent: "flex-start",
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
    color: "#fff",
  },
  text: {
    color: "#fff",
    textAlign: "center",
    fontSize: 20,
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
    margin: 25,
    padding: 0,
  },
  list: {
    marginVertical: 25,
    padding: 15,
    borderRadius: 5,
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
    elevation: 1,
  },
});

export default Lists;

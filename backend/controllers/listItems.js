import { User } from "../models/user.js";

export const addItem = async (req, res) => {
  const { body, complete, dueDate, listId } = req.body;
  const id = req.headers.authorization;
  const newList = {
    body,
    complete,
    dueDate,
  };
  User.updateOne(
    { _id: id, "lists._id": listId },
    { $addToSet: { "lists.$.listItems": newList } },
    { new: true, upsert: true }
  )
    .then((update, err) => {
      console.log(update, err);
      if (err) {
        return res.status(401).json({ message: "Failed To Add Item" });
      }
      if (!err || update) {
        User.findById(id)
          .then((user) => {
            if (!user) {
              return res.status(401).json({ message: "Please Log Back In" });
            }
            if (user) {
              res.json({
                message: `You've added ${newList.body} to your list`,
                user: {
                  username: user.username,
                  email: user.email,
                  id: user._id,
                  lists: user.lists,
                },
              });
            }
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
};

export const updateComplete = async (req, res) => {
  const { listId, itemId, newComplete } = req.body;
  const id = req.headers.authorization;
  User.updateOne(
    { _id: id },
    { $set: { "lists.$[outter].listItems.$[inner].complete": newComplete } },
    { arrayFilters: [{ "outter._id": listId }, { "inner._id": itemId }] }
  )
    .then((update, err) => {
      if (update && !err) {
        User.findById(id)
          .then((user) => {
            return res.status(201).json({
              message: "Successfully updated",
              user: {
                id: user._id,
                username: user.username,
                email: user.email,
                lists: user.lists,
              },
            });
          })
          .catch((err) => {
            return res.status(401).json({ message: "Please login" });
          });
      }
      if (err) {
        return res.status(401).json({
          message: "Could not update list item, please reload and try again.",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(401)
        .json({ message: "Something Went wrong please reload and try again" });
    });
};

export const updateBody = (req, res) => {
  const id = req.headers.authorization;
  const { newBody, itemId, listId } = req.body;
  User.updateOne(
    { _id: id },
    { $set: { "lists.$[list].listItems.$[item].body": newBody } },
    { arrayFilters: [{ "list._id": listId }, { "item._id": itemId }] }
  )
    .then((update, err) => {
      if (update && !err) {
        User.findById(id)
          .then((user) => {
            return res.status(201).json({
              message: "Successfully updated",
              user: {
                id: user._id,
                username: user.username,
                email: user.email,
                lists: user.lists,
              },
            });
          })
          .catch((err) => {
            return res.status(401).json({ message: "Please login" });
          });
      }
      if (err) {
        return res.status(401).json({
          message: "Could not update list item, please reload and try again.",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(401)
        .json({ message: "Something Went wrong please reload and try again" });
    });
};

export const deleteItem = (req, res) => {
  const listId = req.params.listId;
  const itemId = req.params.itemId;
  const id = req.headers.authorization;
  User.updateOne(
    { _id: id },
    { $pull: { "lists.$[list].listItems": { _id: itemId } } },
    { arrayFilters: [{ "list._id": listId }] }
  )
    .then((update, err) => {
      if (update && !err) {
        User.findById(id)
          .then((user) => {
            return res.status(201).json({
              message: "Successfully deleted",
              user: {
                id: user._id,
                username: user.username,
                email: user.email,
                lists: user.lists,
              },
            });
          })
          .catch((err) => {
            return res
              .status(401)
              .json({ message: "Something Went wrong, please try again" });
          });
      }
      if (err) {
        return res
          .status(401)
          .json({ message: "Something Went wrong, please try again" });
      }
    })
    .catch((err) => {
      return res
        .status(401)
        .json({ message: "Something Went wrong, please try again" });
    });
};

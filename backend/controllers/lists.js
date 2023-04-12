import { User } from "../models/user.js";

export const addList = (req, res) => {
  const id = req.headers.authorization;
  const { title, color, listItems } = req.body;
  const newList = {
    title,
    color,
    listItems,
  };
  User.findByIdAndUpdate(
    id,
    { $push: { lists: newList } },
    { new: true, upsert: true }
  )
    .then((update, err) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Something Went Wrong, Please Try Again" });
      }
      if (!err) {
        res.status(201).json({
          message: `You've added ${title} as a new list`,
          user: {
            id: update._id,
            username: update.username,
            email: update.email,
            lists: update.lists,
          },
        });
      }
    })
    .catch((err) => console.log(err));
};

export const updateListTitle = (req, res) => {
  const id = req.headers.authorization;
  const listTitle = req.params.title;
  const listId = req.params.listId;
  User.updateOne(
    { _id: id, "lists._id": listId },
    { $set: { "lists.$.title": listTitle } }
  )
    .then((update, err) => {
      if (update) {
        User.findById(id)
          .then((user) => {
            return res.status(201).json({
              message: `Updated title to ${listTitle}`,
              user: {
                id: user._id,
                username: user.username,
                email: user.email,
                lists: user.lists,
              },
            });
          })
          .catch((err) => {
            return res.status(401).json({
              message: "Server error, please close app and try again",
            });
          });
      }
      if (err) {
        return res.status(401).json({
          message: "The list item was not updated, please try again",
        });
      }
    })
    .catch((err) => {
      return res.status(401).json({
        message: "Server error, please close app and try again",
      });
    });
};

export const updateListColor = (req, res) => {
  const id = req.headers.authorization;
  const listId = req.params.listId;
  const { color } = req.body;
  User.updateOne(
    { _id: id, "lists._id": listId },
    { $set: { "lists.$.color": color } }
  )
    .then((update, err) => {
      if (update && !err) {
        User.findById(id)
          .then((user) => {
            return res.status(201).json({
              message: "Successfully Updated",
              user: {
                id: user._id,
                username: user.username,
                email: user.email,
                lists: user.lists,
              },
            });
          })
          .catch((err) => {
return res.status(401).json({
              message: "Server error, please close app and try again",
            });
          });
      }
      if (err) {
        return res.status(401).json({
          message: "Server error, please close app and try again",
        });
      }
    })
    .catch((err) => {
return res.status(401).json({
              message: "Server error, please close app and try again",
            });
    });
};

export const deleteList = (req, res) => {
  const id = req.headers.authorization;
  const listId = req.params.id;
  User.updateOne({ _id: id }, { $pull: { lists: { _id: listId } } })
    .then((update, err) => {
      if (update) {
        User.findById(id)
          .then((user) => {
            return res.status(201).json({
              message: "Successfully Updated",
              user: {
                id: user._id,
                username: user.username,
                email: user.email,
                lists: user.lists,
              },
            });
          })
          .catch((err) => {
            return res.status(401).json({
              message: "Server error, please close app and try again",
            });
          });
      }
      if (err) {
        return res.status(401).json({
          message: "Server error, please close app and try again",
        });
      }
    })
    .catch((err) => {
      return res
        .status(401)
        .json({ message: "Server error, please close app and try again" });
    });
};

import { User } from "../models/user.js";
import bcrypt from "bcryptjs";

const encryptPassword = async (password) => {
  const hash = bcrypt.hash(password, 10);
  return hash;
};

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  const newUser = {
    username,
    email,
    password: await encryptPassword(password),
  };
  User.findOne({ username })
    .then((user) => {
      if (user) {
        return res.status(401).json({ message: `${username} already exsists` });
      }
      if (!user) {
        User.create(newUser)
          .then((newbie) => {
            return res
              .status(201)
              .json({ message: `Your new account was created ${username}` });
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
};

export const login = (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username }).then((user) => {
    if (!user) {
      return res.status(401).json({ message: "Incorrect Username" });
    }
    if (user) {
      bcrypt
        .compare(password, user.password)
        .then((isMatched) => {
          if (isMatched) {
            return res.status(201).json({
              message: `You have successfully logged in ${user.username}`,
              user: {
                id: user._id,
                username: user.username,
                email: user.email,
                lists: user.lists,
              },
            });
          }
          if (!isMatched) {
            return res.status(401).json({ message: "Incorrect password" });
          }
        })
        .catch((err) => console.log(err));
    }
  });
};

export const updateUsername = (req, res) => {
  const id = req.headers.authorization;
  const { newUsername } = req.body;
  User.findOne({ _id: id })
    .then((user) => {
      user.username = newUsername;
      user.save();
      return res.status(201).json({
        message: "Successfully updated username",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          lists: user.lists,
        },
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const updateEmail = (req, res) => {
  const id = req.headers.authorization
  const {newEmail} = req.body
  User.findOne({_id: id}).then((user) => {
  	user.email = newEmail;
  	user.save();
  	return res.status(201).json({message: "Successfully updated email", user: {
  		id: user._id,
          username: user.username,
          email: user.email,
          lists: user.lists,
  	}})
  }).catch((err) => {
  	console.log(err)
  })
};

export const deleteUser = (req, res) => {
  const id = req.params.userId;
  User.findByIdAndDelete(id)
    .then((update, err) => {
      if (!update || err) {
        return res.status(401).json({
          message: "An error occurred deleting your account, please try again",
        });
      }
      if (update) {
        return res
          .status(201)
          .json({ message: "Your account has successfully been deleted" });
      }
    })
    .catch((err) => {
      return res.status(401).json({
        message: "An error occurred deleting your account, please try again",
      });
    });
};

import { User } from "../models/user.js";

export const auth = (req, res, next) => {
  const id = req.headers.authorization;
  if (!id) {
    return res.status(401).json({ message: "Log Back In Please" });
  }
  if (id) {
    User.findById(id)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ message: "Log Back In Please" });
        }
        if (user) {
          next();
        }
      })
      .catch((err) => console.log(err));
  }
};

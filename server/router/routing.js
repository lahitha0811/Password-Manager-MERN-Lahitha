const express = require("express");
const router = express.Router();
const User = require("../models/schema");
const bcrypt = require("bcrypt");
const authenticate = require("../middlewares/authenticate");
const { encrypt, decrypt } = require("../models/EncDecManager");

// Registering
router.post("/register", async (req, res) => {
  const { name, email, password, cpassword } = req.body;

  if (!name || !email || !password || !cpassword) return res.status(400).json({ error: "Invalid Credentials" });

  if (password !== cpassword) return res.status(400).json({ error: "Passwords do not match." });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists." });

    const newUser = new User({ name, email, password, cpassword });
    await newUser.save();
    return res.status(201).json({ message: "User created successfully." });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: "Please fill all fields." });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "user doesn't exist please signup first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid Credentials." });

    const token = await user.generateAuthToken();
    res.cookie("jwtoken", token, { expires: new Date(Date.now() + 2592000000), httpOnly: true });

    return res.status(200).json({ message: "User login successfully.", name: user.name, email: user.email, passwords: user.passwords });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Authenticate 
router.get("/authenticate", authenticate, async (req, res) => {
  try {
    const { name, email, passwords } = req.rootUser;
    res.status(200).json({ name, email, passwords });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Adding new password
router.post("/addnewpassword", authenticate, async (req, res) => {
  const { platform, userPass, userEmail, platEmail } = req.body;

  if (!platform || !userPass || !userEmail || !platEmail) {
    return res.status(400).json({ error: "Please fill the form properly" });
  }

  try {
    const rootUser = req.rootUser;
    const { iv, encryptedPassword } = encrypt(userPass);
    const savedUser = await rootUser.addNewPassword(encryptedPassword, iv, platform, platEmail);

    if (savedUser) {
      return res.status(200).json({ message: "Successfully added your password.", passwords: savedUser.passwords });
    } else {
      return res.status(400).json({ error: "Could not save the password." });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "An unknown error occurred." });
  }
});

// Delete password
router.post("/deletepassword", authenticate, async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Could not find data." });

  try {
    const rootUser = req.rootUser;
    const result = await User.updateOne({ email: rootUser.email }, { $pull: { passwords: { _id: id } } });

    if (result.modifiedCount === 0) return res.status(400).json({ error: "Could not delete the password." });

    const updatedUser = await User.findOne({ email: rootUser.email });
    return res.status(200).json({ message: "Successfully deleted your password.", passwords: updatedUser.passwords });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Update password
router.put("/updatepassword", authenticate, async (req, res) => {
  const { id, platform, userPass, email } = req.body;
  if (!id || !platform || !userPass || !email) {
    return res.status(400).json({ error: "Incomplete data for update." });
  }

  try {
    const rootUser = req.rootUser;
    const { iv, encryptedPassword } = encrypt(userPass);

    // Update password in user's embedded array
    const result = await User.updateOne(
      { email: rootUser.email, "passwords._id": id },
      {
        $set: {
          "passwords.$.platform": platform,
          "passwords.$.platEmail": email,
          "passwords.$.encryptedPassword": encryptedPassword,
          "passwords.$.iv": iv,
        },
      }
    );

    if (result.modifiedCount === 0)
      return res.status(400).json({ error: "Could not update the password." });

    const updatedUser = await User.findOne({ email: rootUser.email });
    return res.status(200).json({ message: "Password updated successfully.", passwords: updatedUser.passwords });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("jwtoken", { path: "/" });
  res.status(200).send("Logout");
});

// Decrypt
router.post("/decrypt", (req, res) => {
  try {
    console.log("DEBUG /decrypt body:", req.body); // <- add this for now
    const { iv, encryptedPassword, password } = req.body;
    const encryptedData = encryptedPassword || password;
    if (!iv || !encryptedData) {
      console.error("Decryption error: Missing encrypted data or IV");
      return res.status(400).json({ error: "Missing encrypted data or IV" });
    }
    const decrypted = decrypt(encryptedData, iv);
    return res.status(200).json({ decrypted });
  } catch (err) {
    console.error("Decryption error:", err.message);
    return res.status(500).json({ error: "Decryption failed." });
  }
});




// Update password
// router.put("/updatepassword", authenticate, async (req, res) => {
//   const { id, platform, platEmail, userPass } = req.body;

//   if (!id || !platform || !platEmail || !userPass)
//     return res.status(400).json({ error: "Please fill all fields." });

//   try {
//     const { iv, encryptedPassword } = encrypt(userPass);
//     const rootUser = req.rootUser;

//     const updatedUser = await User.findOneAndUpdate(
//       { email: rootUser.email, "passwords._id": id },
//       {
//         $set: {
//           "passwords.$.platform": platform,
//           "passwords.$.platEmail": platEmail,
//           "passwords.$.password": encryptedPassword,
//           "passwords.$.iv": iv,
//         },
//       },
//       { new: true }
//     );

//     if (!updatedUser)
//       return res.status(400).json({ error: "Update failed." });

//     res.status(200).json({
//       message: "Password updated successfully!",
//       passwords: updatedUser.passwords,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });


module.exports = router;

const mongoose = require("mongoose"); 
const bcrypt = require("bcrypt"); 
const jwt = require("jsonwebtoken"); 

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  cpassword: String,
  passwords: [
  {
    platform: String,
    platEmail: String,
    encryptedPassword: String,
    iv: String,
  }
],

});

userSchema.methods.addNewPassword = async function(encryptedPassword, iv, platform, platEmail) {
  try {
    // Push the new password object to the passwords array
    this.passwords.push({ platform, platEmail,encryptedPassword, iv });

    // Save the updated user document
    await this.save();

    return this; // return the updated user
  } catch (err) {
    console.error("addNewPassword error:", err);
    throw err;
  }
};


// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    console.log("🔒 Hashing password before save...");
    this.password = await bcrypt.hash(this.password, 12);
    this.cpassword = await bcrypt.hash(this.cpassword, 12);
  }
  next();
});

// Token generator
userSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    return token;
  } catch (err) {
    console.log(err);
  }
};

const User = mongoose.model("user-data", userSchema);
module.exports = User;  
// models/EncDecManager.js
const crypto = require("crypto");

// AES-256-CBC requires a 32-byte key and 16-byte IV
const encrypt = (userPass) => {
  try {
    const key = Buffer.from(process.env.CRYPTO_SECRET_KEY, "utf8"); // must be 32 bytes
    if (key.length !== 32) {
      throw new Error("CRYPTO_SECRET_KEY must be 32 characters long for AES-256-CBC");
    }

    const iv = crypto.randomBytes(16); // proper 16-byte IV
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    let encrypted = cipher.update(userPass, "utf8", "base64");
    encrypted += cipher.final("base64");

    return {
      iv: iv.toString("base64"), // store IV as base64 string
      encryptedPassword: encrypted,
    };
  } catch (err) {
    console.error("Encryption error:", err.message);
    throw err;
  }
};

const decrypt = (encrypted, ivBase64) => {
  try {
    if (!encrypted || !ivBase64) {
      throw new Error("Missing encrypted data or IV");
    }

    const key = Buffer.from(process.env.CRYPTO_SECRET_KEY, "utf8");
    if (key.length !== 32) {
      throw new Error("CRYPTO_SECRET_KEY must be 32 bytes for AES-256-CBC");
    }

    const iv = Buffer.from(ivBase64, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.error("Decryption error:", err.message);
    throw err;
  }
};


module.exports = { encrypt, decrypt }; 
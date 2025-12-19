const path = require("path");
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// Load env
dotenv.config({ path: path.join(__dirname, "config.env") });

// Middleware
app.use(express.json());
app.use(cookieParser());

// ===== SERVE REACT FIRST =====
const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "client/build")));
}

// DB
require("./db/connection");

// Routes
app.use(require("./router/routing"));

// React fallback (AFTER routes)
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname1, "client", "build", "index.html")
    );
  });
}

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

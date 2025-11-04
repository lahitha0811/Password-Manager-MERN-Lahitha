const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require('cookie-parser'); 

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(cookieParser());   

// Setting up deotenv
dotenv.config({ path: "./config.env" });

const PORT = process.env.PORT || 8001; 

// Connecting with database
require("./db/connection"); 

app.use(express.json()); 

// Linking router files 
app.use(require("./router/routing")); 
 
// Listening to port 
app.listen(PORT, () => {
    console.log(`listening to port : http://localhost:${PORT}/`) 
}) 
const express = require('express')
const app = express()
const fs = require('fs');


const db = require('./config/mongodb')


const Route = require('./routes/index')


const dotenv = require('dotenv').config()
const cookieParser = require('cookie-parser')

const cors = require("cors")

const moment = require('moment')

moment().format()


//
db.connect()
app.use(cookieParser(process.env.SERECT_COOKIES))

app.use(cors({
    origin: [
        "https://localhost:3000",
        "https://192.168.1.6:3000",
        "https://192.168.1.4:3000",
        "https://192.168.1.2:3000",
        "https://192.168.1.5:3000",
        "https://192.168.1.8:3000",
        "https://192.168.1.7:3000",
        "https://192.168.1.9:3000",
        "https://nghuyhoang.netlify.app",
        "https://192.168.1.9:3001",
        "https://railway.app",
        `${process.env.host}`
    ],
    credentials: true,
    exposedHeaders: ["set-cookie"]
}))

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message:
    "Too many accounts created from this IP, please try again after an hour"
  });
  
  //  apply to all requests
  app.use(limiter);

/* setup parse */
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

const options = {
    key: fs.readFileSync('localhost+4-key.pem'),
    cert: fs.readFileSync('localhost+4.pem')
  };

/* Route */
Route(app)
const https = require("https")
const server = https.createServer(options,app)
const socketIo = require("socket.io")(server, { cors: { origin: "*", } });
const socketHandle = require("./app/socket/index")
socketHandle(socketIo)

server.listen(process.env.PORT, () => console.log(server.address().port))


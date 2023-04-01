const app = require("express")();
const http = require("http").createServer(app);
const cors = require("cors");
app.use(cors());
require("dotenv").config();
app.get("/", (req, res) => {
  res.send("Node Server is running. Yay!!");
});

//Socket Logic
const socketio = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
let users = [];
socketio.on("connection", (userSocket) => {
  console.log("a user connected " + userSocket.id);
  userSocket.on("send_message", (data) => {
    console.log("new data " + data);
    userSocket.broadcast.emit("receive_message", data);
  });
});
console.log("application is running on port " + process.env.PORT);
http.listen(process.env.PORT);

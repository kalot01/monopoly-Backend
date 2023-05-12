const app = require("express")();
const http = require("http").createServer(app);
const cors = require("cors");
app.use(cors());
require("dotenv").config();
app.get("/", (req, res) => {
  res.send("Node Server is running. Yay!!");
});
http.listen(process.env.PORT);
//Socket Logic
const socketio = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});
let users = {
  tax: {
    name: "tax",
    money: 0,
    socket: "tax",
  },
};
let historique = [];
socketio.on("connection", (userSocket) => {
  console.log("a user connected " + userSocket.id);

  userSocket.on("setName", (data) => {
    if (users[data] != null) {
      users[data].socket = userSocket.id;
    } else {
      users[data] = {
        name: data,
        money: 0,
        socket: userSocket.id,
      };
    }

    console.log(users);
    userSocket.emit("players", users);
    userSocket.broadcast.emit("players", users);
  });
  userSocket.on("getPlayers", (data) => {
    userSocket.emit("players", users);
  });
  userSocket.on("getHistorique", (data) => {
    userSocket.emit("historique", historique);
  });
  userSocket.on("sendMoney", (data) => {
    if (data.player != null && users[data.player] != undefined) {
      users[data.me].money =
        Math.round(users[data.me].money * 10 - parseFloat(data.money) * 10) /
        10;
      users[data.player].money =
        Math.round(
          users[data.player].money * 10 + parseFloat(data.money) * 10
        ) / 10;
      historique.push(`${data.me} payed to ${data.player} :  ${data.money}`);
      userSocket.emit("historique", historique);
      userSocket.broadcast.emit("historique", historique);
      userSocket.emit("players", users);
      userSocket.broadcast.emit("players", users);
    }
  });
  userSocket.on("addMoney", (data) => {
    users[data.player].money =
      Math.round(users[data.player].money * 10 + parseFloat(data.money) * 10) /
      10;
    historique.push(`${data.player} got from the bank ${data.money}`);
    userSocket.emit("players", users);
    userSocket.broadcast.emit("players", users);
    userSocket.emit("historique", historique);
    userSocket.broadcast.emit("historique", historique);
  });
  userSocket.on("withdrawMoney", (data) => {
    users[data.player].money =
      Math.round(users[data.player].money * 10 - parseFloat(data.money) * 10) /
      10;
    historique.push(`${data.player} payed to the bank ${data.money}`);
    userSocket.emit("players", users);
    userSocket.broadcast.emit("players", users);
    userSocket.emit("historique", historique);
    userSocket.broadcast.emit("historique", historique);
  });
  userSocket.on("playDice", (data) => {
    let d1 = Math.floor(Math.random() * 6 + 1);
    let d2 = Math.floor(Math.random() * 6 + 1);
    userSocket.emit("dice", `${d1},${d2}`);
    userSocket.broadcast.emit("dice", `${d1},${d2}`);
    historique.push(`${data} played dice and got ${d1},${d2}`);
    userSocket.emit("historique", historique);
    userSocket.broadcast.emit("historique", historique);
  });
  userSocket.on("startGame", () => {
    Object.keys(users).map((element, key) => (users[element].money = 150));
    userSocket.emit("players", users);
    userSocket.broadcast.emit("players", users);
    historique = [];
    historique.push("Game started");
    userSocket.emit("historique", historique);
    userSocket.broadcast.emit("historique", historique);
  });
  userSocket.on("resetGame", () => {
    users = {
      tax: {
        name: "tax",
        money: 0,
        socket: "tax",
      },
    };
    historique = [];
    historique.push("Game reset");
    userSocket.emit("historique", historique);
    userSocket.emit("players", users);
    userSocket.broadcast.emit("players", users);
  });
});
console.log("application is running on port " + process.env.PORT);

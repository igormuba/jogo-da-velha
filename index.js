let express = require("express");
let app = express();
let server = require("http").createServer(app);
let io = require("socket.io")(server);
const path = require("path");
const fs = require("fs");

const clients = [];
let matches = {};

const addClient = (socket) => {
  console.log("New client connected", socket.id);
  clients[socket.id] = socket;
};
const removeClient = (socket) => {
  console.log("Client disconnected", socket.id);
  delete clients[socket.id];
};

io.on("connection", function (client) {
  let socket = client;
  let id = socket.id;
  addClient(socket);
  console.log("Client connected...");
  client.on("join", function (data) {
    console.log(typeof data);
    if (typeof data === "object") {
      console.log(data);

      for (let index in clients) {
        console.log(clients[index].id);
        if (clients[index].id !== id) {
          clients[index].emit("remotePlay", data);
        }
      }
    }
    client.emit("messages", "Hello from server");
  });
  client.on("play", function (data) {
    console.log(data);
    client.emit("messages", "Hello from server");
  });
  socket.on("disconnect", () => {
    removeClient(socket);
    socket.broadcast.emit("clientdisconnect", id);
  });
});
const listingPath = path.join(__dirname, "client");
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "index.html"));
});
app.get("*", (req, res) => {
  // Build the path of the file using the URL pathname of the request.
  const filePath = path.join(listingPath, req.path);

  // If the path does not exist, return a 404.
  if (!fs.existsSync(filePath)) {
    return res.status(404).end();
  }

  // Check if the existing item is a directory or a file.
  if (fs.statSync(filePath).isDirectory()) {
    const filesInDir = fs.readdirSync(filePath);
    // If the item is a directory: show all the items inside that directory.
    return res.send(filesInDir);
  } else {
    const fileContent = fs.readFileSync(filePath, "utf8");
    // If the item is a file: show the content of that file.
    return res.send(fileContent);
  }
});

server.listen(process.env.PORT || 4200);

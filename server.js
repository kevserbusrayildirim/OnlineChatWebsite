const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname + "/public")));

let rooms = new Map()
let clients = new Map()

io.on("connection", function(socket){
    socket.on("newuser",function(username){
        clients.set(username, [])
      //  clients.push(socket.id)
        socket.emit("roomsData", Array.from(rooms.keys()))
        socket.emit("clientsData", Array.from(clients.keys()))
    });
    socket.on("exituser",function(username){
        socket.broadcast.emit("update", username + " left the conversation");
    });
    socket.on("chat",function(message){
        socket.broadcast.emit("chat", message);
    });
    socket.on("newroom",function(roomName){
        rooms.set(roomName, [])
        socket.emit("newrooms", roomName)
        socket.broadcast.emit("newrooms", roomName);
    });
    socket.on("selectroom",function(roomName){
        let room = rooms.get(roomName)
        room.push(socket.id)
        rooms.set(roomName, room)
        console.log(rooms.get(roomName))
    });
    socket.on("selectclient",function(clientName){
        const client = clients.get(clientName)
        socket.to(client).emit("selectclient", client.username);
    });
    socket.on("newUserJoined",function(username, roomName){
        for (let i = 0; i < rooms.get(roomName).length; i++) {
            const element = rooms.get(roomName)[i];
            socket.to(element).emit("userJoinedRoom", username + " joined the conversation");
        }
    });
});


server.listen(5000);

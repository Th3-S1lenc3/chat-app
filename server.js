const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const socketio = require('socket.io');
const BiMap = require('bidirectional-map');

const app = express();

let server = http.createServer(app);

if (process.env.MODE && process.env.MODE.toLowerCase() === 'https') {
  console.log('Mode: https');
  server = https.createServer({
    key: fs.readFileSync('keys/server.key'),
    cert: fs.readFileSync('keys/server.crt'),
  }, app);
}

const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')))

// Limit room size to 16 users
const MAX_ROOM_SIZE = 16;

const clients = new BiMap();

io.on('connect', socket => {
  console.log('User Connected', socket.id);
  clients.set(socket.id);

  let currentRoom = null;

  socket.on('JOIN_ROOM', (roomName) => {
    let room = io.sockets.adapter.rooms[roomName];

    if (room && room.length > MAX_ROOM_SIZE) {
      io.to(socket.id).emit('ROOM_FULL', null);
      socket.broadcast.to(roomName).emit('INTRUSION_ATTEMPT', null);
    }
    else {
      if (currentRoom) {
        socket.leave(currentRoom);
        socket.broadcast.to(currentRoom).emit('USER_DISCONNECTED', null);
      }

      currentRoom = roomName;
      socket.join(currentRoom);

      io.to(socket.id).emit('ROOM_JOINED', currentRoom);

      socket.broadcast.to(currentRoom).emit('NEW_CONNECTION', socket.id);
    }
  });

  socket.on('LEAVE_ROOM', () => {
    const id = clients.get(socket.id);

    socket.leave(currentRoom);
    io.to(socket.id).emit('ROOM_LEFT', null);

    socket.broadcast.to(currentRoom).emit('USER_DISCONNECTED', id);
    currentRoom = null;
  });

  socket.on('MESSAGE', (msg) => {
    console.log(`New Message - ${msg.text}`);
    if (currentRoom) {
      socket.broadcast.to(currentRoom).emit('MESSAGE', msg);
      io.to(socket.id).emit('MESSAGE', msg);
    }
    else {
      io.to(socket.id).emit('ERROR', 'please join a room to send messages');
    }
  });

  socket.on('PUBLIC_KEY', (key, to) => {
    const keySnippet = key.slice(734,750);
    if (typeof clients.get(socket.id) === 'undefined') {
      clients.set(socket.id, keySnippet);
    }

    if (to) {
      io.to(to).emit('PUBLIC_KEY', key);
    }
    else {
      socket.broadcast.to(currentRoom).emit('PUBLIC_KEY', key);
    }
  });

  socket.on('disconnect', () => {
    const id = clients.get(socket.id);
    socket.broadcast.to(currentRoom).emit('USER_DISCONNECTED', id);
  })
});


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

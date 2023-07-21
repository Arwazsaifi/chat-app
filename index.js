const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const { OAuth2Client } = require('google-auth-library');

const socketio=require('socket.io');
const dotenv = require('dotenv'); 
dotenv.config();

const app = express();
const PORT = process.env.PORT;
const server=require('http').createServer(app);
const io=socketio(server); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.Mongo_Uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/', indexRoutes);
app.use('/auth', authRoutes);

io.on('connection', (socket) => {
    console.log(`${socket.username} connected`);
  
    
    socket.on('createRoom', (roomName) => {
      const roomId = generateUniqueRoomId();
      socket.join(roomId);
      chatRooms.set(roomId, { name: roomName, members: [socket.username] });
      socket.emit('roomCreated', { roomId, roomName });
    });
  
    socket.on('joinRoom', (roomId) => {
      const room = chatRooms.get(roomId);
      if (room) {
        socket.join(roomId);
        room.members.push(socket.username);
        io.to(roomId).emit('userJoined', { roomId, members: room.members });
      }
    });
  
    socket.on('message', (message) => {
      console.log(`Received message from ${socket.username}:`, message);
  
      const timestamp = new Date().toISOString();
      const roomId = getRoomId(socket);
      io.to(roomId).emit('message', {
        username: socket.username,
        timestamp,
        content: message,
      });
      socket.on('typing', () => {
        if (roomId) {
          const room = chatRooms.get(roomId);
          if (room) {
            socket.broadcast.to(roomId).emit('userTyping', socket.username);
          }
        }
      });
    
      socket.on('stopTyping', () => {
        if (roomId) {
          const room = chatRooms.get(roomId);
          if (room) {
            socket.broadcast.to(roomId).emit('userStopTyping', socket.username);
          }
        }
      });
      socket.on('setOnlineStatus', (status) => {
        if (roomId) {
          const room = chatRooms.get(roomId);
          if (room) {
            
            room.members.forEach((username) => {
              if (username === socket.username) {
                users.get(username).online = status;
              }
            });
    
            io.to(roomId).emit('userStatusChanged', {
              username: socket.username,
              online: status,
            });
          }
        }
      });
    });

    socket.on('disconnect', () => {
      console.log(`${socket.username} disconnected`);
      users.delete(socket.id);
    });
  });
  
  function generateUniqueRoomId() {
    return Math.random().toString(36).substr(2, 8);
  }
  
  function getRoomId(socket) {
    const rooms = socket.rooms;
    for (const roomId of rooms) {
      if (roomId !== socket.id) {
        return roomId;
      }
    }
    return null;
  }


app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

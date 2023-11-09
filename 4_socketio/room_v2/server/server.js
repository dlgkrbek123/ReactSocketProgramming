const { Server } = require('socket.io');

const io = new Server('5000', {
  cors: {
    origin: 'http://localhost:3000',
  },
});

const clients = new Map();

io.sockets.on('connection', (socket) => {
  socket.on('login', (data) => {
    const { userId, roomNumber } = data;

    socket.join(roomNumber);
    clients.set(userId, socket.id);
    socket.broadcast.emit('sLogin', userId);
  });

  socket.on('message', (res) => {
    const { target } = res;

    if (target) {
      const toUser = clients.get(target);
      io.sockets.to(toUser).emit('sMessage', res);
      return;
    }

    const myRooms = Array.from(socket.rooms);
    if (myRooms.length > 1) {
      socket.broadcast.in(myRooms[1]).emit('sMessage', res);
    } else {
      socket.broadcast.emit('sMessage', res);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const { Server } = require('socket.io');
const { posts } = require('./data');

const io = new Server('5000', {
  cors: {
    origin: 'http://localhost:3000',
  },
});

let users = []; // userName과 socketId를 매칭

const addNewUser = (userName, socketId) => {
  console.log(userName);

  if (!getUser(userName)) {
    users.unshift({
      ...posts[Math.floor(Math.random() * 5)],
      userName,
      socketId,
    });
  }
};

const getUser = (userName) => {
  return users.find((user) => user.userName === userName);
};

io.use((socket, next) => {
  const userName = socket.handshake.auth.userName;
  console.log('gg', userName);

  if (!userName) {
    console.log('err');
    return next(new Error('invalid userName'));
  }

  socket.userName = userName;
  next();
});

io.on('connection', (socket) => {
  addNewUser(socket.userName, socket.id);

  // userList 변동
  socket.on('userList', () => io.sockets.emit('user-list', users));

  // 알림 전달
  socket.on('sendNotification', ({ senderName, receiverName, type }) => {
    const receiver = getUser(receiverName);

    io.to(receiver.socketId).emit('getNotification', {
      senderName,
      type,
    });
  });

  socket.on('disconnect', () => console.log('logout'));
});

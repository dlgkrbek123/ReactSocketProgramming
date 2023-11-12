const User = require('./schema/User');

const init = (io) => {
  // 미들웨어 등록
  io.use(async (socket, next) => {
    const userId = socket.handshake.auth.userId;

    if (!userId) {
      return next(new Error('invalid userId'));
    }

    // 연결시 socket에 userId 추가
    socket.userId = userId;
    await findOrCreateUser(userId, socket.id);
    next();
  });

  io.on('connection', async (socket) => {
    // 연결이 생기면 user-list를 모두에게 전달
    io.sockets.emit('user-list', await User.find());

    // 연결 끊김 처리
    socket.on('disconnect', async () => {
      // DB 업데이트 하고 소켓에 메시지 전송
      await User.findOneAndUpdate({ _id: socket.userId }, { status: false });
      io.sockets.emit('user-list', await User.find());
    });
  });
};

const findOrCreateUser = async (userId, socketId) => {
  if (userId) {
    const document = await User.findOneAndUpdate(
      { _id: userId },
      { status: true }
    );

    if (document) return document;
    else {
      return await User.create({
        _id: userId,
        userId,
        socketId,
        status: true,
      });
    }
  }
};

module.exports.init = init;

const { PrivateRoom, PrivateMsg } = require('./schema/Private');

const init = (io) => {
  // private 네임스페이스 미들웨어
  io.of('/private').use((socket, next) => {
    const userId = socket.handshake.auth.userId;

    if (!userId) return next(new Error('invalid userId'));
    else {
      socket.userId = userId;
      next();
    }
  });

  // private 네임스페이스 메시지
  io.of('/private').on('connection', (socket) => {
    // 초기 메시지 내려주기
    socket.on('msgInit', async ({ targetId }) => {
      const userId = targetId[0];
      const privateRoom = await getRoomDocument(userId, socket.userId);

      if (privateRoom) {
        const roomNumber = privateRoom._id;
        const msgList = await PrivateMsg.find({ roomNumber }).exec();

        io.of('/private')
          .to(roomNumber)
          .emit('private-msg-init', { msg: msgList });
      }
    });

    // 메시지 전송
    socket.on('privateMsg', async ({ fromUserId, toUserId, msg, time }) => {
      const privateRoom = await getRoomDocument(socket.userId, toUserId);

      if (privateRoom) {
        const roomId = privateRoom._id;

        socket.broadcast.in(roomId).emit('private-msg', {
          fromUserId: socket.userId,
          toUserId,
          msg,
          time,
        });
        await createMsgDocument(roomId, { fromUserId, toUserId, msg, time });
      }
    });

    //
    socket.on('reqJoinRoom', async ({ targetId, targetSocketId }) => {
      // 유저랑 socketId 받아라

      io.of('/private')
        .to(targetSocketId)
        .emit('msg-alert', { roomNumber: privateRoom });
    });

    // 초대받은 클라이언트가 호출해서 join
    socket.on('resJoinRoom', (res) => socket.join(res));
  });
};

// userId 입력받고 Room 객체 리턴
const getRoomDocument = async (fromId, toId) => {
  return (
    (await PrivateRoom.findById(`${fromId}-${toId}`)) ||
    (await PrivateRoom.findById(`${toId}-${fromId}`))
  );
};

// roomId와 일치하는 Room 객체 리턴 / 생성
const findOrCreateRoomDocument = async (roomId) => {
  if (room === null) return; // undefined
  const document = await PrivateRoom.findById(roomId);

  return document ?? (await PrivateRoom.create({ _id: roomId }));
};

// 메시지 document 생성
const createMsgDocument = async (
  roomNumber,
  { fromUserId, toUserId, msg, time }
) => {
  if (roomNumber === null) return;

  return await PrivateMsg.create({
    roomNumber,
    fromUserId,
    toUserId,
    msg,
    time,
  });
};

module.exports.init = init;

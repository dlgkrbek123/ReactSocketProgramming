const { GroupUserList, GroupRoom, GroupMsg } = require('./schema/Group');

const init = (io) => {
  // 네임스페이스 미들웨어
  io.of('/group').use(async (socket, next) => {
    const userId = socket.handshake.auth.userId;

    if (!userId) {
      console.log('err');
      return next(new Error('invalid userId'));
    }

    socket.userId = userId;
    await createGroupUser(userId, socket.id);
    next();
  });

  // 이벤트 핸들러 등록
  io.of('/group').on('connection', async (socket) => {
    // 접속하면 바로 내가 속한 그룹 리스트를 전달
    const groupRoom = await GroupRoom.find({
      loginUserId: socket.userId,
    }).exec();
    socket.emit('group-list', groupRoom);

    // 방의 메시지 초기로드
    socket.on('msgInit', async ({ targetId }) => {
      const roomNumber = targetId.join(',');
      const groupMsg = await GroupMsg.find({ roomNumber }).exec();

      io.of('/group')
        .to(roomNumber)
        .emit('group-msg-init', { msg: groupMsg || [] });
    });

    // 모두에게 초대 메시지를 전송
    socket.on('reqGroupJoinRoom', async ({ socketId }) => {
      const groupUser = await GroupUserList.find()
        .where('userId')
        .in(socketId.split(','));
      groupUser.forEach((v) => {
        io.of('/group').to(v.socketId).emit('group-chat-req', {
          roomNumber: socketId,
          socketId: v.socketId,
          userId: socket.userId,
        });
      });
    });

    // 그룹메시지 보내기
    socket.on('groupMsg', async (res) => {
      const { msg, toUserSocketId, toUserId, fromUserId, time } = res;

      socket.broadcast.in(toUserSocketId).emit('group-msg', {
        fromUserId,
        toUserId,
        toUserSocketId,
        msg,
        time,
      });
      await createMsgDocument(toUserSocketId, res);
    });

    // 방에 재참여
    socket.on('joinGroupRoom', ({ roomNumber }) => socket.join(roomNumber));

    // 초대받은 방에 참여
    socket.on('resGroupJoinRoom', async ({ roomNumber, socketId }) => {
      socket.join(roomNumber);

      await createGroupRoom(socket.userId, roomNumber, roomNumber);
      const groupRoom = await GroupRoom.find({
        loginUserId: socket.userId,
      }).exec();
      io.of('/group').to(socketId).emit('group-list', groupRoom);
    });
  });
};

// 개인별 방 생성
async function createGroupRoom(loginUserId, userId, socketId) {
  if (loginUserId == null) return;

  return await GroupRoom.create({
    loginUserId: loginUserId,
    status: true,
    userId: userId,
    socketId: socketId,
    type: 'group',
  });
}

// 그룹에 속하기 위한 객체 생성
async function createGroupUser(userId, socketId) {
  if (userId == null) return;
  const document = await GroupUserList.findOneAndUpdate(
    { userId: userId },
    { socketId: socketId }
  );
  if (document) return document;

  return await GroupUserList.create({
    status: true,
    userId: userId,
    socketId: socketId,
  });
}

// 메시지 객체 생성
async function createMsgDocument(roomNumber, res) {
  if (roomNumber == null) return;

  return await GroupMsg.create({
    roomNumber: roomNumber,
    msg: res.msg,
    toUserId: res.toUserId,
    fromUserId: res.fromUserId,
    time: res.time,
  });
}

module.exports.init = init;

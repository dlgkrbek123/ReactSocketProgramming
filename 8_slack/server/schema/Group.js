const { Schema, model } = require('mongoose');

// 그룹 채팅을 위한 user 컬렉션 => 일반 유저와 1대1 대응
const groupUserList = new Schema({
  status: Boolean,
  userId: String,
  socketId: String,
});

// 방은 하나지만 참여자 개수만큼 만듦
const groupRoom = new Schema({
  loginUserId: String,
  status: Boolean,
  userId: String,
  socketId: String,
  type: String,
});

// 그룹채팅 메시지
const msg = new Schema({
  roomNumber: String,
  msg: String,
  toUserId: String,
  fromUserId: String,
  time: String,
});

module.exports = {
  GroupUserList: model('Group-user', groupUserList),
  GroupRoom: model('Group-room', groupRoom),
  GroupMsg: model('Group-msg', msg),
};

const common = require('./common');
const privateMsg = require('./privateMsg');
const groupMsg = require('./groupMsg');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

mongoose.set('strictQuery', false);
mongoose
  .connect('mongodb://localhost:27017')
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

const io = new Server(5000, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

common.init(io);
groupMsg.init(io);
privateMsg.init(io);

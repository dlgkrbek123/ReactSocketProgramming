const { Server } = require('socket.io');
const { seats } = require('./data');

/*
  영화별 좌석 현황
  원래라면 DB로 구현해야함
  임시적으로 인-메모리 방식으로 구현
*/
let avatar = [...seats];
let antman = [...seats];
let cats = [...seats];

const setSeats = (roomNumber, seat) => {
  let temp = [];

  const setStatus = (seats) => {
    return seats.map((i) => {
      return i.seatNumber === seat
        ? {
            ...i,
            status: 3,
          }
        : i;
    });
  };

  if (roomNumber === '1') {
    temp = [...avatar].map((s) => setStatus(s));
    avatar = [...temp];
  } else if (roomNumber === '2') {
    temp = [...antman].map((s) => setStatus(s));
    antman = [...temp];
  } else {
    temp = [...cats].map((s) => setStatus(s));
    cats = [...temp];
  }

  return temp;
};

const io = new Server('5000', {
  cors: {
    origin: 'http://localhost:3000',
  },
});

io.on('connection', (socket) => {
  socket.on('join', (movie) => {
    socket.join(movie); // join room
    let tempSeat = [];

    if (movie === '1') tempSeat = avatar;
    else if (movie === '2') tempSeat = antman;
    else tempSeat = cats;

    io.sockets.in(movie).emit('sSeatMessage', tempSeat); // 속한 소켓에 좌석 정보 갱신
  });

  socket.on('addSeat', (seat) => {
    const myRooms = Array.from(socket.rooms);
    io.sockets.in(myRooms[1]).emit('sSeatMessage', setSeats(myRooms[1], seat));
  });

  socket.on('disconnect', () => console.log('logout'));
});

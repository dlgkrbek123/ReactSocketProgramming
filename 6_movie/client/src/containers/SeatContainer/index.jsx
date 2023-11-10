import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './seatContainer.module.css';
import { socket } from '../../socket';

const cx = classNames.bind(styles);

const SeatContainer = () => {
  const { id, title } = useParams();
  const [booked, setBooked] = useState('');
  const [seats, setSeats] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const setSeat = (data) => setSeats(data);

    socket.on('sSeatMessage', setSeat);
    socket.emit('join', id);

    return () => {
      socket.off('sSeatMessage', setSeat);
      socket.disconnect();
    };
  }, []);

  const onClickSeat = (e) => {
    if (!isDisabled) {
      const { id, status } = e.target.dataset;

      if (status !== '3' && status !== '0') {
        setBooked(id);
        setSeats(
          seats.map((s) => {
            return s.map((i) => {
              return {
                ...i,
                status: i.seatNumber === id ? 2 : i.status === 2 ? 1 : i.status,
              };
            });
          })
        );
      }
    }
  };

  const onConfirm = () => {
    if (booked) {
      socket.emit('addSeat', booked);
      setIsDisabled(true);
    }
  };

  return (
    <div className={cx('seat_container')}>
      <h2 className={cx('title')}>{title}</h2>
      <div className={cx('screen')}>screen</div>
      <ul className={cx('wrap_seats')}>
        {seats.map((v) => {
          return v.map((i, idx) => (
            <li
              key={`seat_${idx}`}
              data-id={i.seatNumber}
              data-status={i.status}
              className={cx(
                'seat',
                i.status === 0 && 'empty',
                i.status === 1 && 'default',
                i.status === 2 && 'active',
                i.status === 3 && 'soldout'
              )}
              onClick={onClickSeat}
            />
          ));
        })}
      </ul>
      <div className={cx('r_wrap')}>
        <h4 className={cx('r_title')}>booked</h4>
        {!isDisabled && (
          <button className={cx('r_confirm')} onClick={onConfirm}>
            Confirm
          </button>
        )}
      </div>
    </div>
  );
};

export default SeatContainer;

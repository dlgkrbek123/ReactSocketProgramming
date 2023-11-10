import { useState, useEffect } from 'react';
import { socket } from '../../socket';
import styles from './Navbar.module.css';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { HiOutlinePaperAirplane } from 'react-icons/hi';

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const getNoti = (data) => {
      const temp =
        data.type === '0' ? [...notifications, data] : notifications.pop();
      setNotifications(temp || []);
    };

    socket.on('getNotification', getNoti);

    return () => {
      socket.off('getNotification', getNoti);
    };
  }, []);

  return (
    <div className={styles.navbar}>
      <span className={styles.logo}>Instagram</span>
      <div className={styles.icons}>
        <div className={styles.heartContainer}>
          {notifications.length > 0 && <span className={styles.noti} />}
          <AiOutlineHeart size="20" className={styles.heart} />
          {notifications.length > 0 && (
            <div className={styles.likeBubble}>
              <AiFillHeart size="15" color="#fff" />
              &nbsp;<div className={styles.count}>{notifications.length}</div>
            </div>
          )}
        </div>
        <HiOutlinePaperAirplane className={styles.airplane} size="20" />
      </div>
    </div>
  );
};

export default Navbar;

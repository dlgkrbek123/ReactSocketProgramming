import { useState } from 'react';
import { socket } from '../../socket';
import styles from './Card.module.css';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import { BiMessageRounded } from 'react-icons/bi';
import { FiMoreVertical } from 'react-icons/fi';

const Card = ({ key, post, loginUser }) => {
  const [liked, setLiked] = useState(false);

  const onLikeHandler = (e) => {
    const { type } = e.target.closest('svg').dataset;

    setLiked(type === '0');
    socket.emit('sendNotification', {
      senderName: loginUser,
      receiverName: post.userName,
      type,
    });
  };

  return (
    <div key={key} className={styles.card}>
      <div className={styles.info}>
        <div className={styles.userInfo}>
          <img className={styles.userImg} src={post.userImg} alt="" />
          <div className={styles.username}>
            <div>{post.userName}</div>
            <div className={styles.loc}>{post.location}</div>
          </div>
        </div>
        <FiMoreVertical size="20" />
      </div>
      <img className={styles.postImg} src={post.postImg} />
      <div className={styles.icons}>
        {liked ? (
          <AiFillHeart
            className={styles.fillHeart}
            data-type="1"
            size="20"
            onClick={onLikeHandler}
          />
        ) : (
          <AiOutlineHeart
            className={styles.heart}
            data-type="0"
            size="20"
            onClick={onLikeHandler}
          />
        )}
        <BiMessageRounded className={styles.msg} size="20" />
        <HiOutlinePaperAirplane className={styles.airplane} size="20" />
      </div>
    </div>
  );
};

export default Card;

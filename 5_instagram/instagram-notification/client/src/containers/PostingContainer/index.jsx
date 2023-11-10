import { useContext, useState, useEffect } from 'react';
import { Context } from '../../context';
import { socket } from '../../socket';
import Card from '../../components/Card';
import Navbar from '../../components/Navbar';

const PostingContainer = () => {
  const {
    state: { userName },
  } = useContext(Context);
  const [post, setPost] = useState([]);

  useEffect(() => {
    const setPosting = (data) => setPost(data);

    socket.on('user-list', setPosting);
    socket.emit('userList', {});

    return () => {
      socket.off('user-list', setPosting);
    };
  }, []);

  return (
    <div>
      <h2>{`Login as a ${userName}`}</h2>
      <div>
        <Navbar />
        {post.map((p) => (
          <Card key={p.id} post={p} loginUser={userName} />
        ))}
      </div>
    </div>
  );
};

export default PostingContainer;

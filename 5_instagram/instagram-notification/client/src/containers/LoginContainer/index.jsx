import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../context';
import { socket } from '../../socket';
import { AUTH_INFO } from '../../context/action';
import styles from './LoginContainer.module.css';
import logo from '../../images/logo.png';

const LoginContainer = () => {
  const [user, setUser] = useState('');
  const { dispatch } = useContext(Context);
  const navigate = useNavigate();

  const setUserNameHandler = (e) => setUser(e.target.value);
  const onLoginHandler = (e) => {
    e.preventDefault();

    dispatch({
      type: AUTH_INFO,
      payload: user,
    });
    socket.auth = { userName: user };
    socket.connect();
    navigate('/post');
  };

  useEffect(() => {
    socket.on('connect_error', (err) => {
      if (err.message === 'invalid username') console.log('err');
    });
  }, []);

  return (
    <div className={styles.login_container}>
      <div className={styles.login}>
        <img src={logo} width="200px" alt="logo" />
        <form className={styles.loginForm} onSubmit={onLoginHandler}>
          <input
            className={styles.input}
            placeholder="Enter your name"
            value={user}
            onChange={setUserNameHandler}
          />
          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginContainer;

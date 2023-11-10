import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { debounce } from 'lodash-es';
import { socket } from '../socket';
import TextEditor from '../components/Editor';

const cursorMap = new Map(); // userId => cursor
const cursorColor = [
  '#FF0000',
  '#FF5E00',
  '#FFBB00',
  '#FFE400',
  '#ABF200',
  '#1DDB16',
  '#00D8FF',
  '#0054FF',
];

const EditorContainer = () => {
  const { id: documentId } = useParams();
  const [text, setText] = useState('');

  const timerRef = useRef(null);
  const cursorRef = useRef(null);
  const reactQuillRef = useRef(null);

  const onChangeTextHandler = (content, delta, source, editor) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      socket.emit(
        'save-document',
        reactQuillRef.current.getEditor().getContents()
      );
      timerRef.current = null;
    }, 1000);

    if (source === 'user') socket.emit('send-changes', delta);
  };
  const onChangeSelection = (selection, source, editor) => {
    if (source === 'user') socket.emit('cursor-changes', selection);
  };

  useEffect(() => {
    if (reactQuillRef.current) {
      cursorRef.current = reactQuillRef.current
        .getEditor()
        .getModule('cursors');
    }
  }, []);

  useEffect(() => {
    const onUpdate = (delta) => {
      reactQuillRef.current.getEditor().updateContents(delta);
    };
    const onCursorChange = ({ range, id }) => {
      debounce(() => {
        cursorMap.get(id).moveCursor(id, range);
      }, 500)();
    };
    const setCursor = (id) => {
      if (!cursorMap.get(id)) {
        cursorRef.current.createCursor(
          id,
          id,
          cursorColor[Math.floor(Math.random() * 8)]
        );
        cursorMap.set(id, cursorRef.current);
      }
    };

    socket.once('initDocument', (res) => {
      const { _document, userList } = res;

      setText(_document);
      userList.forEach((u) => setCursor(u));
    });
    socket.on('newUser', setCursor);
    socket.on('receive-changes', onUpdate);
    socket.on('receive-cursor', onCursorChange);
    socket.emit('join', documentId);

    return () => {
      socket.disconnect();
      socket.off('newsUser', setCursor);
      socket.off('receive-changes', onUpdate);
      socket.off('receive-cursor', onCursorChange);
    };
  }, []);

  return (
    <TextEditor
      text={text}
      onChangeTextHandler={onChangeTextHandler}
      onChangeSelection={onChangeSelection}
      reactQuillRef={reactQuillRef}
    />
  );
};

export default EditorContainer;

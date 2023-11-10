import { container } from './textEditor.style.js';
import ReactQuill, { Quill } from 'react-quill';
import QuillCursors from 'quill-cursors';
import 'react-quill/dist/quill.snow.css';

// 에디터 설정
const modules = {
  cursors: true,
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ align: [] }],
    ['image', 'blockquote', 'code-block'],
    ['clean'],
  ],
};

Quill.register('modules/cursors', QuillCursors);
// 모듈 추가

const TextEditor = ({
  text,
  reactQuillRef,
  onChangeTextHandler,
  onChangeSelection,
}) => {
  return (
    <div css={container}>
      <ReactQuill
        theme="snow"
        modules={modules}
        value={text}
        ref={(el) => {
          reactQuillRef.current = el;
        }}
        onChange={onChangeTextHandler}
        onChangeSelection={onChangeSelection}
      />
    </div>
  );
};

export default TextEditor;

import React, { useState, useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

function Editor() {
    const [title, setTitle] = useState('');
    const editorRef = useRef();

    useEffect(() => {
        return () => {
            if (editorRef.current) {
                editorRef.current.destroy();
            }
        };
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', editorRef.current.getData());

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/board/save`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                console.log('폼이 성공적으로 제출되었습니다.');
            } else {
                console.error('폼 제출 실패:', response.statusText);
            }
        } catch (error) {
            console.error('폼 제출 중 오류 발생:', error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    name="title"
                    type="text"
                    placeholder="제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                /><br />
                <CKEditor
                    editor={ClassicEditor}
                    data=""
                    config={{
                        language: 'ko'
                    }}
                    onReady={editor => {
                        editorRef.current = editor;
                    }}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        editorRef.current = editor;
                    }}
                /><br />
                <input type="submit" value="등록" />
            </form>
        </div>
    );
}

export default Editor;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserData } from '../../../utils/userInfo/api/userApi';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import styles from '../../../styles/Main/board/CKEditor.module.css';

function Editor() {
    const { userData, loading, isLogin } = useUserData();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();
    const { boardNo } = useParams();

    // 게시글 데이터 불러오기
    useEffect(() => {
        if (boardNo) {
            const fetchContent = async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/board/editor/${boardNo}`);
                    if (response.ok) {
                        const result = await response.json();
                        const data = result.data;
                        setTitle(data.boardTitle || '');
                        console.log('제목:', data.boardTitle);
                        setContent(data.boardContent || '');
                        console.log('내용:', data.boardContent);
                    } else {
                        console.error('게시글 불러오기 실패:', response.statusText);
                    }
                } catch (error) {
                    console.error('게시글 불러오기 오류:', error);
                }
            };

            fetchContent();
        }
    }, [boardNo]);

    // 폼 제출 핸들러
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!window.confirm('수정하시겠습니까?')) {
            return;
        }

        const formData = new FormData();
        formData.append('boardTitle', title);
        formData.append('boardContent', content);
        
        if (userData && userData.userId) {
            formData.append('userId', userData.userId);
        } else {
            console.error('사용자 정보가 없습니다.');
            return;
        }

        try {
            const url = boardNo 
                ? `${process.env.REACT_APP_API_URL}/board/save/${boardNo}`
                : `${process.env.REACT_APP_API_URL}/board/save`;

            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                console.log('글 작성 성공');
                navigate(`/content/${boardNo}`);
            } else {
                console.error('글 작성 실패:', response.statusText);
            }
        } catch (error) {
            console.error('글 작성 오류', error);
        }
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (!isLogin) {
        return <div>로그인이 필요합니다.</div>;
    }

    return (
        <div className={styles.content}>
            <form onSubmit={handleSubmit}>
                <input
                    name="boardTitle"
                    type="text"
                    placeholder="제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                /><br />
                <CKEditor
                    editor={ClassicEditor}
                    data={content}
                    onReady={editor => {
                        console.log('에디터 사용 가능', editor);
                    }}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        setContent(data);
                    }}
                    onBlur={(event, editor) => {
                        console.log('Blur.', editor);
                    }}
                    onFocus={(event, editor) => {
                        console.log('Focus.', editor);
                    }}
                />
                <input type="submit" value={boardNo ? "수정" : "등록"} />
            </form>
        </div>
    );
}

export default Editor;

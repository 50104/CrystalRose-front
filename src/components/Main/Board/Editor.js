import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserData } from '../../../utils/userInfo/api/userApi';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import styles from '../../../styles/Main/board/CKEditor.module.css';
import '../../../styles/Main/board/Editor.css';

function CustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new CustomUploadAdapter(loader);
    };
}

class CustomUploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }
    upload() {
        return this.loader.file
            .then(file => new Promise((resolve, reject) => {
                const data = new FormData();
                data.append('file', file);

                fetch(`${process.env.REACT_APP_API_URL}/image/upload`, {
                    method: 'POST',
                    body: data
                })
                .then(response => response.json())
                .then(result => {
                    if (result && result.url) {
                        resolve({
                            default: result.url
                        });
                    } else {
                        reject(result.error || '이미지 업로드 실패');
                    }
                })
                .catch(error => {
                    reject(error);
                });
            }));
    }
    abort() {
    }
}

function Editor() {
    const { userData, loading, isLogin } = useUserData();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const navigate = useNavigate();
    const { boardNo } = useParams();

    useEffect(() => {
        if (boardNo) {
            const fetchContent = async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/board/editor/${boardNo}`);
                    if (response.ok) {
                        const result = await response.json();
                        const data = result.data;
                        setTitle(data.boardTitle || '');
                        setContent(data.boardContent || '');
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

    useEffect(() => {
        setIsFormValid(title.trim() !== '' && content.trim() !== '');
    }, [title, content]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const confirmationMessage = boardNo 
        ? '수정하시겠습니까?' 
        : '작성하시겠습니까?';

        if (!window.confirm(confirmationMessage)) {
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
                const result = await response.json();
                const data = result.data;
                const savedBoardNo = data.boardNo;
                console.log('글 업로드 성공');
                navigate(`/content/${savedBoardNo}`);
            } else {
                console.error('글 업로드 실패:', response.statusText);
            }
        } catch (error) {
            console.error('글 업로드 오류', error);
        }
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (!isLogin) {
        return <div>로그인이 필요합니다.</div>;
    }

    return (
        <div className={`${styles.content} custom-editor`}>
            <form onSubmit={handleSubmit}>
                <input
                    className='inputTitle'
                    name="boardTitle"
                    type="text"
                    placeholder="제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                /><br />
                <CKEditor
                    editor={ClassicEditor}
                    data={content}
                    config={{
                        extraPlugins: [CustomUploadAdapterPlugin],
                        height: 450,
                        extraAllowedContent: 'div(custom-editor-height)'
                        ,
                        codeBlock: {
                            languages: [
                                { language: 'plaintext', label: 'PlainText' },
                                { language: 'c', label: 'C' },
                                { language: 'cpp', label: 'C++' },
                                { language: 'java', label: 'Java' },
                                { language: 'python', label: 'Python' },
                                { language: 'xml', label: 'XML' },
                                { language: 'json', label: 'JSON' },
                                { language: 'html', label: 'HTML' },
                                { language: 'css', label: 'CSS' },
                                { language: 'gradle', label: 'Gradle' }
                            ]
                        },
                    }}
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
                    className={styles.customEditor}
                />
                <div className='uploadButtonBox'>
                    <input
                        className={isFormValid ? 'uploadButton' : 'uploadButton-disable'}
                        type="submit"
                        value={boardNo ? "수정" : "등록"}
                        disabled={!isFormValid}
                    />
                </div>
            </form>
        </div>
    );
}

export default Editor;

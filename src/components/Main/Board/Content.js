import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import parse from 'html-react-parser';
import '../../../styles/Main/board/Content.css';
import styles from '../../../styles/Main/board/CKEditor.module.css';

function Content() {
    const { boardNo } = useParams();
    const [content, setContent] = useState(null);
    const navigate = useNavigate();

    // HTML 디코딩 함수
    function decodeHtml(html) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    useEffect(() => {
        if (boardNo) {
            const getContent = async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/board/content/${boardNo}`);
                    console.log('HTTP 응답 상태 코드:', response.status);
                    if (response.ok) {
                        const result = await response.json();
                        console.log('응답 데이터:', result);
                        if (result && result.Content) {
                            const data = result.Content;
                            console.log('불러온 데이터:', data.boardContent);
                            data.boardContent = decodeHtml(data.boardContent);  // HTML 디코딩 적용
                            setContent(data);
                        } else {
                            console.error('데이터 형식 오류:', result);
                        }
                    } else {
                        console.error('게시글 불러오기 실패:', response.statusText);
                    }
                } catch (error) {
                    console.error('게시글 불러오기 오류:', error);
                }
            };
            getContent();
        }
    }, [boardNo]);

    const handleDelete = () => {
        if (window.confirm('게시글을 삭제하시겠습니까?')) {
            axios.get(`${process.env.REACT_APP_API_URL}/board/delete/${boardNo}`)
                .then(response => {
                    console.log('삭제 성공', response.data);
                    navigate('/list');
                })
                .catch(error => {
                    console.error('삭제 오류', error);
                });
        }
    };

    const handleEdit = () => {
        navigate(`/editor/${boardNo}`);
    };

    if (!content) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className='contentBox'>
                <div className={styles.content}>
                    <div className='headerBox'>
                        <div className='titleBox'>
                            {content.boardTitle}
                        </div>
                        <div className='authorBox'>
                            작성자 : {content.userId}
                        </div>
                    </div>
                    <div className='contentDivider'></div>
                    <div className='boardContent'>{parse(content.boardContent)}</div>
                </div>
            </div>
            <div className='contentButtonBox'>
                <input
                    className='contentButton'
                    type="submit"
                    onClick={handleEdit}
                    value="수정"/>
                <input
                    className='contentButton'
                    type="submit"
                    onClick={handleDelete}
                    value="삭제"/>
            </div>
        </div>
    );
}

export default Content;

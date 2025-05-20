import React, { useState, useEffect } from 'react';
import { axiosInstance } from '@utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import parse from 'html-react-parser';
import { useUserData } from '@utils/api/user';
import './Content.css';
import styles from './CKEditor.module.css';
import CommentList from './CommentList';

function Content() {
    const { userData } = useUserData();
    const { boardNo } = useParams();
    const [content, setContent] = useState(null);
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState(""); 

    // HTML 디코딩 함수
    function decodeHtml(html) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    const formatDateTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        const sec = String(date.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
    };

    const fetchComments = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/board/${boardNo}/comments`);
        const data = await res.json();
        const array = Array.isArray(data) ? data : data.data;
        setComments(array || []);
      } catch (err) {
        console.error("댓글 불러오기 오류:", err);
        setComments([]);
      }
    };

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
            fetchComments(); 

            console.log("댓글 요청 보냄", newComment);
            fetch(`${process.env.REACT_APP_API_URL}/board/${boardNo}/comments`)
              .then(res => res.json())
              .then(data => {
                const array = Array.isArray(data) ? data : data.data;
                setComments(array || []);
              })
              .catch(err => {
                console.error("댓글 불러오기 오류:", err);
                setComments([]); // 안전하게 fallback
            });
        }
    }, [boardNo]);

    const handleAddComment = () => {
        if (!newComment.trim()) {
            console.warn("댓글 내용이 비어 있음 — 전송 안함");
            return;
        }

        const payload = {
            content: newComment,
            userId: userData?.userId 
        };

        console.log("댓글 등록 요청", payload);

        axiosInstance.post(`${process.env.REACT_APP_API_URL}/board/${boardNo}/comments`, payload)
            .then(() => {
                console.log("댓글 등록 성공");
                setNewComment("");
                return fetch(`${process.env.REACT_APP_API_URL}/board/${boardNo}/comments`);
            })
            .then((res) => res.json())
            .then((data) => {
                console.log("댓글 목록 새로고침 응답", data);
                setComments(data);
            })
            .catch((error) => {
                console.error("댓글 등록 중 오류 발생", error);
            });
    };

    const handleDeleteComment = (commentId) => {
      if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

      axiosInstance.delete(`${process.env.REACT_APP_API_URL}/board/comments/${commentId}`)
          .then(() => {
              fetchComments();
          })
          .catch((err) => console.error("댓글 삭제 실패", err));
    };

    const handleDelete = () => {
        if (window.confirm('게시글을 삭제하시겠습니까?')) {
            axiosInstance.get(`${process.env.REACT_APP_API_URL}/board/delete/${boardNo}`)
                .then(response => {
                    console.log('삭제 성공', response.data);
                    navigate('/list');
                })
                .catch(error => {
                    console.error('삭제 오류', error);
                });
        }
    };

    function nestComments(comments) {
        const map = {};
        const roots = [];

        comments.forEach(c => map[c.id] = { ...c, children: [] });

        comments.forEach(c => {
            if (c.parentId) {
                map[c.parentId]?.children.push(map[c.id]);
            } else {
                roots.push(map[c.id]);
            }
        });

        return roots;
    }

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
              {userData?.userId === content.userId && (
                <>
                  <input
                    className='contentButton'
                    type="submit"
                    onClick={handleEdit}
                    value="수정"
                  />
                  <input
                    className='contentButton'
                    type="submit"
                    onClick={handleDelete}
                    value="삭제"
                  />
                </>
              )}
            </div>
            <div className="commentSection">
                <h3>댓글</h3>
                <CommentList
                    nestedComments={nestComments(comments)}
                    userData={userData}
                    boardNo={boardNo}
                    formatDateTime={formatDateTime}
                    handleDeleteComment={handleDeleteComment}
                    onRefresh={fetchComments}
                />
                <div className="commentInputBox">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 입력하세요"
                    />
                    <div className="commentButtonBox">
                        <button className="contentButton" onClick={handleAddComment}>등록</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Content;

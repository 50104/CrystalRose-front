import React, { useState, useEffect } from 'react';
import { axiosInstance } from '@utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import parse from 'html-react-parser';
import { useUserData } from '@utils/api/user';
import './Content.css';
import styles from './CKEditor.module.css';
import CommentList from './CommentList';
import ReportModal from '../../common/ReportModal';
import { reportPost, blockUser } from '@utils/api/report';

function Content() {
  const { userData, loading } = useUserData();
  const { boardNo } = useParams();
  const [content, setContent] = useState(null);
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [reportingPostId, setReportingPostId] = useState(null);

  function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  };

  const fetchComments = async () => {
    try {
      const res = await axiosInstance.get(`/board/${boardNo}/comments`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("댓글 불러오기 오류:", err);
      setComments([]);
    }
  };

  useEffect(() => {
    if (boardNo) {
      const getContent = async () => {
        try {
          const response = await axiosInstance.get(`/board/content/${boardNo}`);
          if (response.data && response.data.data) {
            const data = response.data.data;
            data.boardContent = decodeHtml(data.boardContent);
            setContent(data);
          } else {
            console.error('데이터 형식 오류:', response.data);
          }
        } catch (error) {
          console.error('게시글 불러오기 오류:', error);
        }
      };
      getContent();
      fetchComments();
    }
  }, [boardNo]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const payload = {
      content: newComment,
      userId: userData?.userId,
      userNick: userData?.userNick
    };

    axiosInstance.post(`/board/${boardNo}/comments`, payload)
      .then(() => {
        setNewComment("");
        return fetchComments();
      })
      .catch((error) => {
        console.error("댓글 등록 오류", error);
      });
  };

  const handleDeleteComment = (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    axiosInstance.delete(`/board/comments/${commentId}`)
      .then(fetchComments)
      .catch(err => console.error("댓글 삭제 실패", err));
  };

  const handleDelete = () => {
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      axiosInstance.delete(`${process.env.REACT_APP_API_URL}/board/delete/${boardNo}`)
        .then(() => navigate('/list'))
        .catch(error => console.error('삭제 오류', error));
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

  const handleEdit = () => navigate(`/editor/${boardNo}`);

  const handlePostReport = async (postId, reason) => {
    try {
      await reportPost(postId, reason);
      alert("신고 완료");
    } catch (err) {
      alert('신고 실패: ' + err.response?.data?.message || '오류 발생');
    }
  };

  const checkAlreadyReported = async () => {
    try {
      const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/reports/check`, {
        params: { postId: content.boardNo }
      });
      return res.data.alreadyReported;
    } catch (err) {
      console.error("신고 여부 확인 실패", err);
      return false;
    }
  };

  const checkAlreadyReportedComment = async (commentId) => {
    try {
      const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/comment-reports/check`, {
        params: { commentId }
      });
      return res.data.alreadyReported;
    } catch (err) {
      console.error("댓글 신고 여부 확인 실패", err);
      return false;
    }
  };

  if (!content) return <div>Loading...</div>;

  return (
    <div>
      <div className='contentBox'>
        <div className={styles.content}>
          <div className='headerBox'>
            <div className='titleBox'>{content.boardTitle}</div>
            <div className='authorBox'>
              작성자 : {content.writer
                ? (content.writer.userStatus === 'DELETED' ? '탈퇴한 사용자입니다' : content.writer.userNick)
                : '알 수 없는 사용자'}
            </div>
            {!loading && userData && content.writer 
            && content.writer.userStatus !== 'DELETED' 
            && userData.userNo !== content.writer.userNo && (
              <>
                <button className="contentButton" onClick={async () => {
                  try {
                    await blockUser(content.writer.userNo);
                    alert("차단 완료");
                  } catch (err) {
                    alert('차단 실패: ' + err.response?.data?.message || '오류 발생');
                  }
                }}>차단</button>
                <button className="contentButton" onClick={async () => {
                  const alreadyReported = await checkAlreadyReported();
                  if (alreadyReported) {
                    alert("이미 신고한 게시글입니다.");
                    return;
                  }
                  setReportingPostId(content.boardNo);
                }}>신고</button>
              </>
            )}
          </div>
          <div className='contentDivider'></div>
          <div className='boardContent'>{parse(content.boardContent)}          </div>
        </div>
      </div>

      <ReportModal
        visible={reportingPostId !== null}
        onClose={() => setReportingPostId(null)}
        onSubmit={handlePostReport}
        targetId={reportingPostId}
        title="게시글 신고"
      />

      <div className='contentButtonBox'>
        {userData && content.writer && userData.userNo === content.writer.userNo && (
          <>
            <input className='contentButton' type="submit" onClick={handleEdit} value="수정" />
            <input className='contentButton' type="submit" onClick={handleDelete} value="삭제" />
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
          checkAlreadyReportedComment={checkAlreadyReportedComment}
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

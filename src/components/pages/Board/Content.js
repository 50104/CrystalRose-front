import React, { useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '@utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import parse from 'html-react-parser';
import { useUserData } from '@utils/api/user';
import './Content.css';
import './Comment.css';
import styles from './CKEditor.module.css';
import CommentList from './CommentList';
import ReportModal from '../../common/ReportModal';
import { reportPost, blockUser } from '@utils/api/report';
import { format, parseISO } from 'date-fns';

export const formatDateTime = (isoString) =>
  isoString ? format(parseISO(isoString), 'yy/MM/dd HH:mm') : '-';

function Content() {
  const { userData, loading } = useUserData();
  const { boardNo } = useParams();
  const [content, setContent] = useState(null);
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [reportingPostId, setReportingPostId] = useState(null);
  const [isRecommended, setIsRecommended] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [prevPost, setPrevPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);

  useEffect(() => {
    const fetchPrevNextPost = async () => {
      try {
        const [prevRes, nextRes] = await Promise.all([
          axiosInstance.get(`/api/v1/board/prev/${boardNo}`),
          axiosInstance.get(`/api/v1/board/next/${boardNo}`)
        ]);
        setPrevPost(prevRes.status === 200 ? prevRes.data : null);
        setNextPost(nextRes.status === 200 ? nextRes.data : null);
      } catch (err) {
        console.error('이전/다음글 불러오기 오류', err);
      }
    };

    if (boardNo) fetchPrevNextPost();
  }, [boardNo]);

  useEffect(() => {
    if (content) {
      setLikeCount(content.likeCount || 0);
      setIsRecommended(content.recommended || false);
    }
  }, [content]);

  function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  const fetchComments = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/api/v1/board/${boardNo}/comments/list`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("댓글 불러오기 오류:", err);
      setComments([]);
    }
  }, [boardNo]);

  useEffect(() => {
    if (boardNo) {
      const getContent = async () => {
        try {
          const response = await axiosInstance.get(`/api/v1/board/content/${boardNo}`);
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
  }, [boardNo, fetchComments]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const payload = {
      content: newComment,
      userId: userData?.userId,
      userNick: userData?.userNick
    };

    axiosInstance.post(`/api/v1/board/${boardNo}/comments`, payload)
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
    axiosInstance.delete(`/api/v1/board/comments/${commentId}`)
      .then(fetchComments)
      .catch(err => console.error("댓글 삭제 실패", err));
  };

  const handleDelete = () => {
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      axiosInstance.delete(`/api/v1/board/delete/${boardNo}`)
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
      const res = await axiosInstance.get(`/api/reports/check`, {
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
      const res = await axiosInstance.get(`/api/comment-reports/check`, {
        params: { commentId }
      });
      return res.data.alreadyReported;
    } catch (err) {
      console.error("댓글 신고 여부 확인 실패", err);
      return false;
    }
  };

  const handleRecommendToggle = async () => {
    try {
      const res = await axiosInstance.post(`/api/v1/board/recommend/${boardNo}`);
      if (res.data?.message.includes('추천 완료')) {
        setIsRecommended(true);
        setLikeCount((prev) => prev + 1);
        alert("게시글을 추천했습니다");
      } else if (res.data?.message.includes('추천 취소')) {
        setIsRecommended(false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
        alert("게시글 추천을 취소했습니다");
      }
    } catch (err) {
      const message = err?.response?.data?.message || '오류가 발생했습니다. 다시 시도해주세요.';
      alert(message);
      console.error("추천 토글 오류:", err);
    }
  };

  if (!content) return <div>Loading</div>;
  const isNotice = content.boardTag === '공지';
  const isAdminWriter = content.writer?.userNick?.toLowerCase() === 'admin';

  return (
    <div>
      <div className='contentBox'>
        <div className={styles.content}>
          <div className='headerBox'>
            <div className='titleBox'>{content.boardTitle}</div>
            <div className='authorBox'>
              <span className='authorName'>
                {content.writer
                  ? (content.writer.userStatus === 'DELETED' ? '탈퇴한 사용자' : content.writer.userNick)
                  : '알 수 없는 사용자'}
              </span>
              <span className='authorDate'>
                {content.createdDate
                  ? `${formatDateTime(content.createdDate)}`
                  : '-'}
              </span>
            </div>
          </div>
          <div className='boardContent'>
            {parse(content.boardContent)}
          </div>
        </div>

        <div className='contentButtonBox'>
          <button
            className={`contentButton ${isRecommended ? 'recommended' : ''}`}
            onClick={handleRecommendToggle}
          >
            {isRecommended ? '추천 취소' : '추천'} ({likeCount})
          </button>
          {!loading && userData && content.writer &&
            content.writer.userStatus !== 'DELETED' &&
            userData.userNo !== content.writer.userNo &&
            !isNotice && !isAdminWriter && (
              <>
                <button className="contentButton" onClick={async () => {
                  const confirmBlock = window.confirm("차단하시겠습니까?");
                  if (!confirmBlock) return;
                  try {
                    await blockUser(content.writer.userNo);
                    alert("차단내역은 마이페이지에서 확인할 수 있습니다");
                  } catch (err) {
                    alert(err.response?.data?.message || '오류 발생');
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
          {userData && content.writer && userData.userNo === content.writer.userNo && (
            <>
              <input className='contentButton' type="submit" onClick={handleEdit} value="수정" />
              <input className='contentButton' type="submit" onClick={handleDelete} value="삭제" />
            </>
          )}
        </div>
      </div>

      <ReportModal
        visible={reportingPostId !== null}
        onClose={() => setReportingPostId(null)}
        onSubmit={handlePostReport}
        targetId={reportingPostId}
        title="게시글 신고"
      />

    {content.boardTag !== '공지' && (
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
    )}
      <div className="prev-next-nav">
        {/* <button className="contentButton" onClick={() => navigate('/list')}>
          ← 목록으로 돌아가기
        </button> */}
        {nextPost && (
          <button className="contentButton" onClick={() => navigate(`/content/${nextPost.boardNo}`)}>
            다음글: {nextPost.boardTitle}
          </button>
        )}
        {prevPost && (
          <button className="contentButton" onClick={() => navigate(`/content/${prevPost.boardNo}`)}>
            이전글: {prevPost.boardTitle}
          </button>
        )}
      </div>
    </div>
  );
}

export default Content;

import React, { useState } from "react";
import { axiosInstance } from "@utils/axios";
import "./Content.css";
import "./Comment.css";
import ReportModal from '../../common/ReportModal';
import { reportComment } from "@utils/api/report";

function CommentList({ nestedComments, userData, boardNo, onRefresh, formatDateTime, handleDeleteComment, checkAlreadyReportedComment }) {
  const [replyBoxOpen, setReplyBoxOpen] = useState(null);
  const [replyContents, setReplyContents] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContents, setEditContents] = useState({});
  const [reportingCommentId, setReportingCommentId] = useState(null);

  const toggleReplyBox = (commentId) => {
    setEditingCommentId(null); // 수정 중이면 닫기
    setReplyBoxOpen(prev => (prev === commentId ? null : commentId));
  };

  const handleEditComment = (commentId) => {
    const target = findCommentById(nestedComments, commentId);
    if (target) {
      setReplyBoxOpen(null); // 답글창 열려 있으면 닫기
      setEditingCommentId(commentId);
      setEditContents(prev => ({ ...prev, [commentId]: target.content }));
    }
  };

  const handleReplyChange = (commentId, value) => {
    setReplyContents(prev => ({ ...prev, [commentId]: value }));
  };

  const handleAddReply = async (parentId) => {
    const content = replyContents[parentId]?.trim();
    if (!content) return;

    const payload = {
      content,
      userId: userData?.userId,
      userNick: userData?.userNick, 
      parentId
    };

    try {
      await axiosInstance.post(`/api/v1/board/${boardNo}/comments`, payload);
      setReplyContents(prev => ({ ...prev, [parentId]: "" }));
      setReplyBoxOpen(null);
      onRefresh();
    } catch (e) {
      console.error("대댓글 등록 실패", e);
    }
  };

  const handleUpdateComment = async (commentId) => {
    const content = editContents[commentId]?.trim();
    if (!content) return;

    try {
      await axiosInstance.patch(`/api/v1/board/comments/${commentId}`, { content });
      setEditingCommentId(null);
      onRefresh();
    } catch (e) {
      console.error("댓글 수정 실패", e);
    }
  };

  const findCommentById = (comments, id) => {
    for (let c of comments) {
      if (c.id === id) return c;
      if (c.children) {
        const found = findCommentById(c.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleCommentReport = async (commentId, reason) => {
    try {
      await reportComment(commentId, reason);
      alert("댓글 신고 완료");
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "신고 실패";
      alert(errorMsg);
    } finally {
      setReportingCommentId(null);
    }
  };

  const renderComment = (comment) => (
    <li key={comment.id} className="commentItem">
      <div className="commentHeader">
        <div className="leftBox">
          <span
            className={`commentUser ${
              comment.userStatus === 'DELETED' ? 'deletedUser' : ''
            }`}
          >
            {comment.userStatus === 'DELETED' ? '탈퇴한 사용자' : comment.userNick}
          </span>
          <span className="commentDate">{formatDateTime(comment.createdDate)}</span>
        </div>
        {!comment.deleted && comment.userStatus !== 'DELETED' && (
          <div className="rightButtons">
            {(userData?.userNick === comment.userNick || userData?.userId === comment.userId) && (
              <>
                <button className="editButton" onClick={() => handleEditComment(comment.id)}>수정</button>
                <button className="deleteIcon" onClick={() => handleDeleteComment(comment.id)}>삭제</button>
              </>
            )}
            {(userData?.userNick !== comment.userNick &&
              userData?.userId !== comment.userId &&
              comment.userNick?.toLowerCase() !== 'admin') && (
              <button className="editButton reportButton" onClick={async () => {
                const alreadyReported = await checkAlreadyReportedComment(comment.id);
                if (alreadyReported) {
                  alert("이미 신고한 댓글입니다.");
                  return;
                }
                setReportingCommentId(comment.id);
              }}>신고</button>
            )}
            <button className="editButton" onClick={() => toggleReplyBox(comment.id)}>답글</button>
          </div>
        )}
      </div>
      <div className="commentBody">
      {editingCommentId === comment.id ? (
        <div className="commentInputBox nestedReplyBox">
          <textarea
            value={editContents[comment.id] || ""}
            onChange={(e) => setEditContents(prev => ({
              ...prev,
              [comment.id]: e.target.value
            }))}
          />
          <div className="commentButtonBox">
            <button className="editButton" onClick={() => handleUpdateComment(comment.id)}>저장</button>
            {/* <button className="editButton" onClick={() => setEditingCommentId(null)}>취소</button> */}
          </div>
        </div>
      ) : (
      <div className="commentContent">
        {comment.deleted ? (
          <em className="deletedComment">삭제된 댓글입니다.</em>
        ) : (
          <>
            {comment.parentId && comment.parentNickname && (
              <span
                className={`replyTo ${
                  comment.parentStatus === 'DELETED' ? 'deletedUser' : ''
                }`}
              >
                @{comment.parentStatus === 'DELETED' ? '탈퇴한 사용자' : comment.parentNickname}{' '}
              </span>
            )}
            {comment.content}
          </>
        )}
      </div>
      )}
      </div>
      {replyBoxOpen === comment.id && (
        <div className="commentInputBox nestedReplyBox">
          <textarea
            value={replyContents[comment.id] || ""}
            onChange={(e) => handleReplyChange(comment.id, e.target.value)}
            placeholder="답글을 입력하세요"
          />
          <div className="commentButtonBox">
            <button className="editButton" onClick={() => handleAddReply(comment.id)}>등록</button>
          </div>
        </div>
      )}
      {comment.children?.length > 0 && (
        <ul className="nestedCommentList">
          {comment.children.map(child => renderComment(child))}
        </ul>
      )}
    </li>
  );
  
  return (
    <>
      <ul className="commentList">
        {nestedComments.map(comment => renderComment(comment))}
      </ul>
      <ReportModal
        visible={reportingCommentId !== null}
        onClose={() => setReportingCommentId(null)}
        onSubmit={handleCommentReport}
        targetId={reportingCommentId}
        title="댓글 신고"
      />
    </>
  );
}

export default CommentList;
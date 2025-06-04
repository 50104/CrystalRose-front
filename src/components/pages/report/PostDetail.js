import React, { useState } from "react";
import { reportPost, blockUser } from "@utils/api/report";
import ReportModal from "@components/ReportModal";
import { useUserData } from "@utils/api/user";

const PostDetail = ({ post }) => {
  const { userData, isLogin } = useUserData();
  const [showReport, setShowReport] = useState(false);

  const handlePostReport = async (postId, reason) => {
    try {
      await reportPost(postId, reason);
      const confirmBlock = window.confirm("차단하시겠습니까?");
      if (confirmBlock) {
        await blockUser(post.writer.userNo);
        alert("차단 완료");
      } else {
        alert("신고 완료");
      }
    } catch (err) {
      alert("신고 실패: " + err.response?.data?.message);
    }
  };

  return (
    <div>
      <h2>{post.boardTitle}</h2>
      <p>{post.boardContent}</p>
      {isLogin && userData?.userNo !== post.writer?.userNo && (
        <>
          <button onClick={() => setShowReport(true)}>🚨 신고하기</button>
          <ReportModal
            visible={showReport}
            onClose={() => setShowReport(false)}
            onSubmit={handlePostReport}
            targetId={post.boardNo}
          />
        </>
      )}
    </div>
  );
};

export default PostDetail;

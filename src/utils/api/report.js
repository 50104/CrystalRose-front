import { axiosInstance } from '@utils/axios';

export const reportPost = async (postId, reason) => {
  const res = await axiosInstance.post(`/api/reports`, 
    { postId, reason }
  );
  return res.data;
};

export const blockUser = async (blockedUserId) => {
  const res = await axiosInstance.post(`/api/v1/blocks`, 
    { blockedUserId }
  );
  return res.data;
};

export const reportComment = async (commentId, reason) => {
  const res = await axiosInstance.post(`/api/comment-reports`,
    { commentId, reason }
  );
  return res.data;
};

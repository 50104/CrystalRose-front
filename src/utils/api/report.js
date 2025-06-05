import { axiosInstance } from '@utils/axios';

export const reportPost = async (postId, reason) => {
  const res = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/reports`, 
    { postId, reason }
  );
  return res.data;
};

export const blockUser = async (blockedUserId) => {
  const res = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/v1/blocks`, 
    { blockedUserId }
  );
  return res.data;
};

export const reportComment = async (commentId, reason) => {
  const res = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/comment-reports`,
    { commentId, reason }
  );
  return res.data;
};

import { axiosInstance } from '@utils/axios';

export const reportPost = async (postId, reason) => {
  const token = localStorage.getItem('access');
  const res = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/reports`,
    { postId, reason },
    { headers: { access: token }, withCredentials: true }
  );
  return res.data;
};

export const blockUser = async (blockedUserId) => {
  const token = localStorage.getItem('access');
  const res = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/v1/blocks`,
    { blockedUserId },
    { headers: { access: token }, withCredentials: true }
  );
  return res.data;
};

import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@utils/axios';

export const usePendingWikiList = () => {
  return useQuery(['pendingWikiList'], async () => {
    const token = localStorage.getItem('access');
    const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/wiki/pending`, {
      headers: {
        access: token,
      },
      withCredentials: true,
    });
    return response.data;
  });
};

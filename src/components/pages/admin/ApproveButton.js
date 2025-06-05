import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@utils/axios';

const ApproveButton = ({ id }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id) => {
      return axiosInstance.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/admin/wiki/${id}/approve`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingWikiList']);
    },
  });

  return (
    <button
      className="primary-button-lg"
      onClick={() => mutation.mutate(id)}
      disabled={mutation.isLoading}
    >
      {mutation.isLoading ? '처리 중...' : '승인'}
    </button>
  );
};

export default ApproveButton;

import { useEffect, useState } from 'react';
import { axiosInstance } from '@utils/axios';

const useFetchData = (apiUrl) => {
  const [entities, setEntities] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(apiUrl);
      console.log(apiUrl + ' 데이터 불러오기 성공');
      setEntities(response.data);
    } catch (error) {
      console.error('데이터 불러오기 에러:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  return { entities, fetchData };
};

export default useFetchData;
import React, { useState, useEffect } from 'react';
import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';

const MemberList = () => {
  const [memberList, setMemberList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMemberList = async () => {
      try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/user/list`);
        setMemberList(response.data);
      } catch (error) {
        console.error('회원 목록을 가져오는 중 오류 발생:', error);
      }
    };

    fetchMemberList();
  }, []);

  const startChat = async (otherMemberId) => {
    try {
      const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/chat/room/private/create?otherMemberId=${otherMemberId}`);
      const roomId = response.data;
      navigate(`/chatpage/${roomId}`);
    } catch (error) {
      console.error('채팅방을 생성하는 중 오류 발생:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '8px', padding: '20px' }}>
        <Typography variant="h5" align="center">회원목록</Typography>
        <div>
          {memberList.map((member) => (
            <div key={member.userNo} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <div>{member.userNo}</div>
              <div>{member.userId}</div>
              <div>{member.userEmail}</div>
              <div>
                <Button color="primary" onClick={() => startChat(member.userNo)}>채팅하기</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberList;

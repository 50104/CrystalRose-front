import React, { useState, useEffect } from 'react';
import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/userInfo/api/axiosInstance';

const ChatList = () => {
  const [chatList, setChatList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/chat/my/rooms`);
        setChatList(response.data);
      } catch (error) {
        console.error('채팅 목록을 가져오는 중 오류 발생:', error);
      }
    };

    fetchChatList();
  }, []);

  const enterChatRoom = (roomId) => {
    navigate(`/chatpage/${roomId}`);
  };

  const leaveChatRoom = async (roomId) => {
    try {
      await axiosInstance.delete(`${process.env.REACT_APP_API_URL}/chat/room/group/${roomId}/leave`);
      setChatList(chatList.filter(chat => chat.roomId !== roomId));
    } catch (error) {
      console.error('채팅방 나가기 중 오류 발생:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '8px', padding: '20px' }}>
        <Typography variant="h5" align="center">내 채팅목록</Typography>
        <div>
          {chatList.map((chat) => (
            <div key={chat.roomId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <div>{chat.roomName}</div>
              <div>{chat.unReadCount}</div>
              <div>
                <Button color="primary" onClick={() => enterChatRoom(chat.roomId)}>입장</Button>
                <Button color="secondary" disabled={chat.isGroupChat === 'N'} onClick={() => leaveChatRoom(chat.roomId)}>나가기</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatList;

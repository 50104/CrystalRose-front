import React, { useState, useEffect } from 'react';
import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import './MyChatPage.css';

const MyChatPage = () => {
  const [chatList, setChatList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/chat/my/rooms`);
        
        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : [];

        setChatList(list);
      } catch (error) {
        console.error('채팅 목록을 가져오는 중 오류 발생:', error);
        setChatList([]); // 실패 시 빈 배열
      }
    };

    fetchChatList();

    // 읽음 메세지 수신 시 목록 새로고침
    const handleRead = () => fetchChatList();
    window.addEventListener('chat-read', handleRead);

    return () => window.removeEventListener('chat-read', handleRead);
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
    <div className="chatlist-container">
      <div className="chatlist-inner">
        <Typography variant="h5" className="chatlist-header">내 채팅목록</Typography>
        <div>
          {Array.isArray(chatList) && chatList.map((chat) => (
            <div key={chat.roomId} className="chatlist-item">
              <div>{chat.roomName}</div>
              <div>{chat.unReadCount}</div>
              <div>
                <Button color="primary" onClick={() => enterChatRoom(chat.roomId)}>입장</Button>
                <Button
                  color="secondary"
                  disabled={chat.isGroupChat === 'N'}
                  onClick={() => leaveChatRoom(chat.roomId)}
                >
                  나가기
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyChatPage;

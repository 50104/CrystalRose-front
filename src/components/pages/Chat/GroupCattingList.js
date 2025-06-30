import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { axiosInstance } from '@utils/axios';
import './GroupCattingList.css';

const GroupCattingList = () => {
  const [chatRoomList, setChatRoomList] = useState([]);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadChatRoom();
  }, []);

  const loadChatRoom = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/chat/room/group/list`);
      
      const chatRooms = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
          ? response.data.data
          : [];

      setChatRoomList(chatRooms);
    } catch (err) {
      console.error('채팅방 목록 불러오기 실패:', err);
      setChatRoomList([]); // 실패 시 빈 배열
    }
  };

  const joinChatRoom = async (roomId) => {
    await axiosInstance.post(`${process.env.REACT_APP_API_URL}/chat/room/group/${roomId}/join`);
    navigate(`/chatpage/${roomId}`);
  };

  const createChatRoom = async () => {
    await axiosInstance.post(`${process.env.REACT_APP_API_URL}/chat/room/group/create?roomName=${newRoomTitle}`);
    setShowCreateRoomModal(false);
    loadChatRoom();
  };

  return (
    <div className="chatroom-container">
      <div className="chatroom-inner">
        <Typography variant="h5" className="chatroom-header">채팅방 목록</Typography>
        <Button variant="contained" color="secondary" onClick={() => setShowCreateRoomModal(true)} className="chatroom-create-button">
          채팅방 생성
        </Button>
        <div className="chatroom-list">
          {Array.isArray(chatRoomList) && chatRoomList.map(chat => (
            <div key={chat.roomId} className="chatroom-item">
              <div>{chat.roomId}</div>
              <div>{chat.roomName}</div>
              <div>
                <Button variant="contained" color="primary" onClick={() => joinChatRoom(chat.roomId)}>참여하기</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showCreateRoomModal} onClose={() => setShowCreateRoomModal(false)}>
        <DialogTitle>채팅방 생성</DialogTitle>
        <DialogContent>
          <TextField label="방제목" fullWidth value={newRoomTitle} onChange={(e) => setNewRoomTitle(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateRoomModal(false)} color="grey">취소</Button>
          <Button onClick={createChatRoom} color="primary">생성</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default GroupCattingList;

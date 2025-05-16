import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { axiosInstance } from '@utils/axios';

const ChatRoomList = () => {
  const [chatRoomList, setChatRoomList] = useState([]);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadChatRoom();
  }, []);

  const loadChatRoom = async () => {
    const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/chat/room/group/list`);
    setChatRoomList(response.data);
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
    <div style={{ padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Typography variant="h5" align="center">채팅방 목록</Typography>
        <Button variant="contained" color="secondary" onClick={() => setShowCreateRoomModal(true)}>채팅방 생성</Button>
        <div style={{ marginTop: '20px' }}>
          {chatRoomList.map(chat => (
            <div key={chat.roomId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
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

export default ChatRoomList;

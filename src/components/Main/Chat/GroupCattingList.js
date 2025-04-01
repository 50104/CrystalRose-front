import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, TextField, Container, Typography } from '@mui/material';

const ChatRoomList = () => {
  const [chatRoomList, setChatRoomList] = useState([]);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadChatRoom();
  }, []);

  const loadChatRoom = async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/chat/room/group/list`);
    setChatRoomList(response.data);
  };

  const joinChatRoom = async (roomId) => {
    await axios.post(`${process.env.REACT_APP_API_URL}/chat/room/group/${roomId}/join`);
    navigate(`/chatpage/${roomId}`);
  };

  const createChatRoom = async () => {
    await axios.post(`${process.env.REACT_APP_API_URL}/chat/room/group/create?roomName=${newRoomTitle}`);
    setShowCreateRoomModal(false);
    loadChatRoom();
  };

  return (
    <Container>
      <Typography variant="h5" align="center">채팅방 목록</Typography>
      <Button variant="contained" color="secondary" onClick={() => setShowCreateRoomModal(true)}>채팅방 생성</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>방번호</TableCell>
            <TableCell>방제목</TableCell>
            <TableCell>채팅</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {chatRoomList.map(chat => (
            <TableRow key={chat.roomId}>
              <TableCell>{chat.roomId}</TableCell>
              <TableCell>{chat.roomName}</TableCell>
              <TableCell>
                <Button variant="contained" color="primary" onClick={() => joinChatRoom(chat.roomId)}>참여하기</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
    </Container>
  );
};

export default ChatRoomList;

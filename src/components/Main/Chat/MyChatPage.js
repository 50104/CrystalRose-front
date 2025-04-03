import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Container, Grid, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ChatList = () => {
  const [chatList, setChatList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/chat/my/rooms`);
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
      await axios.delete(`${process.env.REACT_APP_API_URL}/chat/room/group/${roomId}/leave`);
      setChatList(chatList.filter(chat => chat.roomId !== roomId));
    } catch (error) {
      console.error('채팅방 나가기 중 오류 발생:', error);
    }
  };

  return (
    <Container>
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={10} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" align="center">내 채팅목록</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>채팅방 이름</TableCell>
                    <TableCell>읽지 않은 메세지</TableCell>
                    <TableCell>액션</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chatList.map((chat) => (
                    <TableRow key={chat.roomId}>
                      <TableCell>{chat.roomName}</TableCell>
                      <TableCell>{chat.unReadCount}</TableCell>
                      <TableCell>
                        <Button
                          color="primary"
                          onClick={() => enterChatRoom(chat.roomId)}
                        >
                          입장
                        </Button>
                        <Button
                          color="secondary"
                          disabled={chat.isGroupChat === 'N'}
                          onClick={() => leaveChatRoom(chat.roomId)}
                        >
                          나가기
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatList;

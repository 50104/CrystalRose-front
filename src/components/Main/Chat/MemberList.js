import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Container, Grid, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const MemberList = () => {
  const [memberList, setMemberList] = useState([]);

  useEffect(() => {
    const fetchMemberList = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/list`);
        setMemberList(response.data);
      } catch (error) {
        console.error('회원 목록을 가져오는 중 오류 발생:', error);
      }
    };

    fetchMemberList();
  }, []);

  return (
    <Container>
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={10} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" align="center">회원목록</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>번호</TableCell>
                    <TableCell>아이디</TableCell>
                    <TableCell>이메일</TableCell>
                    <TableCell>채팅</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {memberList.map((member) => (
                    <TableRow key={member.userNo}>
                      <TableCell>{member.userNo}</TableCell>
                      <TableCell>{member.userId}</TableCell>
                      <TableCell>{member.userEmail}</TableCell>
                      <TableCell>
                        <Button
                          color="primary"
                        >
                          채팅하기
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

export default MemberList;

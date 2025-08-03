// import React, { useState, useEffect } from 'react';
// import { Button, Typography } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import { axiosInstance } from '@utils/axios';
// import './MemberList.css';

// const MemberList = () => {
//   const [memberList, setMemberList] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchMemberList = async () => {
//       try {
//         const response = await axiosInstance.get(`/api/user/list`);
//         setMemberList(response.data);
//       } catch (error) {
//         console.error('회원 목록을 가져오는 중 오류 발생:', error);
//       }
//     };

//     fetchMemberList();
//   }, []);

//   const startChat = async (otherMemberId) => {
//     try {
//       const response = await axiosInstance.post(`/api/v1/chat/room/private/create?otherMemberId=${otherMemberId}`);
//       const { roomId, displayName } = response.data;
//       navigate(`/chatpage/${roomId}`, { state: { displayName } });
//     } catch (error) {
//       console.error('채팅방을 생성하는 중 오류 발생:', error);
//     }
//   };

//   return (
//     <div className="memberlist-container">
//       <div className="memberlist-inner">
//         <Typography variant="h5" className="memberlist-header">회원목록</Typography>
//         <div>
//           {memberList.map((member) => (
//             <div key={member.userNo} className="memberlist-item">
//               <div>{member.userNo}</div>
//               <div>{member.userId}</div>
//               <div>{member.userEmail}</div>
//               <div>
//                 <Button color="primary" onClick={() => startChat(member.userNo)}>채팅하기</Button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MemberList;

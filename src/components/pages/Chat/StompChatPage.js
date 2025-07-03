import React, { useState, useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import { jwtDecode } from 'jwt-decode';
import './StompChatPage.css';

const StompChatPage = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [senderId, setSenderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [roomInfo, setRoomInfo] = useState(null);
  const [roomTitle, setRoomTitle] = useState('채팅방');
  const chatBoxRef = useRef(null);
  const token = localStorage.getItem('access');

  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      scrollToBottom();
      setIsInitialLoad(false);
    }
  }, [messages, isInitialLoad]);

  const fetchRoomInfo = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/v1/chat/room/${roomId}/info`);
      const roomData = response.data;
      setRoomInfo(roomData);
      
      // 채팅방 이름 설정
      if (roomData.isGroupChat === 'Y') {
        setRoomTitle(roomData.roomName || '그룹채팅방');
      } else {
        // 1대1 채팅방 : 방이름 상대방 닉네임 
        const currentUserId = senderId || (token ? jwtDecode(token).userId : null);
        const otherParticipant = roomData.participants?.find(p => p.userId !== currentUserId);
        setRoomTitle(otherParticipant?.userNick || '채팅방');
      }
    } catch (error) {
      console.error('채팅방 정보 불러오기 실패:', error);
      setRoomTitle('채팅방');
    }
  }, [roomId, senderId, token]); 

  const connectWebSocket = useCallback(async () => {
    if (stompClient && stompClient.connected) return;

    try {
      const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/reissue`);
      const accessToken = response.data.accessToken;
      localStorage.setItem("access", accessToken);

      const sockJs = new SockJS(`${process.env.REACT_APP_API_URL}/connect`);
      const client = Stomp.over(sockJs);

      client.connect(
        { Authorization: `Bearer ${accessToken}`, roomId },
        () => {
          client.subscribe(
            `/api/v1/chat/topic/${roomId}`,
            (message) => {
              const parsedMessage = JSON.parse(message.body);
              if (parsedMessage.type === 'READ') {
                window.dispatchEvent(new Event('chat-read'));
                return;
              }
              setMessages((prev) => [...prev, parsedMessage]);
              scrollToBottom();
            }
          );
        },
        (error) => {
          console.error('웹소켓 오류:', error);
        }
      );

      setStompClient(client);
    } catch (error) {
      console.error("WebSocket 연결 전 토큰 재발급 실패:", error);
    }
  }, [stompClient, roomId]);

  const disconnectWebSocket = useCallback(async () => {
    try {
      await axiosInstance.post(`/api/v1/chat/room/${roomId}/read`);
      if (stompClient && stompClient.connected) {
        stompClient.unsubscribe(`/api/v1/chat/topic/${roomId}`);
        stompClient.disconnect();
      }
    } catch (error) {
      console.error('웹소켓 종료 실패:', error);
    }
  }, [roomId, stompClient]);

  const fetchMessageHistory = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/v1/chat/history/${roomId}`);
      setMessages(response.data);
      connectWebSocket();
    } catch (error) {
      console.error('초기 메시지 불러오기 실패:', error);
    }
  }, [roomId, connectWebSocket]);

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setSenderId(decoded.userId);
    }
    fetchRoomInfo();
    fetchMessageHistory();
    return () => {
      disconnectWebSocket();
    };
  }, [roomId, token, fetchRoomInfo, fetchMessageHistory, disconnectWebSocket]);

  const fetchOlderMessages = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);

    const box = chatBoxRef.current;
    const scrollHeightBefore = box?.scrollHeight;
    const oldest = messages[0];
    const cursor = oldest?.createdDate;

    try {
      const res = await axiosInstance.get(`/api/v1/chat/history/${roomId}`, {
        params: { cursor }
      });

      const existingIds = new Set(messages.map((m) => m.id));
      const newUniqueMessages = res.data.filter((m) => !existingIds.has(m.id));

      if (res.data.length === 0) {
        setHasMore(false);
      }

      if (newUniqueMessages.length > 0) {
        setMessages((prev) => [...newUniqueMessages, ...prev]);
        setTimeout(() => {
          const scrollHeightAfter = box?.scrollHeight;
          if (box) {
            const offset = scrollHeightAfter - scrollHeightBefore;
            box.scrollTop = offset > 0 ? offset : 1;
          }
        }, 0);
      }
    } catch (error) {
      console.error('이전 메시지 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId, messages, hasMore, loading]);

  const handleScroll = useCallback(() => {
    const box = chatBoxRef.current;
    if (!box || loading || !hasMore) return;
    if (box.scrollTop <= 20) {
      fetchOlderMessages();
    }
  }, [loading, hasMore, fetchOlderMessages]);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    const token = localStorage.getItem('access');
    let sender = null;
    if (token) {
      const decoded = jwtDecode(token);
      sender = decoded.userId;
    }
    const message = { senderId: sender, message: newMessage };
    if (stompClient && stompClient.connected) {
      stompClient.send(`/api/v1/chat/publish/${roomId}`, 
      JSON.stringify(message), 
      { 'Content-Type': 'application/json; charset=UTF-8' });
      setNewMessage('');
    } else {
      console.error('웹소켓 연결 안됨');
    }
  };

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const box = chatBoxRef.current;
    if (!box) return;
    box.addEventListener('scroll', handleScroll);
    return () => box.removeEventListener('scroll', handleScroll);
  }, [messages, loading, handleScroll]);

  return (
    <div className="stompchat-container">
      <div className="stompchat-header">
        <h2>
          {roomTitle}
          {roomInfo?.participants?.length > 0 && (
            <> ({roomInfo.participants.length})</>
          )}
        </h2>
      </div>
      
      <div ref={chatBoxRef} className="stompchat-box">
        {loading && <div className="stompchat-loading">이전 메시지 불러오는 중</div>}
        {messages.map((msg) => {
          const isMine = msg.senderId?.toString() === senderId?.toString();
          return (
            <div key={msg.id} className={`stompchat-message-wrapper ${isMine ? 'stompchat-message-right' : 'stompchat-message-left'}`}>
              {!isMine && (
                <div className="stompchat-profile-img">
                  <img
                    src={msg.senderProfileImg || "https://crystalrose-web.s3.ap-northeast-2.amazonaws.com/profiles/default.jpg"}
                    alt="profile"
                    className="stompchat-profile-img-tag"
                  />
                </div>
              )}
              <div className="stompchat-message-content">
                {!isMine && (
                  <div className="stompchat-sender-name">
                    {msg.senderNick}
                  </div>
                )}
                <div className="stompchat-message-bubble-wrapper">
                  <div className="stompchat-message-bubble">
                    {msg.message}
                  </div>
                  <div className="stompchat-timestamp">
                    {new Date(msg.createdDate).toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="stompchat-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="메시지를 입력하세요"
          className="stompchat-input"
        />
        <button onClick={sendMessage} className="stompchat-button">
          전송
        </button>
      </div>
    </div>
  );
};

export default StompChatPage;
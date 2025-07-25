import React, { useState, useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import { jwtDecode } from 'jwt-decode';
import { format, isSameDay, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import './StompChatPage.css';
import { getAccessToken } from '@utils/api/token';

const StompChatPage = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [senderId, setSenderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [roomInfo, setRoomInfo] = useState(null);
  const [roomTitle, setRoomTitle] = useState('채팅방');
  const chatBoxRef = useRef(null);
  const isSubscribedRef = useRef(false);
  const token = localStorage.getItem('access');

  const getWsUrl = () => {
    const defaultHost = window.location.hostname === 'localhost'
      ? 'http://localhost:4000'
      : 'https://api.dodorose.com';
    const baseUrl = process.env.REACT_APP_API_URL || defaultHost;
    return `${baseUrl}/api/v1/connect`;
  };

  const scrollToBottom = () => {
    const box = chatBoxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  };

  const prevMessagesRef = useRef([]);
  useEffect(() => {
    const prevMessages = prevMessagesRef.current;
    const prevLastMsg = prevMessages[prevMessages.length - 1];
    const newLastMsg = messages[messages.length - 1];

    if (prevLastMsg?.id !== newLastMsg?.id && !loading) {
      setTimeout(() => {
        scrollToBottom();
      }, 0);
    }

    prevMessagesRef.current = messages;
  }, [messages, loading]);

  const fetchRoomInfo = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/v1/chat/room/${roomId}/info`);
      const roomData = response.data;
      setRoomInfo(roomData);
      const currentUserId = senderId || (token ? jwtDecode(token).userId : null);
      if (roomData.isGroupChat === 'Y') {
        setRoomTitle(roomData.roomName || '그룹채팅방');
      } else {
        const otherParticipant = roomData.participants?.find(p => p.userId !== currentUserId);
        setRoomTitle(otherParticipant?.userNick || '채팅방');
      }
    } catch (error) {
      console.error('채팅방 정보 불러오기 실패:', error);
      setRoomTitle('채팅방');
    }
  }, [roomId, senderId, token]);

  const connectWebSocket = useCallback(async () => {
    if (stompClient?.connected) return;
    try {
      const accessToken = await getAccessToken();
      const sock = new SockJS(getWsUrl());
      const client = Stomp.over(sock);

      client.connect(
        {
          Authorization: `Bearer ${accessToken}`,
          roomId: roomId.toString(),
          'accept-version': '1.1,1.2',
          'heart-beat': '10000,10000'
        },
        () => {
          if (!isSubscribedRef.current && stompClient?.connected) {
            client.subscribe(`/api/v1/chat/topic/${roomId}`, (message) => {
              const parsedMessage = JSON.parse(message.body);

              if (parsedMessage.type === 'READ') {
                window.dispatchEvent(new Event('chat-read'));
                return;
              }

              setMessages((prev) => {
                if (!parsedMessage.id || prev.some((m) => m.id === parsedMessage.id)) {
                  return prev;
                }
                return [...prev, parsedMessage];
              });
            });

            isSubscribedRef.current = true;
          }
        },
        (error) => {
          console.error('웹소켓 오류:', error);
          alert('실시간 채팅 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
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
      if (stompClient?.connected) {
        stompClient.unsubscribe(`/api/v1/chat/topic/${roomId}`);
        stompClient.disconnect();
        isSubscribedRef.current = false;
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
    return () => disconnectWebSocket();
  }, [roomId, token, fetchRoomInfo, fetchMessageHistory, disconnectWebSocket]);

  const fetchOlderMessages = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);

    const box = chatBoxRef.current;
    const scrollHeightBefore = box?.scrollHeight;
    const oldest = messages[0];
    const cursor = oldest?.createdDate;

    try {
      const res = await axiosInstance.get(`/api/v1/chat/history/${roomId}`, { params: { cursor } });
      const existingIds = new Set(messages.map((m) => m.id));
      const newUniqueMessages = res.data.filter((m) => !existingIds.has(m.id));
      if (res.data.length === 0) setHasMore(false);
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
    if (box.scrollTop <= 20) fetchOlderMessages();
  }, [loading, hasMore, fetchOlderMessages]);

  useEffect(() => {
    const box = chatBoxRef.current;
    if (!box) return;
    box.addEventListener('scroll', handleScroll);
    return () => box.removeEventListener('scroll', handleScroll);
  }, [messages, loading, handleScroll]);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    const token = localStorage.getItem('access');
    let sender = null;
    if (token) {
      const decoded = jwtDecode(token);
      sender = decoded.userId;
    }
    const message = {
      senderId: sender,
      message: newMessage,
      createdDate: new Date().toISOString(),
      senderNick: roomInfo?.participants?.find(p => p.userId === sender)?.userNick || '',
      senderProfileImg: roomInfo?.participants?.find(p => p.userId === sender)?.userProfileImg || ''
    };
    if (stompClient?.connected) {
      stompClient.send(`/api/v1/chat/publish/${roomId}`, JSON.stringify(message), {
        'Content-Type': 'application/json; charset=UTF-8'
      });
      setMessages((prev) => [...prev, { ...message, id: `local-${Date.now()}` }]);
      scrollToBottom();
      setNewMessage('');
    } else {
      console.error('웹소켓 연결 안됨');
    }
  };

  const renderMessagesWithDateSeparators = () => {
    const grouped = [];
    let currentDate = null;
    messages.forEach((msg, index) => {
      const msgDate = parseISO(msg.createdDate);
      if (!currentDate || !isSameDay(currentDate, msgDate)) {
        currentDate = msgDate;
        grouped.push(
          <div key={`date-${index}`} className="stompchat-date-separator">
            {format(currentDate, 'yyyy년 MM월 dd일 EEEE', { locale: ko })}
          </div>
        );
      }
      const isMine = msg.senderId?.toString() === senderId?.toString();
      const key = msg.id ?? msg.createdDate ?? `msg-${index}`;
      grouped.push(
        <div key={key} className={`stompchat-message-wrapper ${isMine ? 'stompchat-message-right' : 'stompchat-message-left'}`}>
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
            {!isMine && <div className="stompchat-sender-name">{msg.senderNick}</div>}
            <div className="stompchat-message-bubble-wrapper">
              <div className="stompchat-message-bubble">{msg.message}</div>
              <div className="stompchat-timestamp">
                {new Date(msg.createdDate).toLocaleTimeString('ko-KR', {
                  hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      );
    });
    return grouped;
  };

  return (
    <div className="stompchat-container">
      <div className="stompchat-header">
        <h2>
          {roomTitle}
          {roomInfo?.participants?.length > 0 && <> ({roomInfo.participants.length})</>}
        </h2>
      </div>
      <div ref={chatBoxRef} className="stompchat-box">
        {loading && <div className="stompchat-loading">이전 메시지 불러오는 중</div>}
        {renderMessagesWithDateSeparators()}
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
        <button onClick={sendMessage} className="stompchat-button">전송</button>
      </div>
    </div>
  );
};

export default StompChatPage;

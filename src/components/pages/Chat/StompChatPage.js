import React, { useState, useEffect, useRef } from 'react';
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
  const chatBoxRef = useRef(null);
  const token = localStorage.getItem('access');

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setSenderId(decoded.userId);
    }
    fetchMessageHistory();
    return () => {
      disconnectWebSocket();
    };
  }, [roomId]);

  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      scrollToBottom();
      setIsInitialLoad(false);
    }
  }, [messages]);

  const fetchMessageHistory = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/chat/history/${roomId}`);
      setMessages(response.data);
      connectWebSocket();
    } catch (error) {
      console.error('초기 메시지 불러오기 실패:', error);
    }
  };

  const fetchOlderMessages = async () => {
    if (!hasMore || loading) return;
    setLoading(true);

    const box = chatBoxRef.current;
    const scrollHeightBefore = box?.scrollHeight;
    const oldest = messages[0];
    const cursor = oldest?.createdDate;

    console.log('oldest message:', oldest);
    console.log('cursor:', cursor);

    try {
      const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/chat/history/${roomId}`, {
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
  };

  const handleScroll = () => {
    const box = chatBoxRef.current;
    if (!box || loading || !hasMore) return;
    if (box.scrollTop <= 20) { // 여유 buffer
      fetchOlderMessages();
    }
  };

  const connectWebSocket = async () => {
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
            `/topic/${roomId}`,
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
  };

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
      stompClient.send(`/publish/${roomId}`, 
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

  const disconnectWebSocket = async () => {
    try {
      await axiosInstance.post(`${process.env.REACT_APP_API_URL}/chat/room/${roomId}/read`);
      if (stompClient && stompClient.connected) {
        stompClient.unsubscribe(`/topic/${roomId}`);
        stompClient.disconnect();
      }
    } catch (error) {
      console.error('웹소켓 종료 실패:', error);
    }
  };

  useEffect(() => {
    const box = chatBoxRef.current;
    if (!box) return;
    box.addEventListener('scroll', handleScroll);
    return () => box.removeEventListener('scroll', handleScroll);
  }, [messages, loading]);

  return (
    <div className="stompchat-container">
      <div ref={chatBoxRef} className="stompchat-box">
      {messages.map((msg) => {
        const isMine = msg.senderId?.toString() === senderId?.toString();
        return (
          <div key={msg.id}>
            <div className={isMine ? 'stompchat-message-right' : 'stompchat-message-left'}>
              {!isMine && <strong>{msg.senderNick}: </strong>}
              {msg.message}
            </div>
          </div>
        );
      })}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="메시지 입력"
        className="stompchat-input"
      />
      <button onClick={sendMessage} className="stompchat-button">
        전송
      </button>
    </div>
  );
};

export default StompChatPage;

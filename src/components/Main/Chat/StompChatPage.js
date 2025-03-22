import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Chat = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [senderEmail, setSenderEmail] = useState(null);
  const chatBoxRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    setSenderEmail(localStorage.getItem('email'));
    fetchMessageHistory();

    return () => {
      disconnectWebSocket();
    };
  }, [roomId]);

  const fetchMessageHistory = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/chat/history/${roomId}`);
      setMessages(response.data);
      connectWebSocket();  // 메시지 기록을 가져온 후 WebSocket 연결
    } catch (error) {
      console.error('메세지 기록 파싱 오류:', error);
    }
  };

  const connectWebSocket = () => {
    if (stompClient && stompClient.connected) return;  // 이미 연결된 경우

    const sockJs = new SockJS(`${process.env.REACT_APP_API_URL}/connect`);
    const client = Stomp.over(sockJs);
    client.connect(
      { access : token }, // 헤더에 토큰 담아서 전달
      () => {
        client.subscribe(
          `/topic/${roomId}`,
          (message) => {
            const parsedMessage = JSON.parse(message.body);
            setMessages((prevMessages) => [...prevMessages, parsedMessage]);
            scrollToBottom();
          },
          { access : token }
        );
      },
      (error) => {
        console.error('웹소켓 오류:', error);
      }
    );

    setStompClient(client);
  };

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      senderEmail,
      message: newMessage,
    };

    if (stompClient && stompClient.connected) {
      stompClient.send(`/publish/${roomId}`, JSON.stringify(message));
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
      await axios.post(`${process.env.REACT_APP_API_URL}/chat/room/${roomId}/read`);
      if (stompClient && stompClient.connected) {
        stompClient.unsubscribe(`/topic/${roomId}`);
        stompClient.disconnect();
      }
    } catch (error) {
      console.error('웹소켓 단절 오류:', error);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        ref={chatBoxRef}
        style={{
          height: '300px',
          overflowY: 'auto',
          border: '1px solid #ddd',
          marginBottom: '10px',
          padding: '10px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.senderEmail === senderEmail ? 'sent' : 'received'}`}
            style={{
              textAlign: msg.senderEmail === senderEmail ? 'right' : 'left',
            }}
          >
            <strong>{msg.senderEmail}: </strong> {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="메시지 입력"
        style={{
          padding: '10px',
          marginBottom: '10px',
          border: '1px solid #ddd',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      <button
        onClick={sendMessage}
        style={{
          padding: '10px',
          backgroundColor: 'rgb(212, 194, 255)',
          color: 'black',
          border: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        전송
      </button>
    </div>
  );
};

export default Chat;

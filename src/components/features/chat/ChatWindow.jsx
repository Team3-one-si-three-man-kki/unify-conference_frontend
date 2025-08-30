// src/components/features/chat/ChatWindow.jsx

import React, { useState, useEffect, useRef }from 'react';
import styles from './ChatWindow.module.css';

// onClose 함수를 props로 받아서 닫기 버튼에 연결합니다.
const ChatWindow = ({ messages, onSendMessage, onClose }) => {

  const [inputValue, setInputValue] = useState('');
  const messageListRef = useRef(null);
  // 2. 새 메시지가 추가될 때마다 스크롤을 맨 아래로 내립니다.
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  // 3. 전송 버튼 클릭 또는 Enter 키 입력 시 메시지를 보냅니다.
  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h3>채팅</h3>
        <button onClick={onClose} className={styles.closeButton}>×</button>
      </div>
      <div ref={messageListRef} className={styles.messageList}>
        {messages.map((msg, index) => (
          <div key={index} className={styles.message}>
            <span className={styles.sender}>{msg.sender}</span>
            <p className={styles.text}>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className={styles.chatInputForm}>
        <input 
          type="text" 
          placeholder="메시지 입력..." 
          className={styles.chatInput}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSend} className={styles.sendButton}>전송</button>
      </div>
    </div>
  );
};

export default ChatWindow;
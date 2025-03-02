
import EmojiPicker from "emoji-picker-react";
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

const socket = io("https://chatroom-qcmq.onrender.com");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [room, setRoom] = useState("general");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit("joinRoom", room);

    socket.on("message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, [room]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { room, message });
      setMessage("");
    }
  };

  const addEmoji = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowPicker(false);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Chatroom</h2>

      {/* Chat messages */}
      <div
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          background: "#231815",
        }}
      >
        {messages.map((msg, index) => (
          <p key={index} style={{ color: "white" }}>
            <strong>{msg.user}:</strong> {msg.text}
          </p>
        ))}
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", padding: "5px", borderRadius: "5px" }}>
          {/* Emoji Button */}
          <button 
            onClick={() => {
              setShowPicker(!showPicker);
              setShowKeyboard(false);
            }} 
            style={{ marginRight: "5px", fontSize: "20px", border: "none", background: "transparent", cursor: "pointer" }}
          >
            😀
          </button>

          {/* Chat input field */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onClick={() => {
              setShowKeyboard(true);
              setShowPicker(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            style={{ padding: "10px", fontSize: "16px", width: "250px", border: "none", outline: "none" }}
          />

          {/* Send button */}
          <button onClick={sendMessage} style={{ marginLeft: "5px", padding: "10px", border: "none", cursor: "pointer", background: "#007bff", color: "white", borderRadius: "5px" }}>
            Send
          </button>
        </div>
      </div>

      {/* Emoji Picker */}
      {showPicker && <EmojiPicker onEmojiClick={addEmoji} />}

      {/* Virtual Keyboard */}
      {showKeyboard && (
        <Keyboard
          onChange={(input) => setMessage(input)}
          onKeyPress={(button) => {
            if (button === "{enter}") sendMessage();
          }}
        />
      )}
    </div>
  );
}

export default App;

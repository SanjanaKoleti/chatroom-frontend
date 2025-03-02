
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
  const [room] = useState("general");
const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const messagesEndRef = useRef(null);
  const keyboardRef = useRef(null);
  const inputRef = useRef(null);
  // Detect if the user is on a mobile or tablet
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  
  const quotes = [
    "Real talk, no filters, no faces",
    "Your thoughts, your space, no judgment",
    "Speak your mind, no names needed",
    "Share, connect, and explore—anonymously"
  ];
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 3000); // Change quote every 3 seconds

    return () => clearInterval(quoteInterval);
  }, [quotes.length]);

  
  useEffect(() => {
    socket.emit("joinRoom", room);

    socket.on("message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, [room]);

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
useEffect(() => {
    if (isMobile) {
      setShowKeyboard(true);
    }
  }, [isMobile]);
  
  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { room, message });
      setMessage(""); // Clear input
      if (keyboardRef.current) {
        keyboardRef.current.clearInput(); // Clear virtual keyboard input
      }
    }
  };

  
  const addEmoji = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    //setShowPicker(false);
    inputRef.current?.focus(); // Bring focus back to input field after adding emoji
  };
  
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>AnonimusChat</h2>
      <div style={{ marginBottom: "20px", fontSize: "18px", fontStyle: "italic" }}>
        <p>{quotes[currentQuoteIndex]}</p>
      </div>

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
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", padding: "5px", borderRadius: "5px" }}>
          {/* Toggle Emoji/Keyboard */}
          <button
            onClick={() => {
              setShowPicker(!showPicker);
              setShowKeyboard(false);
            }}
            style={{ marginRight: "5px", fontSize: "20px", border: "none", background: "transparent", cursor: "pointer" }}
          >
            {showPicker ? "⌨️" : "😀"}
          </button>
            
            <input type="text"
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
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

      {/* Emoji Picker - Same width as keyboard */}
      {showPicker && (
        <div style={{ maxWidth: "400px", margin: "auto" }}>
          <EmojiPicker onEmojiClick={addEmoji} />
        </div>
      )}

      {/* Virtual Keyboard (only for mobile users) */}
      {showKeyboard && isMobile && (
        <div style={{ maxWidth: "400px", margin: "auto" }}>
          <Keyboard
            keyboardRef={(r) => (keyboardRef.current = r)}
            onChange={(input) => setMessage(input)}
            onKeyPress={(button) => {
              if (button === "{enter}") sendMessage();
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import "./ChatPopup.css";

const ChatPopup = ({ role, name, socket, onKicked }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    if (socket && name && role) {
      socket.emit("joinUser", { name, role });
    }

    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("participants", (list) => {
      setParticipants(list);
    });

    socket.on("kicked", () => {
      if (typeof onKicked === "function") {
        onKicked(); // Tell StudentPanel to swap to KickedOut
      }
      setIsOpen(false);
    });

    return () => {
      socket.off("chatMessage");
      socket.off("participants");
      socket.off("kicked");
    };
  }, [socket, name, role, onKicked]);

  const sendMessage = () => {
    if (newMsg.trim()) {
      socket.emit("chatMessage", { text: newMsg, name, role });
      setNewMsg("");
    }
  };

  const handleKick = (id) => {
    if (role === "teacher") {
      socket.emit("kickUser", id);
    }
  };

  return (
    <div className="chat-popup-container">
      {!isOpen && (
        <button
          className="chat-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Open Chat"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="chat-box">
          {/* Tabs */}
          <div className="chat-tabs">
            <div
              className={`chat-tab ${tab === "chat" ? "active" : ""}`}
              onClick={() => setTab("chat")}
            >
              Chat
            </div>
            <div
              className={`chat-tab ${tab === "participants" ? "active" : ""}`}
              onClick={() => setTab("participants")}
            >
              Participants
            </div>
            <div
              style={{
                marginLeft: "auto",
                padding: "0 10px",
                cursor: "pointer",
              }}
              onClick={() => setIsOpen(false)}
            >
              ❌
            </div>
          </div>

          {/* Chat Section */}
          {tab === "chat" ? (
            <>
              <div className="chat-messages">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`chat-message ${m.name === name ? "user" : ""}`}
                  >
                    <div className="bubble">
                      <strong>{m.name}: </strong>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div className="chat-messages">
              {participants.map((p) => (
                <div key={p.id} className="chat-message">
                  <div className="bubble">
                    {p.name}{" "}
                    {role === "teacher" && (
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          marginLeft: "10px",
                        }}
                        onClick={() => handleKick(p.id)}
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPopup;

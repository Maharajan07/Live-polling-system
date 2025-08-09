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

      // Auto-open popup if message is from another user
      if (msg.name !== name) {
        setIsOpen(true);
      }
    });

    socket.on("participants", (list) => {
      setParticipants(list);
    });

    socket.on("kicked", () => {
      if (typeof onKicked === "function") {
        onKicked();
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
      {/* Floating toggle button (same for open/close) */}
      <button
        className="chat-toggle-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        title={isOpen ? "Close Chat" : "Open Chat"}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="#fff"/>
        </svg>
      </button>

      {isOpen && (
        <div className="chat-box" role="dialog" aria-label="Chat popup">
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
            <div className="tab-underline" />
          </div>

          {/* Chat content */}
          {tab === "chat" ? (
            <>
              <div className="chat-messages">
                {messages.map((m, idx) => {
                  const isUser = m.name === name;
                  return (
                    <div
                      key={idx}
                      className={`chat-message ${isUser ? "user" : "other"}`}
                    >
                      <div className="msg-username">{m.name}</div>
                      <div className={`bubble ${isUser ? "bubble-user" : "bubble-other"}`}>
                        {m.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="chat-input">
                <input
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="send-btn" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </>
          ) : (
            /* Participants tab */
            <div className="participants-container">
              <div className="participants-header">
                <div className="col-name">Name</div>
                {role === "teacher" && <div className="col-action">Action</div>}
              </div>

              <div className="participants-list">
                {participants
                  .filter((p) => p.role !== "teacher")
                  .map((p) => (
                    <div key={p.id} className="participants-row">
                      <div className="col-name">{p.name}</div>
                      {role === "teacher" ? (
                        <div className="col-action">
                          <span
                            className="kick-link"
                            onClick={() => handleKick(p.id)}
                          >
                            Kick out
                          </span>
                        </div>
                      ) : (
                        <div className="col-action" />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPopup;

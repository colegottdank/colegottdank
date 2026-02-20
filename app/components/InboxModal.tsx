"use client";

import { useState, useEffect } from "react";
import { X, Heart, MessageCircle, UserPlus, AtSign, Check } from "lucide-react";
import { 
  Notification, 
  Message, 
  getUserState,
  userProfiles,
  mockNotifications,
  mockMessages
} from "@/lib/data";
import { toast } from "./Toast";

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "notifications" | "messages";
}

export function InboxModal({ isOpen, onClose, initialTab = "notifications" }: InboxModalProps) {
  const [activeTab, setActiveTab] = useState<"notifications" | "messages">(initialTab);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (isOpen) {
      const state = getUserState();
      setNotifications(state.notifications);
      setMessages(state.messages);
    }
  }, [isOpen]);

  // Generate mock notifications if empty
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      setNotifications(mockNotifications);
    }
  }, [isOpen, notifications.length]);

  // Generate mock messages if empty
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages(mockMessages);
    }
  }, [isOpen, messages.length]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-[#fe2c55]" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-[#20d5ec]" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-[#fe2c55]" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-green-500" />;
      default:
        return <Heart className="w-5 h-5 text-[#fe2c55]" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0f0f0f]">
        <button 
          onClick={onClose}
          className="text-white/60 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-semibold text-lg">
          {activeTab === "notifications" ? "Notifications" : "Messages"}
        </span>
        {activeTab === "notifications" && unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-[#fe2c55] text-sm"
          >
            Mark all read
          </button>
        )}
        {activeTab === "messages" && <div className="w-12" />}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-[#0f0f0f]">
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "notifications" ? "text-white" : "text-white/50"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-[#fe2c55] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          {activeTab === "notifications" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fe2c55]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "messages" ? "text-white" : "text-white/50"
          }`}
        >
          Messages
          {activeTab === "messages" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fe2c55]" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f0f]">
        {activeTab === "notifications" ? (
          notifications.length > 0 ? (
            <div className="divide-y divide-white/10">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 hover:bg-white/5 transition-colors ${
                    !notification.read ? "bg-white/5" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.username}`}
                        alt={notification.username}
                        className="w-10 h-10 rounded-full bg-gray-700"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          <span className="font-semibold">{notification.username}</span>{" "}
                          {notification.text}
                        </p>
                        <p className="text-white/40 text-xs mt-1">{notification.timestamp}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[#fe2c55] rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/40 py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white/40" />
              </div>
              <p>All caught up!</p>
              <p className="text-sm mt-1">No new notifications</p>
            </div>
          )
        ) : (
          messages.length > 0 ? (
            <div className="divide-y divide-white/10">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`flex items-start gap-3 p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                    !message.read ? "bg-white/5" : ""
                  }`}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.username}`}
                    alt={message.username}
                    className="w-12 h-12 rounded-full bg-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-semibold text-sm">{message.username}</p>
                      <p className="text-white/40 text-xs">{message.timestamp}</p>
                    </div>
                    <p className={`text-sm mt-1 truncate ${!message.read ? "text-white" : "text-white/60"}`}>
                      {message.sent && <span className="text-white/40 mr-1">You: </span>}
                      {message.text}
                    </p>
                  </div>
                  {!message.read && (
                    <div className="w-2 h-2 bg-[#fe2c55] rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/40 py-12">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm mt-1">Start a conversation!</p>
            </div>
          )
        )}
      </div>

      {/* Message Detail View */}
      {selectedMessage && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-[#0f0f0f]">
            <button onClick={() => setSelectedMessage(null)} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMessage.username}`}
              alt={selectedMessage.username}
              className="w-10 h-10 rounded-full bg-gray-700"
            />
            <span className="text-white font-semibold">{selectedMessage.username}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-[#0f0f0f]">
            <div className="space-y-4">
              {/* Original message */}
              <div className="flex items-start gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMessage.username}`}
                  alt={selectedMessage.username}
                  className="w-10 h-10 rounded-full bg-gray-700"
                />
                <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                  <p className="text-white text-sm">{selectedMessage.text}</p>
                  <p className="text-white/40 text-xs mt-1">{selectedMessage.timestamp}</p>
                </div>
              </div>
              {/* Show all messages from this conversation */}
              {messages.filter(m => m.username === selectedMessage.username && m.sent).map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 justify-end">
                  <div className="bg-[#fe2c55] rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                    <p className="text-white text-sm">{msg.text}</p>
                    <p className="text-white/60 text-xs mt-1">{msg.timestamp}</p>
                  </div>
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser&backgroundColor=b6e3f4"
                    alt="You"
                    className="w-10 h-10 rounded-full bg-gray-700"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-white/10 bg-[#0f0f0f]">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/10 rounded-full px-4 py-2 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && replyText.trim() && selectedMessage) {
                    const newMessage: Message = {
                      id: Date.now(),
                      username: selectedMessage.username,
                      text: replyText.trim(),
                      timestamp: "Just now",
                      read: true,
                      sent: true
                    };
                    setMessages(prev => [...prev, newMessage]);
                    toast.success("Message sent!");
                    setReplyText("");
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (replyText.trim() && selectedMessage) {
                    const newMessage: Message = {
                      id: Date.now(),
                      username: selectedMessage.username,
                      text: replyText.trim(),
                      timestamp: "Just now",
                      read: true,
                      sent: true
                    };
                    setMessages(prev => [...prev, newMessage]);
                    toast.success("Message sent!");
                    setReplyText("");
                  }
                }}
                className="px-4 py-2 bg-[#fe2c55] text-white rounded-full text-sm font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

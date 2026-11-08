import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, Users, UserPlus } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { subscribeRealtimeMessages, sendRealtimeMessage, RealtimeChatMessage } from '../services/realtimeChat';
import { getVisitorId } from '../services/realtimePresence';

interface DirectMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChatThreadId?: string;
  side?: 'left' | 'right';
  onToggleSide?: () => void;
}

interface ChatThread {
  id: string;
  name: string;
  initials: string;
  lastMsg: string;
  time: string;
  isSelf?: boolean;
}

export const DirectMessagesModal: React.FC<DirectMessagesModalProps> = ({
  isOpen,
  onClose,
  initialChatThreadId,
}) => {
  const [activeTab, setActiveTab] = useState<'dms' | 'group' | 'requests'>('dms');
  const [selectedChat, setSelectedChat] = useState<ChatThread | null>(null);
  const [realtimeMsgs, setRealtimeMsgs] = useState<RealtimeChatMessage[]>([]);
  const [inputText, setInputText] = useState('');

  const visitorId = getVisitorId();

  const chatThreads: ChatThread[] = [
    { id: 'global', name: 'Global Saloon Chat 💬', initials: 'ALL', lastMsg: 'Live chat with all players!', time: 'Now' },
    { id: 'note-to-self', name: 'Note to Self 📝', initials: 'ME', lastMsg: 'Remember to practice Euchre loner calls!', time: 'Now', isSelf: true },
    { id: '1', name: 'AminaAce', initials: 'AM', lastMsg: 'Ready for a rematch?', time: '2m' },
    { id: '2', name: 'DiceMage', initials: 'DM', lastMsg: 'That last roll was wild.', time: '18m' },
    { id: '3', name: 'PriyaPlays', initials: 'PR', lastMsg: 'Join my table tonight!', time: '1h' },
  ];

  // Subscribe to real-time messages when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const channelId = selectedChat ? selectedChat.id : 'global';
    const unsub = subscribeRealtimeMessages(channelId, (msgs) => {
      setRealtimeMsgs(msgs);
    });
    return () => unsub();
  }, [isOpen, selectedChat]);

  // Open initialChatThreadId if provided (e.g. Note to self)
  React.useEffect(() => {
    if (initialChatThreadId && isOpen) {
      const match = chatThreads.find(t => t.id === initialChatThreadId);
      if (match && selectedChat?.id !== match.id) {
        setSelectedChat(match);
      }
    }
  }, [initialChatThreadId, isOpen, selectedChat?.id]);

  if (!isOpen) return null;

  const handleOpenChat = (thread: ChatThread) => {
    sounds.playClick();
    setSelectedChat(thread);
  };

  const handleSendDM = async () => {
    if (!inputText.trim()) return;
    sounds.playClick();
    const textToSend = inputText.trim();
    setInputText('');

    const channelId = selectedChat ? selectedChat.id : 'global';
    await sendRealtimeMessage({
      senderId: visitorId,
      senderName: 'Euchre Player',
      senderAvatar: '🤠',
      text: textToSend,
      channelId,
    }).catch(() => null);
  };

  return (
    <div
      className="fixed top-1/2 -translate-y-1/2 right-20 sm:right-22 z-50 w-[380px] sm:w-[440px] h-[380px] sm:h-[440px] max-w-[calc(100vw-6.5rem)] max-h-[calc(100vh-2rem)] aspect-square bg-[#0b1326] border-2 border-blue-500/80 rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white flex flex-col justify-between overflow-hidden duration-200 animate-in slide-in-from-right-5 font-sans"
    >
      {/* Top Header */}
      <div className="w-full flex items-start justify-between pb-2.5 border-b border-slate-800 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wider">MESSAGES</h2>
          <p className="text-[11px] sm:text-xs text-stone-400 font-medium">Saloon Direct Messages & Chats</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-stone-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Navigation Tabs */}
      <div className="w-full grid grid-cols-3 text-center border-b border-slate-800 text-xs font-bold text-stone-400 shrink-0">
        <button
          onClick={() => {
            setActiveTab('dms');
            setSelectedChat(null);
          }}
          className={`py-2.5 relative ${activeTab === 'dms' ? 'text-white font-black' : 'hover:text-stone-200'}`}
        >
          DMs
          {activeTab === 'dms' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('group')}
          className={`py-2.5 relative ${activeTab === 'group' ? 'text-white font-black' : 'hover:text-stone-200'}`}
        >
          Group chats
          {activeTab === 'group' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`py-2.5 relative ${activeTab === 'requests' ? 'text-white font-black' : 'hover:text-stone-200'}`}
        >
          Requests <span className="text-rose-400 font-black">2</span>
          {activeTab === 'requests' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full overflow-y-auto py-2.5 space-y-2.5 min-h-0">
        {selectedChat ? (
          /* Active Chat Conversation */
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 shrink-0">
              <button
                onClick={() => setSelectedChat(null)}
                className="text-xs text-blue-400 font-bold hover:underline"
              >
                ← Back
              </button>
              <span className="font-black text-sm text-white">{selectedChat.name}</span>
            </div>

            <div className="flex-1 py-3 space-y-2 overflow-y-auto min-h-0">
              {realtimeMsgs.length === 0 ? (
                <div className="text-center py-6 text-stone-500 text-xs italic">
                  No messages in this saloon channel yet. Say howdy!
                </div>
              ) : (
                realtimeMsgs.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl text-xs ${
                      msg.senderId === visitorId
                        ? 'bg-blue-600/30 border border-blue-500/50 text-blue-100 ml-4'
                        : 'bg-[#121f3d] border border-slate-800 text-stone-200 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between font-black text-[10px] text-amber-300/90 mb-1">
                      <span>{msg.senderName}</span>
                      <span className="text-stone-400 font-normal">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendDM()}
                placeholder="Type a message..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleSendDM}
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition font-bold"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : activeTab === 'dms' ? (
          /* DMs List matching Screenshot 3 */
          chatThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => handleOpenChat(thread)}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#0e172e]/60 hover:bg-[#121e3c] border border-slate-800/80 cursor-pointer transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-600 text-white font-black text-sm sm:text-base flex items-center justify-center shadow-md shrink-0">
                  {thread.initials}
                </div>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-white group-hover:text-blue-400 transition">
                    {thread.name}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-stone-400 font-medium truncate max-w-[180px]">
                    {thread.lastMsg}
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-stone-500 font-bold">{thread.time}</span>
            </div>
          ))
        ) : activeTab === 'group' ? (
          <div className="text-center py-10 text-stone-400 text-xs">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            No active group chats. Create one to invite your saloon team!
          </div>
        ) : (
          <div className="text-center py-10 text-stone-400 text-xs">
            <UserPlus className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            2 Pending friend requests from Texas Sovereigns.
          </div>
        )}
      </div>
    </div>
  );
};

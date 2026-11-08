import React, { useState, useEffect } from 'react';
import { X, UserPlus, MessageSquare, Eye, Check, UserX, ExternalLink, Trophy } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { GmailMailboxIcon } from './TopHeader';
import {
  MailboxState,
  loadMailboxState,
  saveMailboxState,
  MailboxFriendRequest,
  MailboxMessage,
  MailboxProfileVisit,
} from '../data/mailboxData';

interface MailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDMs: () => void;
  onVisitProfile?: (username: string) => void;
  onAcceptChallenge?: (challenge: { townId: string; townName: string; stake: number; mode: string }) => void;
}

export const MailboxModal: React.FC<MailboxModalProps> = ({
  isOpen,
  onClose,
  onOpenDMs,
  onVisitProfile,
  onAcceptChallenge,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'messages' | 'visits'>('friends');
  const [mailboxState, setMailboxState] = useState<MailboxState>(loadMailboxState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMailboxState(loadMailboxState());
    }
  }, [isOpen]);

  const updateState = (newState: MailboxState) => {
    setMailboxState(newState);
    saveMailboxState(newState);
  };

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAcceptFriend = (req: MailboxFriendRequest) => {
    sounds.playWin();
    const updatedFriends = mailboxState.friends.map((f) =>
      f.id === req.id ? { ...f, status: 'accepted' as const } : f
    );
    updateState({ ...mailboxState, friends: updatedFriends });
    showToast(`🤝 Accepted friend request from ${req.name}!`);
  };

  const handleDeclineFriend = (id: string) => {
    sounds.playClick();
    const updatedFriends = mailboxState.friends.filter((f) => f.id !== id);
    updateState({ ...mailboxState, friends: updatedFriends });
    showToast('Friend request declined.');
  };

  const handleMarkMessageRead = (msgId: string) => {
    const updatedMessages = mailboxState.messages.map((m) =>
      m.id === msgId ? { ...m, unread: false } : m
    );
    updateState({ ...mailboxState, messages: updatedMessages });
  };

  const pendingFriends = mailboxState.friends.filter((f) => f.status === 'pending');
  const unreadMessages = mailboxState.messages.filter((m) => m.unread);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 text-white select-none">
      <div className="relative w-full max-w-2xl bg-[#090f1e] border-2 border-red-500/80 rounded-3xl p-5 shadow-[0_0_50px_rgba(239,68,68,0.3)] flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-red-500 p-1.5 flex items-center justify-center shadow-lg shrink-0">
              <GmailMailboxIcon className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-500/40">
                  REAL NOTIFICATION CENTER
                </span>
              </div>
              <h1 className="text-xl font-black text-white tracking-wide mt-0.5">
                Saloon Mailbox & Dispatch
              </h1>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-stone-400 hover:text-white border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {toastMessage && (
          <div className="my-2 p-2 bg-emerald-950/90 border border-emerald-400 rounded-xl text-emerald-200 text-xs font-bold text-center animate-pulse">
            {toastMessage}
          </div>
        )}

        {/* INTERNAL TABS: Friends, Messages, Visitors */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#030712] border border-slate-800 p-1.5 rounded-2xl my-3">
          {[
            { id: 'friends', label: '🤝 Friends', count: pendingFriends.length, color: 'text-purple-400' },
            { id: 'messages', label: '💬 Messages', count: unreadMessages.length, color: 'text-cyan-400' },
            { id: 'visits', label: '👁️ Visitors', count: mailboxState.visits.length, color: 'text-amber-400' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-black/60 text-yellow-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {/* TAB 1: FRIENDS */}
          {activeTab === 'friends' && (
            <div className="space-y-2">
              {mailboxState.friends.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-sm font-medium">
                  No active friend requests right now.
                </div>
              ) : (
                mailboxState.friends.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-[#0d1527] border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-purple-500/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-2xl shadow">
                        {req.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm">{req.name}</span>
                          <span className="text-[10px] font-mono text-purple-400 font-bold">
                            Lvl {req.level}
                          </span>
                        </div>
                        <div className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                          <span>@{req.username}</span>
                          <span>•</span>
                          <span className="text-stone-400">{req.city}</span>
                          <span>•</span>
                          <span className="text-stone-500">{req.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === 'accepted' ? (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Friends
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAcceptFriend(req)}
                            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition active:scale-95 flex items-center gap-1 text-xs font-black"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleDeclineFriend(req.id)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-stone-400 hover:text-white rounded-xl transition active:scale-95"
                            title="Decline"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-2">
              {mailboxState.messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleMarkMessageRead(msg.id)}
                  className={`p-3.5 rounded-2xl border transition ${
                    msg.unread
                      ? 'bg-[#101b33] border-cyan-500/60 shadow-lg'
                      : 'bg-[#0b101e] border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-900/60 border border-cyan-400/40 flex items-center justify-center text-xl shadow">
                        {msg.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm">{msg.senderName}</span>
                          <span className="text-[10px] text-stone-400 font-mono">@{msg.senderUsername}</span>
                          {msg.unread && (
                            <span className="text-[9px] bg-cyan-500 text-stone-950 font-black px-1.5 py-0.2 rounded-full">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-200 mt-1">{msg.text}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono shrink-0">{msg.time}</span>
                  </div>

                  {msg.tableChallenge && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Challenge: {msg.tableChallenge.townName}</span>
                        <span className="text-yellow-400 font-mono">(${msg.tableChallenge.stake} pot)</span>
                      </div>
                      <button
                        onClick={() => {
                          sounds.playClick();
                          if (onAcceptChallenge) {
                            onAcceptChallenge(msg.tableChallenge!);
                          }
                          onClose();
                        }}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black rounded-xl shadow transition active:scale-95"
                      >
                        Accept & Play
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: VISITS */}
          {activeTab === 'visits' && (
            <div className="space-y-2">
              {mailboxState.visits.map((vis) => (
                <div
                  key={vis.id}
                  className="p-3 bg-[#0d1527] border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-amber-500/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-950/60 border border-amber-400/40 flex items-center justify-center text-xl shadow">
                      {vis.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-sm">{vis.visitorName}</span>
                        <span className="text-[10px] text-amber-400 font-bold">Lvl {vis.level}</span>
                        <span className="text-[10px] text-stone-400 font-mono">({vis.townTitle})</span>
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5">
                        Viewed your <strong className="text-amber-200">{vis.viewedDeck}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-stone-400 font-mono block">{vis.time}</span>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        if (onVisitProfile) {
                          onVisitProfile(vis.visitorUsername);
                        }
                      }}
                      className="text-[10px] text-cyan-400 hover:underline font-bold mt-1 inline-block"
                    >
                      Visit Profile →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import { fetchConversations, fetchMessages } from '../services/messageService';
import { initSocket, getSocket } from '../services/socketService';
import { Send, User, Search, ArrowLeft, MoreVertical, CheckCheck, Loader2 } from 'lucide-react';

const Chat = () => {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typing, setTyping] = useState(null);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      const token = localStorage.getItem('token');
      socketRef.current = initSocket(token);
      loadConversations();
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off('receive_message');
        socketRef.current.off('user_typing');
        socketRef.current.off('user_stop_typing');
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('receive_message', (message) => {
        if (activeConversation && message.conversationId === activeConversation._id) {
          setMessages((prev) => [...prev, message]);
        }
        // Update last message in sidebar
        loadConversations();
      });

      socketRef.current.on('user_typing', ({ userName }) => {
        setTyping(userName);
      });

      socketRef.current.on('user_stop_typing', () => {
        setTyping(null);
      });
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
      setLoading(false);
      
      // If returning from another page with a specific chat ID
      const queryParams = new URLSearchParams(location.search);
      const chatId = queryParams.get('id');
      if (chatId && !activeConversation) {
        const chat = data.find(c => c._id === chatId);
        if (chat) handleSelectConversation(chat);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectConversation = async (conv) => {
    setActiveConversation(conv);
    setMessagesLoading(true);
    setTyping(null);
    try {
      const data = await fetchMessages(conv._id);
      setMessages(data);
      socketRef.current.emit('join_conversation', conv._id);
    } catch (err) {
      console.error(err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const receiverId = activeConversation.participants.find(p => p._id !== user.id)._id;

    socketRef.current.emit('send_message', {
      conversationId: activeConversation._id,
      receiverId,
      content: newMessage
    });

    socketRef.current.emit('stop_typing', { conversationId: activeConversation._id });
    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socketRef.current && activeConversation) {
      socketRef.current.emit('typing', { 
        conversationId: activeConversation._id, 
        userName: user.name 
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('stop_typing', { conversationId: activeConversation._id });
      }, 2000);
    }
  };

  const getOtherParticipant = (conv) => {
    return conv.participants.find(p => p._id !== user.id);
  };

  if (!user || loading) return (
    <div className="h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <h1 className="text-2xl font-black text-primary tracking-tighter">Messages</h1>
          <button onClick={() => navigate('/home')} className="p-2 hover:bg-slate-800 rounded-xl transition-all">
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative group">
            <Search className="absolute left-3 top-3 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="text-center py-20 px-6">
              <p className="text-slate-500 font-bold">No active chats.</p>
              <p className="text-xs text-slate-600 mt-2 lowercase">Chat is enabled after a job is accepted.</p>
            </div>
          ) : (
            conversations.map(conv => {
              const other = getOtherParticipant(conv);
              return (
                <button 
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-all border-b border-slate-800/50 ${activeConversation?._id === conv._id ? 'bg-slate-800 border-l-4 border-l-primary' : ''}`}
                >
                  <div className="relative shrink-0">
                    <div className="bg-primary/20 p-3 rounded-2xl">
                      <User size={24} className="text-primary" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-secondary rounded-full border-2 border-slate-900"></div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-bold truncate text-slate-200">{other.name}</h3>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate font-medium">
                      {conv.lastMessage.senderId === user.id ? 'You: ' : ''}{conv.lastMessage.text}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className={`flex-1 flex flex-col bg-slate-950 relative ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-700 p-10 select-none">
            <div className="bg-slate-900 p-10 rounded-full mb-6 border border-slate-800">
              <CheckCheck size={80} className="opacity-10" />
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-2">Your Workspace Chat</h2>
            <p className="font-bold text-slate-500">Pick a conversation to start collaborating.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-10 shadow-lg">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveConversation(null)} className="md:hidden p-2 hover:bg-slate-800 rounded-xl mr-2">
                  <ArrowLeft size={20} />
                </button>
                <div className="bg-primary/20 p-2.5 rounded-xl">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-slate-100 tracking-tight">{getOtherParticipant(activeConversation).name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary">
                    {typing ? 'Typing...' : 'Online'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed">
              {messagesLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.senderId === user.id;
                  return (
                    <div key={msg._id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-3xl shadow-xl shadow-slate-950/20 relative ${
                        isOwn 
                        ? 'bg-primary text-white rounded-br-none' 
                        : 'bg-slate-800 text-slate-200 rounded-bl-none'
                      }`}>
                        <p className="text-sm font-medium leading-relaxed mb-1">{msg.content}</p>
                        <div className={`flex items-center justify-end gap-1.5 text-[9px] font-bold uppercase tracking-tighter opacity-60`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isOwn && <CheckCheck size={12} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {typing && (
                <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="bg-slate-800/50 text-slate-400 px-4 py-2 rounded-2xl rounded-bl-none text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </span>
                    {typing} is typing
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-slate-900 border-t border-slate-800 shadow-[0_-10px_25px_rgba(0,0,0,0.5)] z-10">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-4xl mx-auto">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type your message..." 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-primary outline-none transition-all font-medium" 
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 shrink-0"
                >
                  <Send size={24} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;

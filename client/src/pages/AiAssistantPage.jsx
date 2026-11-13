import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import {
  BotMessageSquare,
  Send,
  Plus,
  Trash2,
  Sparkles,
  User,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const SUGGESTED_QUESTIONS = [
  'Why are the lower leaves of my crop turning pale yellow?',
  'What crops are most suitable for my soil and current weather?',
  'How often should I irrigate during hot dry conditions?',
  'What does a soil pH of 6.5 indicate for nutrient availability?',
  'How do I treat early signs of fungal leaf blight safely?',
];

export const AiAssistantPage = () => {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

  const [activeConversationId, setActiveConversationId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [chatPlotId, setChatPlotId] = useState('');

  // 1. Fetch conversations
  const { data: conversations, isLoading: convsLoading } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: async () => {
      const res = await api.getConversations();
      return res.data || [];
    },
  });

  // 2. Auto-select first conversation or handle active conversation
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  // 3. Fetch messages for active conversation
  const { data: messages, isLoading: msgsLoading } = useQuery({
    queryKey: ['chat-messages', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return [];
      const res = await api.getConversationMessages(activeConversationId);
      return res.data || [];
    },
    enabled: Boolean(activeConversationId),
  });

  // 4. Fetch plots for contextual filter
  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const res = await api.getPlots();
      return res.data || [];
    },
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create conversation mutation
  const createConvMutation = useMutation({
    mutationFn: () => api.createConversation({ title: 'New Advisory Session', language }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['chat-conversations']);
      setActiveConversationId(res.data.id);
    },
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (text) =>
      api.sendMessage(activeConversationId, {
        message: text,
        plot_id: chatPlotId || null,
        language,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-messages', activeConversationId]);
      queryClient.invalidateQueries(['chat-conversations']);
      setInputText('');
    },
  });

  // Delete conversation mutation
  const deleteConvMutation = useMutation({
    mutationFn: (id) => api.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-conversations']);
      setActiveConversationId(null);
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || sendMutation.isPending) return;

    if (!activeConversationId) {
      createConvMutation.mutate(undefined, {
        onSuccess: (res) => {
          api.sendMessage(res.data.id, {
            message: inputText.trim(),
            plot_id: chatPlotId || null,
            language,
          }).then(() => {
            queryClient.invalidateQueries(['chat-messages', res.data.id]);
            setInputText('');
          });
        },
      });
    } else {
      sendMutation.mutate(inputText.trim());
    }
  };

  const handlePromptClick = (question) => {
    setInputText(question);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-6">
      {/* Left: Conversation Sessions Drawer */}
      <div className="w-full lg:w-72 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col p-4 shrink-0">
        <button
          onClick={() => createConvMutation.mutate()}
          disabled={createConvMutation.isPending}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm text-xs transition flex items-center justify-center space-x-2 mb-3"
        >
          <Plus className="w-4 h-4" />
          <span>New Advisory Chat</span>
        </button>

        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
          Chat History
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {conversations?.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-semibold transition ${
                activeConversationId === conv.id
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <BotMessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{conv.title || 'Advisory Session'}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this chat session?')) {
                    deleteConvMutation.mutate(conv.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {(!conversations || conversations.length === 0) && (
            <div className="text-center py-6 text-slate-400 text-xs">
              No chat history yet.
            </div>
          )}
        </div>

        {/* Plot Context Selector */}
        {plots && plots.length > 0 && (
          <div className="pt-3 border-t border-slate-100 mt-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Contextual Plot
            </label>
            <select
              value={chatPlotId}
              onChange={(e) => setChatPlotId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="">All Farm Plots</option>
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plot_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Main Chat Pane */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="h-14 px-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-extrabold text-slate-800 text-sm">
              AgriPulse Kisan AI Assistant
            </h3>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
              (Google Gemini 2.5 • Context-Aware)
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg">
            Language: {language.toUpperCase()}
          </span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Welcome Card if no messages */}
          {(!messages || messages.length === 0) && (
            <div className="max-w-xl mx-auto py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-green-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Namaste! How can I assist your farm today?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ask about suitable crops, leaf chlorosis symptoms, soil acidity, weather-dependent irrigation, or safe organic fertilization in your preferred language.
              </p>

              <div className="pt-2 text-left space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Frequently Asked Questions
                </span>
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptClick(q)}
                    className="w-full text-left p-2.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-medium rounded-xl border border-slate-100 transition flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages?.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-slate-700'
                    : 'bg-gradient-to-tr from-emerald-600 to-green-500 shadow-sm'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                    : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200/80 shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Structured Metadata if present on assistant replies */}
                {msg.metadata && msg.role === 'assistant' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 space-y-2">
                    {msg.metadata.safety_notice && (
                      <div className="p-2 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 flex items-start space-x-1.5 text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{msg.metadata.safety_notice}</span>
                      </div>
                    )}

                    {msg.metadata.related_actions?.length > 0 && (
                      <div className="space-y-1">
                        <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block">
                          Recommended Next Steps:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.metadata.related_actions.map((act, ai) => (
                            <span
                              key={ai}
                              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold"
                            >
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <span
                  className={`block text-[10px] mt-1.5 ${
                    msg.role === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            </div>
          ))}

          {sendMutation.isPending && (
            <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <p>AgriPulse AI is formulating agricultural advice...</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask your agricultural question (in English, हिन्दी, ಕನ್ನಡ, etc.)..."
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sendMutation.isPending}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

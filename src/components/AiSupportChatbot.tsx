import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  MessageSquare,
  Send,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import {
  QUICK_CHAT_PROMPTS,
  createSafeDocId,
  formatWhatsAppUrl,
} from '../data/defaults';
import { recordChatExchange, submitRepairRequest } from '../lib/firebase';
import type {
  Accessory,
  ChatBookingDraft,
  ChatMessage,
  FaqItem,
  KnowledgeEntry,
  RepairService,
  ShopSettings,
} from '../types';

interface AiSupportChatbotProps {
  settings: ShopSettings;
  services: RepairService[];
  accessories: Accessory[];
  faqs: FaqItem[];
  knowledgeEntries: KnowledgeEntry[];
  onOpenBookingModal: (serviceName?: string) => void;
  externalOpenTrigger?: number;
}

function hasUrduScript(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function detectLanguageHint(text: string): string {
  if (hasUrduScript(text)) return 'urdu';
  const romanUrduSignals = /\b(mera|meri|mere|nahi|hai|hain|kya|kaise|kitna|bata|karna|chahiye|aap|bhai|shop|mobile ka)\b/i;
  if (romanUrduSignals.test(text)) return 'roman_urdu';
  return 'english';
}

export function AiSupportChatbot({
  settings,
  services,
  accessories,
  faqs,
  knowledgeEntries,
  onOpenBookingModal,
  externalOpenTrigger = 0,
}: AiSupportChatbotProps) {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => createSafeDocId('sess'));
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: settings.chatWelcomeMessage,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (externalOpenTrigger > 0) {
      setOpen(true);
    }
  }, [externalOpenTrigger]);

  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1 && prev[0].id === 'welcome'
        ? [{ ...prev[0], content: settings.chatWelcomeMessage }]
        : prev
    );
  }, [settings.chatWelcomeMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, open]);

  function handleClearChat() {
    setSessionId(createSafeDocId('sess'));
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: settings.chatWelcomeMessage,
        timestamp: Date.now(),
      },
    ]);
    setInput('');
  }

  async function sendMessage(rawText: string) {
    const trimmed = rawText.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    const historyPayload = messages
      .filter((m) => m.id !== 'welcome' && !m.error)
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          shopContext: {
            settings: {
              businessName: settings.businessName,
              locationAddress: settings.locationAddress,
              phoneNumber: settings.phoneNumber,
              whatsappNumber: settings.whatsappNumber,
              email: settings.email,
              openingHours: settings.openingHours,
              chatbotCustomInstructions: settings.chatbotCustomInstructions,
            },
            services: services.map((s) => ({
              name: s.name,
              category: s.category,
              priceLabel: s.priceLabel,
              isConfirmedAvailable: s.isConfirmedAvailable,
            })),
            accessories: accessories.map((a) => ({
              name: a.name,
              category: a.category,
              priceLabel: a.priceLabel,
              availabilityStatus: a.availabilityStatus,
            })),
            faqs: faqs
              .filter((f) => f.isPublished)
              .map((f) => ({ question: f.question, answer: f.answer })),
            knowledgeEntries: knowledgeEntries
              .filter((k) => k.isActive)
              .map((k) => ({ topic: k.topic, category: k.category, content: k.content })),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg: ChatMessage = {
          id: `e_${Date.now()}`,
          role: 'assistant',
          content:
            data?.error ||
            'Sorry, I could not connect right now. Please try again or use our Repair Request form.',
          timestamp: Date.now(),
          error: true,
          suggestBookingModal: true,
        };
        setMessages((prev) => [...prev, errMsg]);
        return;
      }

      let finalReply: string = data.reply || 'How else can I assist you today?';
      let createdTicketCode: string | undefined;

      if (data.bookingDraft) {
        const draft = data.bookingDraft as ChatBookingDraft;
        try {
          const saved = await submitRepairRequest({
            customerName: draft.customerName,
            contactInfo: draft.contactInfo,
            whatsappNumber: draft.whatsappNumber || '',
            phoneModel: draft.phoneModel,
            serviceName: draft.serviceName,
            problemDescription: draft.problemDescription,
            source: 'ai_chatbot',
          });
          createdTicketCode = saved.ticketCode;
          finalReply = `${finalReply}\n\nYour repair request has been recorded with reference ${saved.ticketCode}. HM Mobile will review your details and confirm pricing and timing directly.`;
        } catch {
          finalReply =
            'I gathered your repair details, but could not save the ticket automatically right now. Please use the Repair Request form button below so HM Mobile receives it right away.';
        }
      }

      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: finalReply,
        timestamp: Date.now(),
        bookingTicketCode: createdTicketCode,
        suggestWhatsApp: Boolean(data.suggestWhatsApp),
        suggestBookingModal: Boolean(data.suggestBookingModal) && !createdTicketCode,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      void recordChatExchange({
        sessionId,
        userMessage: trimmed,
        assistantReply: finalReply,
        languageHint: detectLanguageHint(trimmed),
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e_${Date.now()}`,
          role: 'assistant',
          content:
            'Network interruption while contacting HM Mobile support. Please retry in a moment or submit a repair request directly.',
          timestamp: Date.now(),
          error: true,
          suggestBookingModal: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  const whatsappDirectUrl = formatWhatsAppUrl(
    settings.whatsappNumber,
    `Assalam-o-Alaikum ${settings.businessName}, I would like assistance with my mobile phone.`
  );

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open ? (
        <div
          className="w-[calc(100vw-2rem)] sm:w-[400px] h-[min(600px,calc(100vh-5rem))] flex flex-col bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          role="dialog"
          aria-label="HM Mobile AI Customer Support"
        >
          {/* Chat Header */}
          <div className="px-4 py-3.5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold font-display truncate">
                {settings.businessName} Support
              </p>
              <p className="text-[11px] text-slate-300 truncate">
                English · اردو · Roman Urdu
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear conversation"
                aria-label="Clear conversation"
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close chat"
                aria-label="Close chat"
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Privacy Disclosure */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            {settings.chatDisclosureText}
          </div>

          {/* Message Stream */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#FAFAFA] dark:bg-[#0B0F17]"
          >
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isRtl = hasUrduScript(msg.content);
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className={`max-w-[86%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-blue-700 text-white'
                        : msg.error
                        ? 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200'
                        : 'bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.bookingTicketCode && (
                    <div className="mt-2 max-w-[86%] w-full p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                      <div>
                        <p className="font-semibold">
                          Ticket Saved: <span className="font-mono-tabular">{msg.bookingTicketCode}</span>
                        </p>
                        <p className="text-[11px] opacity-85">
                          Logged in HM Mobile Admin Queue for review.
                        </p>
                      </div>
                    </div>
                  )}

                  {!isUser && (msg.suggestWhatsApp || msg.suggestBookingModal) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.suggestBookingModal && (
                        <button
                          type="button"
                          onClick={() => onOpenBookingModal()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          Open Repair Request Form
                        </button>
                      )}
                      {msg.suggestWhatsApp && whatsappDirectUrl && (
                        <a
                          href={whatsappDirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Chat on WhatsApp
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {messages.length === 1 && !sending && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Suggested questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CHAT_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="text-left text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sending && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-700 dark:text-blue-400" />
                <span>HM Mobile assistant is typing...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-white dark:bg-[#131A26] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1500}
              disabled={sending}
              placeholder="Ask in English, Urdu, or Roman Urdu..."
              className="flex-1 min-w-0 px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="p-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white disabled:opacity-50 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open HM Mobile AI Support Chat"
          className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-lg transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm font-medium whitespace-nowrap">Ask HM Mobile</span>
        </button>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, AlertCircle } from "lucide-react";
import { apiClient as api } from "@/api-client/client";
import { Textarea } from "@workspace/ui/components/textarea";
import { useTranslations } from "next-intl";

type ChatMessage = {
  id: string;
  sender: "bot" | "user";
  text: string;
};

export function HelpChatbot({ mode, onComplete }: { mode: "order" | "general", onComplete: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("HelpCenter");

  // Initialize Chat Session
  useEffect(() => {
    let mounted = true;

    const startSession = async () => {
      try {
        setIsTyping(true);
        const res = await api.post("/chat/start");
        if (mounted && res.data.success) {
          setSessionId(res.data.sessionId);
          setMessages([
            {
              id: `bot_start_${Date.now()}`,
              sender: "bot",
              text: res.data.message,
            },
          ]);

          // If mode is "order", send an initial automated message
          if (mode === "order") {
            setTimeout(() => {
              if (mounted) handleSendInput("I need help with an order", res.data.sessionId, true);
            }, 800);
          }
        }
      } catch (error) {
        if (mounted) {
          setMessages([
            { id: "bot_err", sender: "bot", text: t('unableToConnect') }
          ]);
        }
      } finally {
        if (mounted) setIsTyping(false);
      }
    };

    startSession();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendInput = async (overrideText?: string, activeSessionId?: string, isHiddenQuery = false) => {
    const textToSend = overrideText || inputText;
    const currentSessionId = activeSessionId || sessionId;
    
    if (!textToSend.trim() || !currentSessionId) return;
    
    if (!overrideText) {
      setInputText("");
    }

    if (!isHiddenQuery) {
      setMessages((prev) => [...prev, { id: `user_${Date.now()}`, sender: "user", text: textToSend }]);
    }
    
    setIsTyping(true);

    try {
      const res = await api.post("/chat/message", {
        sessionId: currentSessionId,
        message: textToSend,
      });

      if (res.data.success && res.data.responses) {
        // Stagger bot responses for realism
        res.data.responses.forEach((respText: string, index: number) => {
          setTimeout(() => {
            setMessages((prev) => [...prev, { id: `bot_${Date.now()}_${index}`, sender: "bot", text: respText }]);
            if (index === res.data.responses.length - 1) {
              setIsTyping(false);
            }
          }, index * 800 + 400); // 400ms delay per message
        });
      } else {
        setIsTyping(false);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { id: `bot_err_${Date.now()}`, sender: "bot", text: t('sorryError') }]);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 pb-28 scroll-smooth"
      >
        <div className="flex flex-col gap-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                layout
                className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                  {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div
                  className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground ltr:rounded-tr-sm rtl:rounded-tl-sm"
                      : "bg-secondary text-secondary-foreground ltr:rounded-tl-sm rtl:rounded-tr-sm"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div 
                key="typing"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-3 flex-row"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-secondary px-4 py-5 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-xl p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg z-10">
        <div className="flex items-end gap-3 max-w-full">
          <div className="flex-1 rounded-3xl bg-secondary/70 focus-within:bg-secondary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={sessionId ? t('typeMessage') : t('connecting')}
              disabled={!sessionId || isTyping}
              className="w-full resize-none bg-transparent px-5 py-4 text-[15px] outline-none min-h-[56px] max-h-32 border-0 focus-visible:ring-0 placeholder:text-muted-foreground/70"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendInput();
                }
              }}
            />
          </div>
          <button
            onClick={() => handleSendInput()}
            disabled={!inputText.trim() || !sessionId || isTyping}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 transition-all hover:scale-105 active:scale-95 shadow-md rtl:-scale-x-100"
          >
            <Send className="h-5 w-5 ml-1 rtl:mr-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

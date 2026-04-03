'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Bot, X, Send, Loader2, Sparkles, RotateCcw, Copy, Check } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface Message {
  role: 'user' | 'model';
  content: string;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative my-2 rounded-xl overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 text-xs text-gray-400">
        <span>code</span>
        <button onClick={copy} className="flex items-center gap-1 hover:text-white transition-colors">
          {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="bg-gray-950 text-green-300 text-xs p-3 overflow-x-auto font-mono leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';

  // Parse content — split by code blocks
  const parts = msg.content.split(/(```[\s\S]*?```)/g);

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 mt-1">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm'
            : 'bg-muted rounded-tl-sm'
        }`}>
          {parts.map((part, i) => {
            if (part.startsWith('```')) {
              const code = part.replace(/^```\w*\n?/, '').replace(/```$/, '');
              return <CodeBlock key={i} code={code} />;
            }
            // Render **bold** and `inline code`
            const formatted = part
              .split(/(`[^`]+`)/g)
              .map((chunk, j) => {
                if (chunk.startsWith('`') && chunk.endsWith('`')) {
                  return <code key={j} className="bg-black/20 px-1 py-0.5 rounded text-xs font-mono">{chunk.slice(1, -1)}</code>;
                }
                return chunk.split('\n').map((line, k) => (
                  <span key={k}>{line}{k < chunk.split('\n').length - 1 && <br />}</span>
                ));
              });
            return <span key={i}>{formatted}</span>;
          })}
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  'What is a closure in JavaScript?',
  'Explain recursion with an example',
  'What is the difference between == and ===?',
  'How does async/await work?',
  'What is Big O notation?',
  'Explain OOP concepts',
];

export function AIDoubtBot() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Detect context from current page
  const getContext = () => {
    if (pathname.includes('/languages/')) {
      const slug = pathname.split('/languages/')[1];
      return `${slug} programming language`;
    }
    if (pathname.includes('/career-paths')) return 'career paths in tech';
    if (pathname.includes('/databases')) return 'databases';
    return 'programming and technology';
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, messages]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const newMessages: Message[] = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, context: getContext() }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I could not get a response. Please try again.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'model', content: 'Connection error. Please check your internet and try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const reset = () => setMessages([]);

  if (!user) return null;

  return (
    <>
      {/* Floating button — positioned left of the group chat button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-24 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-110 transition-all duration-200 flex items-center justify-center"
        aria-label="AI Doubt Bot"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-24 z-50 w-[360px] h-[540px] rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-card shadow-2xl shadow-cyan-500/20 flex flex-col overflow-hidden animate-scale-in">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">AI Tutor</p>
                <p className="text-xs text-white/70">Ask any doubt • Powered by Gemini</p>
              </div>
            </div>
            <button onClick={reset} className="text-white/70 hover:text-white transition-colors" title="Clear chat">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2.5 text-sm max-w-[85%]">
                    Hi! I'm your AI tutor 👋 Ask me anything about programming, concepts, or code. I'm here to help you learn!
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">Try asking:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => send(s)}
                      className="text-xs px-2.5 py-1.5 rounded-full border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:border-cyan-400 transition-colors text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2.5 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-600" />
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-1 shrink-0 border-t">
            <div className="flex gap-2 items-end mt-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask your doubt... (Enter to send)"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none rounded-xl border border-cyan-200 dark:border-cyan-800 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 leading-relaxed max-h-24 overflow-y-auto disabled:opacity-50"
                style={{ minHeight: '42px' }}
              />
              <Button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                size="icon"
                className="rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 shrink-0 h-[42px] w-[42px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

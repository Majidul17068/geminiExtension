import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, Loader2, LogOut, MessageSquare, FileText, MousePointer2 } from 'lucide-react';
import LoginPage from './LoginPage';

const API_KEY = import.meta.env.VITE_API_KEY;
const client = new GoogleGenAI({ apiKey: API_KEY });

// --- Tool Definitions ---
const tools: any[] = [
  {
    name: "getPageContent",
    description: "Get the text content of the current webpage to understand what is on it.",
    parameters: { type: "OBJECT", properties: {} }
  },
  {
    name: "clickElement",
    description: "Click an element on the page using a CSS selector. Use this to navigate, submit forms, or interact with buttons.",
    parameters: {
      type: "OBJECT",
      required: ["selector"],
      properties: {
        selector: { type: "STRING", description: "The CSS selector of the element to click (e.g., 'button[type=submit]', '#search-btn').", nullable: false }
      }
    }
  },
  {
    name: "typeInElement",
    description: "Type text into an input field or text area identified by a CSS selector.",
    parameters: {
      type: "OBJECT",
      required: ["selector", "text"],
      properties: {
        selector: { type: "STRING", description: "The CSS selector of the input element.", nullable: false },
        text: { type: "STRING", description: "The text to type.", nullable: false }
      }
    }
  },
  {
    name: "scrollPage",
    description: "Scroll the page down to see more content.",
    parameters: { type: "OBJECT", properties: {} }
  }
];

// --- Scripting Helpers ---
async function executeScriptInTab(func: (...args: any[]) => any, args: any[] = []) {
  if (typeof chrome === 'undefined' || !chrome.tabs) return "Chrome API not available";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab found");

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: func,
    args: args
  });

  return results[0]?.result;
}

// Browser Action Scripts (run inside the page)
const browserActions = {
  getPageContent: () => document.body.innerText.substring(0, 10000),
  clickElement: (selector: string) => {
    const el = document.querySelector(selector) as HTMLElement;
    if (el) { el.click(); return `Clicked ${selector}`; }
    return `Element ${selector} not found`;
  },
  typeInElement: (selector: string, text: string) => {
    const el = document.querySelector(selector) as HTMLInputElement;
    if (el) { el.value = text; el.dispatchEvent(new Event('input', { bubbles: true })); return `Typed "${text}" into ${selector}`; }
    return `Element ${selector} not found`;
  },
  scrollPage: () => { window.scrollBy(0, 500); return "Scrolled down"; }
};

interface UserProfile {
  email: string;
  id: string;
}

type Mode = 'chat' | 'context' | 'action';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [mode, setMode] = useState<Mode>('chat');

  // Chat State
  const [messages, setMessages] = useState([{ role: 'system', text: 'I am ready. I can read this page, click buttons, and type for you.' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modeDescriptions: Record<Mode, string> = {
    chat: 'Just chat with the assistant about anything you like.',
    context: 'Ask for summaries, explanations, or answers from this page.',
    action: 'Request actions like clicking, typing, or navigating for you.'
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    if (typeof chrome === 'undefined' || !chrome.identity) {
      setIsLoadingAuth(false);
      return;
    }

    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError || !token) {
        setUser(null);
      } else {
        fetchUserProfile(token);
      }
      setIsLoadingAuth(false);
    });
  };

  const handleLogin = () => {
    setIsLoadingAuth(true);

    // 1. Try Real Login
    if (typeof chrome !== 'undefined' && chrome.identity) {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError || !token) {
          console.warn("Real login failed, falling back to Dev Mode:", chrome.runtime.lastError);
          // Fallback to Mock User
          setUser({ email: 'dev_user@example.com', id: 'dev-123' });
          setIsLoadingAuth(false);
        } else {
          fetchUserProfile(token);
        }
      });
    } else {
      // Dev Env fallback
      setTimeout(() => {
        setUser({ email: 'local_dev@example.com', id: 'local-123' });
        setIsLoadingAuth(false);
      }, 800);
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUser({ email: data.email, id: data.id });
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      // Fallback even on fetch error to ensure entry
      setUser({ email: 'user@example.com', id: 'fallback-123' });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    if (typeof chrome !== 'undefined' && chrome.identity) {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (token) {
          chrome.identity.removeCachedAuthToken({ token }, () => {
            setUser(null);
          });
        }
      });
    }
    setUser(null);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      // Prompt Engineering based on Mode
      let systemPrompt = "";
      if (mode === 'chat') systemPrompt = "You are in Chat Mode. Focus on clear, helpful conversation. ";
      if (mode === 'context') systemPrompt = "You are in Context Mode. Prioritize reading the page content and answering questions about it. ";
      if (mode === 'action') systemPrompt = "You are in Action Mode. Prioritize using tools to click, type, and navigate. ";

      const fullPrompt = systemPrompt + userText;

      // 1. Send User Input to Gemini with Tools
      const response = await client.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config: {
          tools: [{ functionDeclarations: tools }]
        }
      });

      // 2. Handle Function Calls
      // @ts-ignore
      const calls = response.functionCalls;

      if (calls && calls.length > 0) {
        for (const call of calls) {
          setMessages(prev => [...prev, { role: 'model', text: `🛠️ Executing: ${call.name}...` }]);

          const args = call.args || {};
          let actionResult: any = "Unknown action";

          if (call.name === 'getPageContent') actionResult = await executeScriptInTab(browserActions.getPageContent);
          else if (call.name === 'clickElement') actionResult = await executeScriptInTab(browserActions.clickElement, [args.selector]);
          else if (call.name === 'typeInElement') actionResult = await executeScriptInTab(browserActions.typeInElement, [args.selector, args.text]);
          else if (call.name === 'scrollPage') actionResult = await executeScriptInTab(browserActions.scrollPage);

          setMessages(prev => [...prev, { role: 'model', text: `✅ Result: ${actionResult}` }]);
        }
      } else {
        // Normal Text Response
        // @ts-ignore
        setMessages(prev => [...prev, { role: 'model', text: response.text() }]);
      }

    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "Error: " + e.message }]);
    }
    setIsTyping(false);
  };

  if (!user && !isLoadingAuth && typeof chrome === 'undefined') {
    return <LoginPage onLogin={handleLogin} isLoading={isLoadingAuth} />;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} isLoading={isLoadingAuth} />;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bot className="w-6 h-6 text-blue-400" />
          <h1>Gemini Agent</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user.email}</span>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="mode-switcher">
        <button
          className={`mode-btn ${mode === 'chat' ? 'active' : ''}`}
          onClick={() => setMode('chat')}
        >
          <MessageSquare size={14} /> Chat
        </button>
        <button
          className={`mode-btn ${mode === 'context' ? 'active' : ''}`}
          onClick={() => setMode('context')}
        >
          <FileText size={14} /> Context
        </button>
        <button
          className={`mode-btn ${mode === 'action' ? 'active' : ''}`}
          onClick={() => setMode('action')}
        >
          <MousePointer2 size={14} /> Action
        </button>
      </div>
      <div className="mode-description">{modeDescriptions[mode]}</div>

      {/* Chat Area */}
      <div className="chat-container">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            {m.text}
          </div>
        ))}
        {isTyping && (
          <div className="loading-dots ml-4">
            <div className="dot"></div><div className="dot"></div><div className="dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <input
          className="input-field"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`[${mode.toUpperCase()}] Type command...`}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={!input.trim() || isTyping} className="send-btn">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

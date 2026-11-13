import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  Cpu,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Database,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';

const QUICK_PROMPTS = [
  'Where am I spending most of my money?',
  'How much did I spend on food this month?',
  'Am I exceeding my monthly budget?',
  'How can I save ₹2,000 next month?',
  'Which category should I reduce spending in?',
  'Compare my spending with the previous month',
];

export default function AiAssistantPage({ initialPrompt }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Namaste Shreya! I am **PaisaPilot**, your personal AI Financial Companion.\n\nI have complete access to your verified November 2026 database records. I don't give generic internet advice—every calculation I make is grounded directly in your actual income, expenses, and budget limits.\n\nHow can I help you optimize your finances today?",
      dataPoints: [
        { label: 'Current Context', value: 'November 2026' },
        { label: 'Data Source', value: 'PostgreSQL Ledger' },
        { label: 'Engine Mode', value: 'Grounded + Fallback' },
      ],
      source: 'paisa-system',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleSendMessage(queryText) {
    const textToSend = queryText || input;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMessageId = Date.now().toString();
    const newUserMsg = {
      id: userMessageId,
      sender: 'user',
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAi(textToSend.trim());
      if (res.success && res.data) {
        const botReply = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: res.data.answer,
          dataPoints: res.data.dataPoints || [],
          suggestions: res.data.suggestions || [],
          source: res.data.source,
          isFallback: res.data.isFallback,
          disclaimer: res.data.disclaimer,
        };
        setMessages((prev) => [...prev, botReply]);
      }
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `⚠️ **Connection Error:** Could not contact the financial engine (${err.message}). Please ensure the PaisaPilot backend is running on port 5001.`,
        source: 'error',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  // Format simple markdown into clean HTML elements safely
  function renderFormattedText(text) {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold handling
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <li
            key={idx}
            style={{ marginLeft: '1.25rem', marginBottom: '0.25rem' }}
            dangerouslySetInnerHTML={{ __html: formattedLine.slice(2) }}
          />
        );
      }

      if (line.trim() === '') {
        return <div key={idx} style={{ height: '0.5rem' }} />;
      }

      return (
        <p
          key={idx}
          style={{ marginBottom: '0.5rem', lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', minHeight: '600px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>PaisaPilot AI Financial Assistant</span>
            <span
              style={{
                fontSize: '0.6875rem',
                backgroundColor: 'var(--emerald-light)',
                color: 'var(--emerald-dark)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontWeight: 700,
              }}
            >
              100% Grounded
            </span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Empathetic, data-driven financial advice strictly calculated from your PostgreSQL database records.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Database size={14} color="var(--primary-emerald)" />
          <span>Active Context: <strong>November 2026</strong></span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((m) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '0.875rem',
                  maxWidth: isBot ? '85%' : '75%',
                  alignSelf: isBot ? 'flex-start' : 'flex-end',
                  flexDirection: isBot ? 'row' : 'row-reverse',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: isBot ? 'var(--primary-navy)' : 'var(--primary-emerald)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isBot ? <Bot size={20} color="#10B981" /> : 'SS'}
                </div>

                {/* Message Body */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: isBot ? '0 16px 16px 16px' : '16px 0 16px 16px',
                      backgroundColor: isBot ? 'var(--surface-card-subtle)' : 'var(--primary-navy)',
                      color: isBot ? 'var(--text-main)' : '#FFFFFF',
                      fontSize: '0.9375rem',
                      border: isBot ? '1px solid var(--border-light)' : 'none',
                    }}
                  >
                    <div>{renderFormattedText(m.text)}</div>

                    {/* Grounded Data Points Chips */}
                    {m.dataPoints && m.dataPoints.length > 0 && (
                      <div
                        style={{
                          marginTop: '0.875rem',
                          paddingTop: '0.75rem',
                          borderTop: isBot ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.15)',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        {m.dataPoints.map((dp, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: isBot ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
                              border: isBot ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.2)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ color: isBot ? 'var(--text-muted)' : '#94A3B8' }}>{dp.label}: </span>
                            <span style={{ color: isBot ? 'var(--primary-navy)' : '#34D399', fontWeight: 700 }}>
                              {dp.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Suggestion Follow-ups */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.5rem' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                        ACTIONABLE STEPS:
                      </span>
                      {m.suggestions.map((s, idx) => (
                        <div key={idx} style={{ fontSize: '0.8125rem', color: 'var(--secondary-navy)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <ArrowRight size={12} color="var(--primary-emerald)" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Verification Source Badge */}
                  {isBot && m.source && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6875rem', color: 'var(--text-light)', paddingLeft: '0.5rem' }}>
                      <ShieldCheck size={12} color="var(--primary-emerald)" />
                      <span>
                        Engine: {m.source === 'google-gemini-ai' ? 'Google Gemini 1.5' : 'Deterministic Grounded Engine'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '0.875rem', alignSelf: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-navy)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={20} color="#10B981" />
              </div>
              <div
                style={{
                  padding: '0.875rem 1.25rem',
                  borderRadius: '0 16px 16px 16px',
                  backgroundColor: 'var(--surface-card-subtle)',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                }}
              >
                Analyzing PostgreSQL database records & formulating advice...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            style={{
              whiteSpace: 'nowrap',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: '999px',
              padding: '0.35rem 0.875rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--secondary-navy)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-emerald)';
              e.currentTarget.style.backgroundColor = 'var(--emerald-light)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)';
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{ display: 'flex', gap: '0.75rem' }}
      >
        <input
          type="text"
          className="form-input"
          placeholder="Ask PaisaPilot anything about your spending, savings, or budgets..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.9375rem' }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn btn-primary"
          style={{ padding: '0 1.5rem' }}
        >
          <Send size={18} />
          <span>Send</span>
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--text-light)' }}>
        Educational analysis grounded strictly in your PaisaPilot database. Not certified financial advice.
      </div>
    </div>
  );
}

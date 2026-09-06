

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Bot,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  HeartPulse,
  HelpCircle,
  Info,
  Loader2,
  LogOut,
  Phone,
  Pill,
  Send,
  Settings,
  ShieldAlert,
  Sparkles,
  Store,
  Stethoscope,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

import logoImg from '../../assets/Aidfidelis logo background.png';
import { User } from '../../types';
import {
  aiBackendService,
  CompletedSymptomResponse,
  SymptomAnalysisResponse,
} from '../../services/aiBackendService';

interface SymptomCheckerProps {
  user: User;
  cartItemsCount?: number;
  onLogout: () => void;
}

interface FollowUpAnswer {
  question: string;
  answer: string;
}

type ChatMessage =
  | {
      id: string;
      sender: 'user' | 'assistant';
      type: 'text';
      text: string;
    }
  | {
      id: string;
      sender: 'assistant';
      type: 'questions';
      message: string;
      questions: FollowUpAnswer[];
    }
  | {
      id: string;
      sender: 'assistant';
      type: 'analysis';
      analysis: CompletedSymptomResponse;
    }
  | {
      id: string;
      sender: 'assistant';
      type: 'urgent';
      text: string;
    };

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Small UX delay so very fast backend responses (such as greetings)
// still feel like a live assistant instead of appearing instantly.
const MIN_ASSISTANT_RESPONSE_MS = 450;

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) =>
    window.setTimeout(resolve, milliseconds)
  );

const waitForNaturalResponseTime = async (
  startedAt: number,
  minimumMs = MIN_ASSISTANT_RESPONSE_MS
) => {
  const elapsed = performance.now() - startedAt;
  const remaining = minimumMs - elapsed;

  if (remaining > 0) {
    await sleep(remaining);
  }
};

interface TypewriterTextProps {
  text: string;
  speedMs?: number;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speedMs = 38,
}) => {
  const [visibleText, setVisibleText] = useState('');

  useEffect(() => {
    setVisibleText('');

    if (!text) {
      return;
    }

    let currentIndex = 0;

    const typeNextChunk = () => {
      // Reveal a few characters at a time so the response feels streamed,
      // similar to a live AI chat response rather than re-rendering words.
      const remaining = text.length - currentIndex;
      const chunkSize =
        remaining > 80 ? 3 :
        remaining > 30 ? 2 :
        1;

      currentIndex = Math.min(
        currentIndex + chunkSize,
        text.length
      );

      setVisibleText(text.slice(0, currentIndex));

      if (currentIndex < text.length) {
        const lastVisibleCharacter =
          text[currentIndex - 1] ?? '';

        const punctuationPause =
          lastVisibleCharacter === '.' ||
          lastVisibleCharacter === '!' ||
          lastVisibleCharacter === '?'
            ? 180
            : lastVisibleCharacter === ',' ||
              lastVisibleCharacter === ';' ||
              lastVisibleCharacter === ':'
            ? 90
            : 0;

        window.setTimeout(
          typeNextChunk,
          speedMs + punctuationPause
        );
      }
    };

    const startTimer = window.setTimeout(
      typeNextChunk,
      80
    );

    return () => {
      window.clearTimeout(startTimer);
    };
  }, [text, speedMs]);

  return (
    <>
      {visibleText}
      {visibleText.length < text.length && (
        <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-violet-400 align-middle" />
      )}
    </>
  );
};


interface AidFidelisRobotProps {
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

const AidFidelisRobot: React.FC<AidFidelisRobotProps> = ({
  size = 'md',
  active = false,
}) => {
  const dimensions =
    size === 'lg'
      ? 'h-20 w-20'
      : size === 'sm'
      ? 'h-9 w-9'
      : 'h-12 w-12';

  return (
    <div
      className={`relative ${dimensions} shrink-0`}
      aria-label="AidFidelis AI assistant"
    >
      <div
        className={`absolute inset-0 rounded-[28%] bg-violet-400/20 blur-xl ${
          active ? 'animate-pulse' : ''
        }`}
      />

      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[28%] border border-violet-400/30 bg-gradient-to-br from-violet-400 via-indigo-500 to-sky-600 shadow-[0_12px_35px_rgba(16,185,129,0.28)]">
        <div className="absolute inset-[3px] rounded-[24%] bg-slate-950/90" />

        <div className="relative flex h-[68%] w-[72%] flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800 to-slate-950 shadow-inner">
          <div className="mb-1.5 flex gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(110,231,183,0.9)] ${
                active ? 'animate-pulse' : ''
              }`}
            />
            <span
              className={`h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(110,231,183,0.9)] ${
                active ? 'animate-pulse' : ''
              }`}
            />
          </div>

          <div className="h-1 w-7 rounded-full bg-violet-400/60" />
        </div>

        <span className="absolute -right-0.5 top-1/2 h-3 w-1.5 -translate-y-1/2 rounded-full bg-sky-300/80" />
        <span className="absolute -left-0.5 top-1/2 h-3 w-1.5 -translate-y-1/2 rounded-full bg-sky-300/80" />
      </div>

      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-900 bg-violet-400">
        <Sparkles className="h-2.5 w-2.5 text-slate-950" />
      </div>
    </div>
  );
};

const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  user,
  onLogout,
}) => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [input, setInput] = useState('');
  const [initialSymptoms, setInitialSymptoms] = useState('');
  const [pendingQuestions, setPendingQuestions] =
    useState<FollowUpAnswer[]>([]);
  const [followUpHistory, setFollowUpHistory] =
    useState<FollowUpAnswer[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamStatus, setStreamStatus] = useState('');
  const [error, setError] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createId(),
      sender: 'assistant',
      type: 'text',
      text: 'Hi! I’m AidFidelis, your AI health assistant. Tell me what you’re experiencing, and I’ll guide you through it.',
    },
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, isAnalyzing, error]);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await onLogout();
  };

  const appendMessage = (message: ChatMessage) => {
    setMessages((current) => [...current, message]);
  };

  const useQuickPrompt = (prompt: string) => {
    setInput(prompt);

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const clearConversation = () => {
    setInput('');
    setInitialSymptoms('');
    setPendingQuestions([]);
    setFollowUpHistory([]);
    setStreamStatus('');
    setError('');
    setIsAnalyzing(false);
    setMessages([
      {
        id: createId(),
        sender: 'assistant',
        type: 'text',
        text: 'Hi! I’m AidFidelis, your AI health assistant. Tell me what you’re experiencing, and I’ll guide you through it.',
      },
    ]);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const updateFollowUpAnswer = (
    index: number,
    answer: string
  ) => {
    setPendingQuestions((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              answer,
            }
          : item
      )
    );

    setMessages((current) =>
      current.map((message) => {
        if (message.type !== 'questions') {
          return message;
        }

        return {
          ...message,
          questions: message.questions.map((item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  answer,
                }
              : item
          ),
        };
      })
    );
  };

  const handleBackendResponse = (
    response: SymptomAnalysisResponse,
    submittedMessage?: string
  ) => {
    if (response.status === 'conversation') {
      appendMessage({
        id: createId(),
        sender: 'assistant',
        type: 'text',
        text: response.message,
      });
      return;
    }

    if (response.status === 'needs_more_information') {
      const questions = response.questions.map(
        (question: string) => ({
          question,
          answer: '',
        })
      );

      if (submittedMessage && !initialSymptoms) {
        setInitialSymptoms(submittedMessage);
      }

      setPendingQuestions(questions);

      appendMessage({
        id: createId(),
        sender: 'assistant',
        type: 'questions',
        message: response.message,
        questions,
      });
      return;
    }

    if (response.status === 'urgent_attention') {
      setInitialSymptoms('');
      setPendingQuestions([]);
      setFollowUpHistory([]);

      appendMessage({
        id: createId(),
        sender: 'assistant',
        type: 'urgent',
        text: response.message,
      });
      return;
    }

    if (response.status === 'unable_to_predict') {
      setInitialSymptoms('');
      setPendingQuestions([]);
      setFollowUpHistory([]);

      appendMessage({
        id: createId(),
        sender: 'assistant',
        type: 'text',
        text: response.message,
      });
      return;
    }

    if (response.status === 'completed') {
      setInitialSymptoms('');
      setPendingQuestions([]);
      setFollowUpHistory([]);

      appendMessage({
        id: createId(),
        sender: 'assistant',
        type: 'analysis',
        analysis: response,
      });
    }
  };

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || isAnalyzing) {
      return;
    }

    setError('');
    setInput('');
    setFollowUpHistory([]);

    appendMessage({
      id: createId(),
      sender: 'user',
      type: 'text',
      text: message,
    });

    setIsAnalyzing(true);
    setStreamStatus('AidFidelis is reading your message...');

    const responseStartedAt = performance.now();

    try {
      const response = await aiBackendService.analyzeSymptomsStream(
        {
          symptoms: message,
          age: null,
          sex: null,
          duration: null,
          previousAnswers: [],
        },
        {
          onStatus: (status) => {
            setStreamStatus(status.message);
          },
          onError: (streamError) => {
            console.error(
              'AidFidelis streaming error:',
              streamError
            );
          },
        }
      );

      // Greetings and simple conversational replies can return from
      // FastAPI almost instantly. Keep the live status visible briefly
      // so the interaction feels natural.
      await waitForNaturalResponseTime(responseStartedAt);

      setStreamStatus('');
      handleBackendResponse(response, message);
    } catch (requestError) {
      console.error(
        'AidFidelis symptom checker request failed:',
        requestError
      );

      const friendlyMessage =
        requestError instanceof Error &&
        requestError.message.includes('No internet connection')
          ? 'No internet connection. Please check your connection and try again.'
          : requestError instanceof Error &&
              requestError.message.includes('AidFidelis is temporarily unavailable')
            ? 'AidFidelis is temporarily unavailable. Please try again in a moment.'
            : 'AidFidelis is temporarily unavailable right now. Please check your connection and try again.';

      setStreamStatus('No internet connection. Please check your connection and try again.');
      setError(friendlyMessage);
    } finally {
      setStreamStatus('');
      setIsAnalyzing(false);
    }
  };

  const submitFollowUpAnswers = async () => {
    if (isAnalyzing || pendingQuestions.length === 0) {
      return;
    }

    if (
      pendingQuestions.some((item) => !item.answer.trim())
    ) {
      setError(
        'Please answer all follow-up questions before continuing.'
      );
      return;
    }

    setError('');

    const answerSummary = pendingQuestions
      .map(
        (item) => `${item.question}\n${item.answer.trim()}`
      )
      .join('\n\n');

    appendMessage({
      id: createId(),
      sender: 'user',
      type: 'text',
      text: answerSummary,
    });

    setIsAnalyzing(true);

    const completedThisRound = pendingQuestions.map((item) => ({
      question: item.question,
      answer: item.answer.trim(),
    }));

    const accumulatedHistory = [
      ...followUpHistory,
      ...completedThisRound,
    ];

    setFollowUpHistory(accumulatedHistory);

    setStreamStatus('Reviewing your follow-up answers...');

    const followUpStartedAt = performance.now();

    try {
      const response = await aiBackendService.analyzeSymptomsStream(
        {
          symptoms: initialSymptoms,
          age: null,
          sex: null,
          duration: null,
          previousAnswers: accumulatedHistory.map(
            (item) =>
              `Question: ${item.question}\nAnswer: ${item.answer}`
          ),
        },
        {
          onStatus: (status) => {
            setStreamStatus(status.message);
          },
          onError: (streamError) => {
            console.error(
              'AidFidelis follow-up streaming error:',
              streamError
            );
          },
        }
      );

      await waitForNaturalResponseTime(
        followUpStartedAt,
        1000
      );

      setStreamStatus('');
      handleBackendResponse(response);
    } catch (requestError) {
      console.error(
        'AidFidelis follow-up request failed:',
        requestError
      );

      const friendlyMessage =
        requestError instanceof Error &&
        requestError.message.includes('No internet connection')
          ? 'No internet connection. Please check your connection and try again.'
          : requestError instanceof Error &&
              requestError.message.includes('AidFidelis is temporarily unavailable')
            ? 'AidFidelis is temporarily unavailable. Please try again in a moment.'
            : 'AidFidelis is temporarily unavailable right now. Please check your connection and try again.';

      setStreamStatus('No internet connection. Please check your connection and try again.');
      setError(friendlyMessage);
    } finally {
      setStreamStatus('');
      setIsAnalyzing(false);
    }
  };

  const getSeverity = (
    result: CompletedSymptomResponse
  ): 'low' | 'medium' | 'high' => {
    if (result.confidenceAssessment.level === 'higher') {
      return 'low';
    }

    if (result.confidenceAssessment.level === 'uncertain') {
      return 'medium';
    }

    return 'high';
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'low':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <ShieldAlert className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#07111f] font-sans text-slate-100 antialiased">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[12%] -top-[22%] h-[72%] w-[55%] rounded-full bg-violet-500/15 blur-[135px]" />
        <div className="absolute -left-[12%] top-[35%] h-[65%] w-[45%] rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="absolute bottom-[-20%] left-[35%] h-[45%] w-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:42px_42px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07111f]/20 to-[#07111f]/80" />
      </div>

      <nav className="relative z-50 flex h-20 items-center justify-between border-b border-white/10 bg-slate-900/60 px-4 shadow-lg backdrop-blur-xl lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-white/5 bg-white/5 p-2.5 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="group flex items-center space-x-3"
            onClick={() => navigate('/pharmacies')}
          >
            <div className="rounded-xl bg-white p-1 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <img
                src={logoImg}
                alt="AidFidelis"
                className="h-10 w-10 object-contain"
              />
            </div>

            <div className="hidden flex-col text-left md:flex">
              <span className="text-xl font-extrabold tracking-tight text-white">
                AidFidelis
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                Health Assistant
              </span>
            </div>
          </button>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((open) => !open)}
            className="flex items-center space-x-3 rounded-full border border-white/10 bg-white/5 p-1.5 pr-4 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-600 bg-slate-800">
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="h-5 w-5 text-violet-400" />
              )}
            </div>

            <span className="hidden text-sm font-bold sm:block">
              {user?.name
                ? user.name.split(' ')[0]
                : 'Account'}
            </span>

            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isUserMenuOpen
                  ? 'rotate-180 text-violet-400'
                  : 'text-slate-400'
              }`}
            />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 z-50 mt-3 w-64 rounded-2xl border border-white/10 bg-slate-800/95 py-2 shadow-2xl backdrop-blur-xl">
              <div className="rounded-t-2xl border-b border-white/5 bg-white/5 px-5 py-4">
                <p className="truncate text-sm font-bold text-white">
                  {user?.name || 'Guest User'}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {user?.email || 'No email linked'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-violet-400"
              >
                <Settings className="h-4 w-4" />
                Account Settings
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-semibold text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden px-4 py-6 sm:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <AidFidelisRobot size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-white">
                  AidFidelis Health Assistant
                </h1>
                <span className="hidden items-center gap-1 rounded-full border border-violet-400/20 bg-violet-400/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-violet-300 sm:inline-flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                  AI Online
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Describe your symptoms naturally. AidFidelis will guide the assessment step by step.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearConversation}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
            Clear Chat
          </button>
        </div>

        <section className="relative flex-1 overflow-y-auto rounded-[28px] border border-white/10 bg-slate-950/35 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-violet-400/[0.04] to-transparent" />

          <div className="relative space-y-5">
            {messages.length === 1 && (
              <div className="mb-7 overflow-hidden rounded-[28px] border border-violet-400/15 bg-gradient-to-br from-violet-400/[0.09] via-slate-900/75 to-sky-400/[0.05] p-5 sm:p-7">
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                  <div className="flex shrink-0 justify-center md:block">
                    <AidFidelisRobot size="lg" active />
                  </div>

                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                        AidFidelis AI
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                        <ShieldAlert className="h-3 w-3 text-sky-300" />
                        Health guidance, not a diagnosis
                      </span>
                    </div>

                    <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                      Hi{user?.name ? `, ${user.name.split(' ')[0]}` : ''}. How are you feeling today?
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                      Tell me what you are experiencing in your own words. I may ask a few follow-up questions before showing possible conditions and next steps.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {[
                        'I have fever and headache',
                        'I have a cough and sore throat',
                        'I have stomach pain',
                        'I feel dizzy and weak',
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => useQuickPrompt(prompt)}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-violet-200"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => {
              if (message.type === 'analysis') {
                return (
                  <AnalysisBubble
                    key={message.id}
                    analysis={message.analysis}
                    severity={getSeverity(message.analysis)}
                    getSeverityStyles={getSeverityStyles}
                    getSeverityIcon={getSeverityIcon}
                    onFindPharmacies={(medicineId) => {
                      navigate(
                        `/pharmacies?medicine=${encodeURIComponent(
                          medicineId
                        )}`
                      );
                    }}
                  />
                );
              }

              if (message.type === 'questions') {
                return (
                  <div
                    key={message.id}
                    className="flex justify-start"
                  >
                    <div className="w-full max-w-2xl rounded-[26px] rounded-tl-lg border border-violet-400/15 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl">
                      <div className="mb-4 flex items-start gap-3">
                        <AidFidelisRobot size="sm" active />
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-widest text-violet-400">
                            AidFidelis
                          </p>
                          <p className="mt-1 text-sm text-slate-300">
                            {message.message}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {message.questions.map((item, index) => (
                          <div key={`${item.question}-${index}`}>
                            <label className="mb-2 block text-sm font-semibold text-slate-200">
                              {item.question}
                            </label>
                            <input
                              value={item.answer}
                              onChange={(event) =>
                                updateFollowUpAnswer(
                                  index,
                                  event.target.value
                                )
                              }
                              disabled={isAnalyzing}
                              placeholder="Type your answer"
                              className="w-full rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={submitFollowUpAnswers}
                          disabled={isAnalyzing}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white transition hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-400"
                        >
                          <Send className="h-4 w-4" />
                          Submit Answers
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              if (message.type === 'urgent') {
                return (
                  <div
                    key={message.id}
                    className="flex justify-start"
                  >
                    <div className="max-w-2xl rounded-3xl rounded-tl-md border border-rose-500/30 bg-rose-500/10 p-5 text-rose-200">
                      <div className="flex items-start gap-3">
                        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                        <p className="leading-relaxed">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-3 ${
                    message.sender === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  {message.sender === 'assistant' && (
                    <AidFidelisRobot size="sm" />
                  )}

                  <div
                    className={`max-w-[82%] rounded-[24px] px-5 py-3.5 shadow-xl ${
                      message.sender === 'user'
                        ? 'rounded-br-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-violet-950/20'
                        : 'rounded-bl-lg border border-white/10 bg-slate-900/85 text-slate-200 backdrop-blur-xl'
                    }`}
                  >
                    {message.sender === 'assistant' && (
                      <div className="mb-1.5 flex items-center gap-2">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-300">
                          AidFidelis
                        </p>
                        <span className="h-1 w-1 rounded-full bg-slate-600" />
                        <span className="text-[9px] font-semibold text-slate-500">
                          AI Health Assistant
                        </span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap text-[15px] leading-7">
                      {message.sender === 'assistant' ? (
                        <TypewriterText text={message.text} />
                      ) : (
                        message.text
                      )}
                    </p>
                  </div>
                </div>
              );
            })}

            {isAnalyzing && (
              <div
                className="flex justify-start"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="max-w-2xl rounded-3xl rounded-tl-md border border-violet-500/20 bg-slate-800/90 px-5 py-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <AidFidelisRobot size="sm" active />

                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-violet-400">
                        AidFidelis
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-200">
                        {streamStatus ||
                          'Processing your request...'}
                      </p>

                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.30s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="max-w-2xl rounded-3xl rounded-tl-md border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-rose-300">
                  {error}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </section>

        <div className="mt-4 rounded-[26px] border border-white/10 bg-slate-900/80 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition focus-within:border-violet-400/30 focus-within:shadow-[0_20px_70px_rgba(16,185,129,0.08)]">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              disabled={
                isAnalyzing || pendingQuestions.length > 0
              }
              rows={1}
              placeholder={
                pendingQuestions.length > 0
                  ? 'Answer the questions above first'
                  : 'Message AidFidelis...'
              }
              className="max-h-36 min-h-[52px] flex-1 resize-none bg-transparent px-3 py-3.5 text-[15px] leading-6 text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={
                isAnalyzing ||
                pendingQuestions.length > 0 ||
                !input.trim()
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-600 text-white shadow-lg shadow-violet-950/30 transition hover:scale-[1.03] hover:from-violet-300 hover:to-indigo-500 disabled:scale-100 disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none"
              title="Send"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          <p className="px-3 pt-2 text-xs text-slate-500">
            Press Enter to send. Use Shift + Enter for a new line.
          </p>
        </div>
      </main>
    </div>
  );
};

interface PharmacyDrugResult {
  pharmacyName: string;
  pharmacyId: string;
  medicineId: string;
  drugName: string;
  price: number;
  stock: number;
  phone: string;
}

interface DrugPharmacyGroup {
  medicineId: string;
  genericName: string;
  results: PharmacyDrugResult[];
}

interface AnalysisBubbleProps {
  analysis: CompletedSymptomResponse;
  severity: 'low' | 'medium' | 'high';
  getSeverityStyles: (severity: string) => string;
  getSeverityIcon: (severity: string) => React.ReactNode;
  onFindPharmacies: (medicineId: string) => void;
}

const AnalysisBubble: React.FC<AnalysisBubbleProps> = ({
  analysis,
  severity,
  getSeverityStyles,
  getSeverityIcon,
}) => {
  const navigate = useNavigate();
  const medicationGuidance = analysis.medicationGuidance;
  const shouldSearchPharmacies =
    medicationGuidance.allowPharmacySearch &&
    medicationGuidance.medicines.length > 0;

  const [pharmacyGroups, setPharmacyGroups] = useState<DrugPharmacyGroup[]>([]);
  const [isSearchingPharmacies, setIsSearchingPharmacies] = useState(false);
  const [pharmacySearchDone, setPharmacySearchDone] = useState(false);

  useEffect(() => {
    if (!shouldSearchPharmacies) {
      setPharmacyGroups([]);
      setPharmacySearchDone(false);
      return;
    }

    let cancelled = false;

    const normalizeMedicineName = (value: unknown) =>
      String(value ?? '')
        .trim()
        .toLowerCase()
        // Treat common separators as equivalent so Firestore names like
        // "Artemether_lumefantrine" match reviewed rule names like
        // "Artemether/Lumefantrine".
        .replace(/[_/+\\-]+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const search = async () => {
      setIsSearchingPharmacies(true);
      setPharmacySearchDone(false);

      try {
        const [medicinesSnap, pharmaciesSnap] =
          await Promise.all([
            getDocs(collection(db, 'medicines')),
            getDocs(collection(db, 'pharmacies')),
          ]);

        // Build an approved/verified pharmacy lookup from your
        // real Firestore pharmacy documents.
        const pharmacyMap = new Map<
          string,
          {
            id: string;
            name: string;
            phone: string;
          }
        >();

        pharmaciesSnap.forEach((pharmacyDoc) => {
          const pharmacy =
            pharmacyDoc.data() as any;

          if (pharmacy.isApproved !== true) {
            return;
          }

          if (pharmacy.isRejected === true) {
            return;
          }

          if (pharmacy.isVerified !== true) {
            return;
          }

          const pharmacyName = String(
            pharmacy.name ?? ''
          ).trim();

          if (!pharmacyName) {
            return;
          }

          pharmacyMap.set(
            pharmacyName.toLowerCase(),
            {
              id: pharmacyDoc.id,
              name: pharmacyName,
              phone: String(
                pharmacy.phone ?? ''
              ).trim(),
            }
          );
        });

        const groups: DrugPharmacyGroup[] =
          medicationGuidance.medicines.map(
            (recommendedMedicine) => {
              const wantedName =
                normalizeMedicineName(
                  recommendedMedicine.genericName
                );

              const results: PharmacyDrugResult[] =
                [];

              const seen = new Set<string>();

              medicinesSnap.forEach(
                (medicineDoc) => {
                  const medicine =
                    medicineDoc.data() as any;

                  // Your actual Firestore medicine schema uses:
                  // stock, name, pharmacyName, isApproved, isRejected.
                  if (
                    medicine.isApproved !== true
                  ) {
                    return;
                  }

                  if (
                    medicine.isRejected === true
                  ) {
                    return;
                  }

                  const stock = Number(
                    medicine.stock ?? 0
                  );

                  if (
                    !Number.isFinite(stock) ||
                    stock <= 0
                  ) {
                    return;
                  }

                  const firestoreName =
                    normalizeMedicineName(
                      medicine.name
                    );

                  if (!firestoreName) {
                    return;
                  }

                  // Allows "Paracetamol" to match
                  // "Paracetamol 500mg", etc.
                  const nameMatch =
                    firestoreName === wantedName ||
                    firestoreName.includes(
                      wantedName
                    ) ||
                    wantedName.includes(
                      firestoreName
                    );

                  if (!nameMatch) {
                    return;
                  }

                  const pharmacyName = String(
                    medicine.pharmacyName ?? ''
                  ).trim();

                  if (!pharmacyName) {
                    return;
                  }

                  const pharmacyInfo =
                    pharmacyMap.get(
                      pharmacyName.toLowerCase()
                    );

                  // Do not recommend stock from an unapproved,
                  // rejected, unverified, or missing pharmacy.
                  if (!pharmacyInfo) {
                    return;
                  }

                  const uniqueKey =
                    `${medicineDoc.id}:${pharmacyInfo.id}`;

                  if (seen.has(uniqueKey)) {
                    return;
                  }

                  seen.add(uniqueKey);

                  results.push({
                    pharmacyName:
                      pharmacyInfo.name,
                    pharmacyId:
                      pharmacyInfo.id,
                    medicineId:
                      medicineDoc.id,
                    drugName: String(
                      medicine.name ??
                        recommendedMedicine.genericName
                    ),
                    price: Number(
                      medicine.discountPrice ??
                        medicine.price ??
                        0
                    ),
                    stock,
                    phone:
                      pharmacyInfo.phone,
                  });
                }
              );

              // Put lower priced available options first.
              results.sort((a, b) => {
                if (
                  a.price <= 0 &&
                  b.price > 0
                ) {
                  return 1;
                }

                if (
                  b.price <= 0 &&
                  a.price > 0
                ) {
                  return -1;
                }

                return a.price - b.price;
              });

              return {
                medicineId:
                  recommendedMedicine.medicineId,
                genericName:
                  recommendedMedicine.genericName,
                results,
              };
            }
          );

        if (!cancelled) {
          setPharmacyGroups(groups);
        }
      } catch (searchError) {
        console.error(
          'Pharmacy medicine search failed:',
          searchError
        );

        if (!cancelled) {
          setPharmacyGroups([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearchingPharmacies(false);
          setPharmacySearchDone(true);
        }
      }
    };

    void search();

    return () => {
      cancelled = true;
    };
  }, [
    shouldSearchPharmacies,
    medicationGuidance.medicines,
  ]);

  const handleShopAtPharmacy = (
    pharmacyId: string,
    pharmacyName: string
  ) => {
    localStorage.setItem(
      'selectedPharmacyId',
      pharmacyId
    );

    localStorage.setItem(
      'selectedPharmacyName',
      pharmacyName
    );

    navigate(
      `/pharmacies/${encodeURIComponent(
        pharmacyId
      )}`
    );
  };

  const guidanceTitle = (() => {
    switch (medicationGuidance.guidanceType) {
      case 'otc_options':
        return 'Pharmacist-Reviewed OTC Options';
      case 'prescription_required':
        return 'Clinical Assessment Required';
      case 'pharmacist_review':
        return 'Pharmacist Review Required';
      case 'urgent_attention':
        return 'Medication Shopping Unavailable';
      case 'unsupported_condition':
        return 'No Approved Medication Path';
      case 'uncertain_prediction':
        return 'Medication Decision Needs Review';
      case 'professional_care':
      default:
        return 'Professional Care Recommended';
    }
  })();

  const guidanceStyles = (() => {
    switch (medicationGuidance.guidanceType) {
      case 'otc_options':
        return 'border-violet-500/20 bg-violet-500/10';
      case 'prescription_required':
      case 'pharmacist_review':
        return 'border-amber-500/20 bg-amber-500/10';
      case 'urgent_attention':
        return 'border-rose-500/30 bg-rose-500/10';
      default:
        return 'border-slate-600/40 bg-slate-900/60';
    }
  })();

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-3xl overflow-hidden rounded-[30px] rounded-tl-xl border border-violet-400/20 bg-slate-900/90 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-violet-500/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <AidFidelisRobot size="sm" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-violet-400">
                AidFidelis Analysis
              </p>
              <p className="text-sm font-bold text-white">
                Symptom assessment complete
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${getSeverityStyles(
              severity
            )}`}
          >
            {getSeverityIcon(severity)}
            {analysis.confidenceAssessment.level}
          </div>
        </div>

        <div className="space-y-6 p-5">
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
            <p className="leading-relaxed text-slate-300">
              {analysis.explanation.summary}
            </p>
            <p className="mt-3 text-sm text-violet-300">
              {analysis.confidenceAssessment.message}
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-slate-400">
              Possible Conditions
            </h4>

            <div className="space-y-3">
              {analysis.explanation.possibleConditions.map(
                (condition) => (
                  <article
                    key={condition.name}
                    className="rounded-2xl border border-white/10 bg-slate-900/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-violet-400" />
                        <h5 className="font-bold text-white">
                          {condition.name}
                        </h5>
                      </div>

                      <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-sm font-bold text-violet-300">
                        {(condition.confidence * 100).toFixed(1)}%
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      {condition.reason}
                    </p>
                  </article>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="overflow-hidden rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-400/[0.08] via-slate-900/70 to-slate-900/90">
              <div className="flex items-center gap-3 border-b border-violet-400/10 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10">
                  <HeartPulse className="h-4 w-4 text-violet-300" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.16em] text-violet-300">
                    Care Advice
                  </h4>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Helpful steps based on this assessment
                  </p>
                </div>
              </div>

              <div className="space-y-2 p-4">
                {analysis.explanation.selfCare.map(
                  (item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm leading-relaxed text-slate-300"
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-400/10">
                        <CheckCircle className="h-3.5 w-3.5 text-violet-300" />
                      </div>
                      <span>{item}</span>
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-rose-400/20 bg-gradient-to-br from-rose-500/[0.08] via-slate-900/70 to-slate-900/90">
              <div className="flex items-center gap-3 border-b border-rose-400/10 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10">
                  <ShieldAlert className="h-4 w-4 text-rose-300" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.16em] text-rose-300">
                    Danger Signs
                  </h4>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Seek urgent medical care if these appear
                  </p>
                </div>
              </div>

              <div className="space-y-2 p-4">
                {analysis.explanation.redFlags.map(
                  (item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex gap-3 rounded-xl border border-rose-400/10 bg-rose-500/[0.05] p-3 text-sm leading-relaxed text-rose-100"
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/10">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-300" />
                      </div>
                      <span>{item}</span>
                    </div>
                  )
                )}
              </div>
            </section>
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
            <h4 className="font-extrabold text-violet-300">
              Recommended Next Step
            </h4>
            <p className="mt-2 leading-relaxed text-slate-300">
              {analysis.explanation.recommendedAction}
            </p>
          </div>

          <div className={`rounded-2xl border p-4 ${guidanceStyles}`}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-950/40">
                <Pill className="h-5 w-5 text-violet-400" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-extrabold text-white">
                    {guidanceTitle}
                  </h4>

                  {medicationGuidance.topCondition && (
                    <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs font-bold text-slate-300">
                      {medicationGuidance.topCondition}
                      {' · '}
                      {(medicationGuidance.topConfidence * 100).toFixed(1)}%
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {medicationGuidance.message}
                </p>

                {(medicationGuidance.eligible ||
                  medicationGuidance.allowPharmacySearch) &&
                  medicationGuidance.medicines.length > 0 && (
                    <div className="mt-4 space-y-5">
                      {medicationGuidance.medicines.map((medicine) => {
                        const group = pharmacyGroups.find(
                          (g) => g.medicineId === medicine.medicineId
                        );
                        return (
                          <div
                            key={medicine.medicineId}
                            className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-3"
                          >
                            <div>
                              <p className="font-bold text-white">{medicine.genericName}</p>
                              <p className="mt-1 text-sm text-slate-400">{medicine.purpose}</p>
                            </div>

                            {shouldSearchPharmacies && (
                              <div>
                                {isSearchingPharmacies && !pharmacySearchDone && (
                                  <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                                    Searching pharmacies for {medicine.genericName}...
                                  </div>
                                )}

                                {pharmacySearchDone && group && group.results.length === 0 && (
                                  <p className="text-sm text-slate-500 py-1">No pharmacies found stocking this drug.</p>
                                )}

                                {group && group.results.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-extrabold uppercase tracking-widest text-violet-400 mb-2">
                                      Available at {group.results.length} {group.results.length === 1 ? 'pharmacy' : 'pharmacies'}
                                    </p>
                                    {group.results.map((r) => (
                                      <div
                                        key={`${r.pharmacyId}-${r.medicineId}`}
                                        className="flex flex-col gap-3 rounded-xl border border-violet-500/20 bg-slate-900/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                                      >
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <Store className="h-4 w-4 shrink-0 text-violet-400" />
                                            <p className="font-bold text-white truncate">{r.pharmacyName}</p>
                                          </div>
                                          <p className="mt-0.5 text-sm text-slate-400 pl-6">
                                            {r.drugName} &mdash;
                                            <span className="ml-1 font-bold text-violet-300">
                                              GHS {r.price.toFixed(2)}
                                            </span>
                                          </p>

                                          <p className="mt-1 pl-6 text-xs font-medium text-slate-500">
                                            {r.stock} in stock
                                          </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                          {r.phone && (
                                            <a
                                              href={`tel:${r.phone}`}
                                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-bold text-slate-200 transition hover:border-violet-500/40 hover:text-violet-300"
                                              title={`Call ${r.pharmacyName}`}
                                            >
                                              <Phone className="h-3.5 w-3.5" />
                                              {r.phone}
                                            </a>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleShopAtPharmacy(
                                                r.pharmacyId,
                                                r.pharmacyName
                                              )
                                            }
                                            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-500"
                                          >
                                            Shop Here
                                            <ChevronRight className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                {medicationGuidance.requiresPrescription && (
                  <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
                    This pathway requires clinical assessment or a valid prescription.
                    AidFidelis does not provide prescription upload from this recommendation card.
                  </div>
                )}

                {!medicationGuidance.eligible &&
                  !medicationGuidance.allowPharmacySearch &&
                  !medicationGuidance.requiresPrescription && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/30 p-3 text-sm text-slate-400">
                      Medication shopping is not available for this result.
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-200">
            {analysis.explanation.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;


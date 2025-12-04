
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { LyricSidebar } from '../components/LyricSidebar';
import { ChatInput } from '../components/ChatInput';
import { AgentStatus, LanguageProfile, GenerationSettings, SavedSong, GeneratedLyrics, ComplianceReport, Message } from '../agents/types';
import { Menu, Send, Sliders, Loader, ChevronLeft, Bot, Sparkles, Terminal, Play, Trash2, Copy, RotateCcw, Music } from 'lucide-react';
import { runLyricGenerationWorkflow } from '../agents/orchestrator';
import { AUTO_OPTION } from '../agents/constants';
import { API_KEY as ENV_API_KEY } from '../agents/config';
import { LyricResultViewer } from '../components/LyricResultViewer';
import { loadApiKey, loadChatHistory, saveChatHistory, clearChatHistory, loadLastSettings, saveLastSettings, type ChatMessage } from '../utils/storage';
import { validateApiKey } from '../utils/validation';
import { generatePageTitle, generateMetaDescription, generateCanonicalUrl } from '../utils/seo';
import { Schema, lyricStudioSoftwareSchema } from '../components/Schema';

const INITIAL_MESSAGE: ChatMessage = {
    role: 'ai',
    content: 'Namaste! I am your Swaz Lyric Assistant. Describe your song idea (e.g., "Wedding song in Telugu", "Love failure song in Hindi"), and I will orchestrate the perfect lyrics.',
    timestamp: Date.now()
};

export const LyricStudio: React.FC = () => {
    // SEO Meta Tags
    const pageTitle = generatePageTitle('AI Lyric Studio - Samskara Engine');
    const metaDescription = generateMetaDescription(
        'Generate culturally-aware song lyrics in 23 languages including Telugu, Tamil, Hindi with Swaz AI Lyric Studio. Samskara Engine understands traditions, festivals, emotions. Suno & Udio export ready. Multi-agent AI architecture for production-ready lyrics.'
    );
    const canonicalUrl = generateCanonicalUrl('/studio');

    // Responsive State
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1536);

    // View State
    const [generatedResult, setGeneratedResult] = useState<{ lyrics: GeneratedLyrics, stylePrompt: string, compliance?: ComplianceReport } | null>(null);
    const [showResultOnMobile, setShowResultOnMobile] = useState(false);

    // Chat State - Load from browser storage
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const saved = loadChatHistory();
        return saved.length > 0 ? saved : [INITIAL_MESSAGE];
    });
    const [input, setInput] = useState('');
    const [apiKey, setApiKey] = useState(() => loadApiKey() || ENV_API_KEY);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-save chat history
    useEffect(() => {
        saveChatHistory(messages);
    }, [messages]);

    // Sidebar Settings
    const [agentStatus, setAgentStatus] = useState<AgentStatus>({ active: false, currentAgent: 'IDLE', progress: 0 });
    const [languageSettings, setLanguageSettings] = useState<LanguageProfile>(() => {
        const last = loadLastSettings();
        return last.language || { primary: 'Telugu', secondary: 'Telugu', tertiary: 'Telugu' };
    });

    // Auto-save language settings
    useEffect(() => {
        saveLastSettings({ language: languageSettings });
    }, [languageSettings]);
    const [generationSettings, setGenerationSettings] = useState<GenerationSettings>({
        category: '', ceremony: '', theme: AUTO_OPTION, customTheme: '',
        mood: AUTO_OPTION, customMood: '', style: AUTO_OPTION, customStyle: '',
        singerConfig: AUTO_OPTION, customSingerConfig: '', rhymeScheme: AUTO_OPTION,
        customRhymeScheme: '', complexity: AUTO_OPTION
    });
    const [savedSongs, setSavedSongs] = useState<SavedSong[]>([]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1536) {
                if (!isSidebarOpen) setIsSidebarOpen(true);
            } else {
                if (isSidebarOpen) setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, agentStatus]);

    const parseLyricsToStructure = (text: string, title: string = "Untitled"): GeneratedLyrics => {
        return {
            title: title,
            language: languageSettings.primary,
            ragam: "Auto",
            taalam: "4/4",
            structure: "Standard",
            sections: [{ sectionName: "[Lyrics]", lines: text.split('\n') }]
        };
    };

    const handleClearChat = useCallback(() => {
        if (confirm('Are you sure you want to clear chat history? This cannot be undone.')) {
            clearChatHistory();
            setMessages([INITIAL_MESSAGE]);
        }
    }, []);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        // Validate API Key
        const apiValidation = validateApiKey(apiKey);
        if (!apiValidation.valid) {
            setMessages(prev => [...prev,
            { role: 'user', content: input, timestamp: Date.now() },
            { role: 'ai', content: `⚠️ ${apiValidation.error}. Please enter your Gemini API Key in the Settings section of the sidebar.`, timestamp: Date.now() }
            ]);
            setInput('');
            setIsSidebarOpen(true);
            return;
        }

        const userText = input;
        setMessages(prev => [...prev, { role: 'user', content: userText, timestamp: Date.now() }]);
        setInput('');
        setAgentStatus({ active: true, currentAgent: 'IDLE', progress: 5 });

        // Clear previous result to focus user on generation
        if (window.innerWidth < 1024) setShowResultOnMobile(false);

        try {
            // Convert ChatMessage to Message for orchestrator (ai -> model)
            const convertedHistory: Message[] = messages
                .filter(m => m.role !== 'log')
                .map(m => ({
                    role: m.role === 'ai' ? 'model' as const : 'user' as const,
                    content: m.content
                }));

            const result = await runLyricGenerationWorkflow(
                userText,
                languageSettings,
                generationSettings,
                apiKey,
                convertedHistory,
                (step) => {
                    setAgentStatus({
                        active: true,
                        currentAgent: step.agent as any,
                        progress: step.progress
                    });
                    // Inject Logs into Chat Stream
                    if (step.type === 'log' || step.agent !== 'IDLE') {
                        setMessages(prev => [...prev, { role: 'log', content: step.message, timestamp: Date.now() }]);
                    }
                }
            );

            // Parse result
            let struct: GeneratedLyrics;
            try {
                const lines = result.lyrics.split('\n');
                const sections: any[] = [];
                let currentSection = { sectionName: "[Intro]", lines: [] as string[] };

                lines.forEach(line => {
                    if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
                        if (currentSection.lines.length > 0) sections.push(currentSection);
                        currentSection = { sectionName: line.trim(), lines: [] };
                    } else if (line.trim()) {
                        currentSection.lines.push(line.trim());
                    }
                });
                if (currentSection.lines.length > 0) sections.push(currentSection);
                if (sections.length === 0) sections.push({ sectionName: "[Lyrics]", lines: lines.filter(l => l.trim()) });

                struct = {
                    title: userText.substring(0, 20) + "...",
                    language: languageSettings.primary,
                    ragam: result.analysis?.suggestedStyle || "Auto",
                    taalam: "4/4",
                    structure: "Generated",
                    sections: sections
                };
            } catch (e) {
                struct = parseLyricsToStructure(result.lyrics, "Generated Song");
            }

            setGeneratedResult({
                lyrics: struct,
                stylePrompt: result.stylePrompt
            });

            // Auto-save to Library
            const newSong: SavedSong = {
                id: Date.now().toString(),
                title: struct.title,
                content: result.lyrics,
                language: struct.language,
                stylePrompt: result.stylePrompt,
                structure: struct.structure,
                timestamp: Date.now()
            };
            setSavedSongs(prev => [newSong, ...prev]);

            // Inject Style Card into Chat
            setMessages(prev => [...prev, {
                role: 'ai',
                content: `✨ Song generated successfully! Check the result panel.`,
                timestamp: Date.now()
            }, {
                role: 'ai',
                content: `STYLE_CARD:${result.stylePrompt}`, // Special marker for Style Card
                timestamp: Date.now()
            }]);

            if (window.innerWidth < 1024) {
                setShowResultOnMobile(true);
            }

        } catch (error: any) {
            console.error('Generation Error:', error);

            let errorMessage = 'Unknown error occurred';
            if (error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            // User-friendly error messages
            if (errorMessage.includes('quota')) {
                errorMessage = 'API quota exceeded. Please wait a few minutes or check your Google AI Studio quota.';
            } else if (errorMessage.includes('rate limit')) {
                errorMessage = 'Rate limit reached. Please wait a moment before trying again.';
            } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (errorMessage.includes('API Key')) {
                errorMessage = 'Invalid API Key. Please check your settings.';
            }

            setMessages(prev => [...prev, {
                role: 'ai',
                content: `❌ Generation Failed: ${errorMessage}\\n\\nTip: Check the browser console for more details.`,
                timestamp: Date.now()
            }]);
        } finally {
            setAgentStatus({ active: false, currentAgent: 'IDLE', progress: 0 });
        }
    };

    const handleLoadSong = (song: SavedSong) => {
        const struct = parseLyricsToStructure(song.content, song.title);
        struct.coverArt = song.coverArt;
        struct.structure = song.structure || "Standard";

        setGeneratedResult({
            lyrics: struct,
            stylePrompt: song.stylePrompt || ""
        });
        if (window.innerWidth < 1024) {
            setShowResultOnMobile(true);
        }
    };

    return (
        <>
            {/* SEO Meta Tags */}
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph */}
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://www.swazsolutions.com/assets/lyric-studio-og.jpg" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content="https://www.swazsolutions.com/assets/lyric-studio-twitter.jpg" />

                {/* Keywords */}
                <meta name="keywords" content="AI lyric generator, Telugu songs, Tamil lyrics, Hindi songwriting, Suno AI, Udio AI, cultural songwriting, Samskara Engine, multilingual lyrics, Indian music AI, wedding songs generator, devotional lyrics AI, Carnatic lyrics, Bollywood songwriting, folk song generator" />
            </Helmet>

            {/* Schema Markup for SEO */}
            <Schema type="SoftwareApplication" data={lyricStudioSoftwareSchema} />

            <div className="flex h-[calc(100vh-80px)] bg-background overflow-hidden transition-colors duration-300 relative">
                {/* Mobile Backdrop */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden animate-fade-in"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <LyricSidebar
                    isOpen={isSidebarOpen}
                    onCloseMobile={() => setIsSidebarOpen(false)}
                    agentStatus={agentStatus}
                    languageSettings={languageSettings}
                    onLanguageChange={(key, val) => setLanguageSettings(prev => ({ ...prev, [key]: val }))}
                    generationSettings={generationSettings}
                    onSettingChange={(key, val) => setGenerationSettings(prev => ({ ...prev, [key]: val }))}
                    onLoadProfile={(l, g) => { setLanguageSettings(l); setGenerationSettings(g); }}
                    onOpenHelp={() => { }}
                    onOpenSettings={() => setIsSidebarOpen(true)}
                    savedSongs={savedSongs}
                    onDeleteSong={(id) => setSavedSongs(prev => prev.filter(s => s.id !== id))}
                    onLoadSong={handleLoadSong}
                    onApiKeyChange={(key) => setApiKey(key)}
                />

                {/* Main Split View Area */}
                <main className={`flex-1 flex relative transition-all duration-300 ${isSidebarOpen ? 'xl:ml-80' : ''} h-full`}>

                    {/* LEFT: CHAT & PROMPTING (Fixed Width on Desktop) */}
                    <div className={`
                    flex flex-col h-full border-r border-border transition-all duration-500 bg-background
                    ${showResultOnMobile ? 'hidden lg:flex' : 'w-full'}
                    lg:w-[450px] lg:flex-none
                `}>
                        {/* Desktop Header */}
                        <div className="hidden lg:flex items-center justify-between p-3 border-b border-border bg-surface/80 backdrop-blur">
                            <span className="font-bold text-primary text-sm">Chat History</span>
                            <button
                                onClick={handleClearChat}
                                className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-secondary"
                                title="Clear Chat"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Mobile Header */}
                        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-surface/90 backdrop-blur z-10">
                            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-accent/10 rounded-full">
                                <Sliders className="w-5 h-5" />
                            </button>
                            <span className="font-bold text-primary">Lyric Assistant</span>
                            <div className="flex items-center gap-2">
                                {generatedResult && (
                                    <button
                                        onClick={() => setShowResultOnMobile(true)}
                                        className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full animate-pulse"
                                    >
                                        View Result
                                    </button>
                                )}
                                <button
                                    onClick={handleClearChat}
                                    className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-secondary"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Container */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-background/50">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-center'} animate-fade-in`}>
                                    {msg.role === 'log' ? (
                                        <div className="flex items-center gap-2 text-[10px] text-muted font-mono w-full justify-center py-1 opacity-70">
                                            <Terminal className="w-3 h-3" /> {msg.content}
                                        </div>
                                    ) : msg.role === 'user' ? (
                                        <div className="max-w-[85%] p-4 rounded-2xl shadow-sm bg-brand-gradient text-white rounded-br-none shadow-accent/20 relative group">
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                            <button
                                                onClick={() => {
                                                    setInput(msg.content);
                                                    // Optional: Auto-send
                                                    // handleSendMessage(); 
                                                }}
                                                className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-surface text-secondary rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent"
                                                title="Resend"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 max-w-[90%] w-full">
                                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                                                <Bot className="w-4 h-4 text-accent" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                {msg.content.startsWith('STYLE_CARD:') ? (
                                                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-bold text-accent flex items-center gap-1">
                                                                <Music className="w-3 h-3" /> Music Style
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(msg.content.replace('STYLE_CARD:', ''));
                                                                    // You might want to add a toast here
                                                                }}
                                                                className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                                                            >
                                                                <Copy className="w-3 h-3" /> Copy
                                                            </button>
                                                        </div>
                                                        <p className="text-xs text-slate-300 font-mono leading-relaxed">
                                                            {msg.content.replace('STYLE_CARD:', '')}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-surface border border-border p-4 rounded-2xl rounded-tl-none shadow-sm text-primary">
                                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {agentStatus.active && (
                                <div className="flex justify-center animate-fade-in">
                                    <div className="bg-surface border border-accent/20 px-4 py-3 rounded-full flex items-center gap-3 shadow-lg shadow-accent/5">
                                        <Loader className="w-4 h-4 animate-spin text-accent" />
                                        <span className="text-xs font-bold text-primary animate-pulse">
                                            {agentStatus.currentAgent === 'CHAT' ? 'Agent: Enhancing prompt...' :
                                                agentStatus.currentAgent === 'LYRICIST' ? 'Agent: Composing lyrics...' :
                                                    agentStatus.currentAgent === 'REVIEW' ? 'Agent: Checking rhyme & meter...' :
                                                        agentStatus.currentAgent === 'COMPLIANCE' ? 'Agent: Safety Check...' :
                                                            'Processing request...'}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-surface border-t border-border">
                            <ChatInput
                                value={input}
                                onChange={setInput}
                                onSend={handleSendMessage}
                                disabled={agentStatus.active}
                                placeholder={apiKey ? "Describe song idea (e.g. 'Love failure song in Tamil')" : "Enter API Key in Settings or .env"}
                            />
                        </div>
                    </div>

                    {/* RIGHT: RESULT VIEWER (Flexible Width) */}
                    <div className={`
                    flex-1 bg-surface/30 backdrop-blur-md h-full overflow-hidden flex flex-col transition-all duration-500 border-l border-border
                    ${showResultOnMobile ? 'fixed inset-0 z-50 bg-background' : 'hidden lg:flex'}
                `}>
                        {/* Mobile Back Button */}
                        {showResultOnMobile && (
                            <div className="lg:hidden p-4 border-b border-border bg-surface flex items-center gap-2">
                                <button onClick={() => setShowResultOnMobile(false)} className="p-2 hover:bg-background rounded-full">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <span className="font-bold">Generated Result</span>
                            </div>
                        )}

                        {generatedResult ? (
                            <div className="flex-1 overflow-hidden p-4 md:p-6">
                                <LyricResultViewer
                                    lyricsData={generatedResult.lyrics}
                                    stylePrompt={generatedResult.stylePrompt}
                                    complianceData={generatedResult.compliance}
                                    apiKey={apiKey}
                                    onSaveToLibrary={(song) => setSavedSongs(prev => [song, ...prev])}
                                />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                                <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <Sparkles className="w-10 h-10 text-accent/50" />
                                </div>
                                <h3 className="text-2xl font-bold text-primary mb-3">Lyric Studio</h3>
                                <p className="text-secondary max-w-sm leading-relaxed">
                                    Your personal multi-agent songwriting team. <br />
                                    Prompt on the left, see magic on the right.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Toggle Button (Desktop - when closed) */}
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="hidden xl:flex absolute top-4 left-4 z-30 p-2.5 bg-surface border border-border rounded-xl shadow-sm text-secondary hover:text-primary hover:shadow-md transition-all"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    )}
                </main>
            </div>
        </>
    );
};

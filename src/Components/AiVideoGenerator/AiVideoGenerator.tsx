"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Play,
    MessageSquare,
    Image as ImageIcon,
    Zap,
    Video,
    BarChart2,
    Send,
    X,
    AlertCircle,
    Sparkles,
    ChevronDown
} from 'lucide-react';
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import { getAvatarUrl } from "@/lib/profile";


type ToolType = {
    name: string;
    icon: React.ElementType;
    color: string;
    textColor: string;
    borderColor: string;
    shadowColor: string;
};

const tools: ToolType[] = [
    {
        name: 'Storyteller',
        icon: MessageSquare,
        color: 'bg-amber-500',
        textColor: 'text-amber-600',
        borderColor: 'border-amber-500',
        shadowColor: 'shadow-amber-200'
    },
    {
        name: 'Masterpiece',
        icon: Zap,
        color: 'bg-purple-600',
        textColor: 'text-purple-600',
        borderColor: 'border-purple-600',
        shadowColor: 'shadow-purple-200'
    },
    {
        name: 'Snap',
        icon: ImageIcon,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600',
        borderColor: 'border-yellow-500',
        shadowColor: 'shadow-yellow-200'
    },
    {
        name: 'Instant',
        icon: Play,
        color: 'bg-blue-500',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-500',
        shadowColor: 'shadow-blue-200'
    },
    {
        name: 'Video',
        icon: Video,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-600',
        borderColor: 'border-emerald-500',
        shadowColor: 'shadow-emerald-200'
    },
    {
        name: 'Analyzer',
        icon: BarChart2,
        color: 'bg-cyan-500',
        textColor: 'text-cyan-600',
        borderColor: 'border-cyan-500',
        shadowColor: 'shadow-cyan-200'
    },
];

interface Message {
    id: string;
    role: 'user' | 'ai';
    type: 'text' | 'image';
    content: string;
    toolUsed?: ToolType; // Keep track of which tool sent this
    error?: boolean;
}

export default function AiVideoGenerator() {
    const [activeTool, setActiveTool] = useState<ToolType>(tools[0]);
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Initialize with a welcome message
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init-1',
            role: 'ai',
            type: 'text',
            content: "Creative Studio is ready. Choose a tool to begin your next project.",
            toolUsed: tools[0] // Set to default tool
        }
    ]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

    const { user } = useAuth();
    const { profile } = useUserProfile();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, selectedImage]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setSelectedImage(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleSend = async () => {
        if (!input.trim() && !selectedImage) return;

        const newMessages: Message[] = [];

        if (selectedImage) {
            newMessages.push({
                id: Date.now().toString() + '-img',
                role: 'user',
                type: 'image',
                content: selectedImage,
                toolUsed: activeTool
            });
            setSelectedImage(null);
            setSelectedFile(null);
        }

        if (input.trim()) {
            newMessages.push({
                id: Date.now().toString() + '-txt',
                role: 'user',
                type: 'text',
                content: input.trim(),
                toolUsed: activeTool
            });
            setInput('');
        }

        setMessages(prev => [...prev, ...newMessages]);
        setIsGenerating(true);

        setTimeout(() => {
            setIsGenerating(false);
        }, 1000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="w-full min-h-[85vh] p-2 md:p-6 flex flex-col font-sans transition-colors duration-500 bg-gray-50/30">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-visible">
                <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white shadow-sm`}>
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-lg text-gray-900">Creative Studio</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border bg-white ${activeTool.borderColor.replace('border-', 'border-opacity-30 border-')} ${activeTool.textColor}`}>
                        {activeTool.name}
                    </div>
                </div>

                <div className="flex-1 relative bg-white/50 overflow-hidden flex flex-col">

                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6 w-full">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                            >
                                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                                    {/* Avatar */}
                                    <div className={`
                                w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden
                                ${msg.role === 'user'
                                            ? 'bg-transparent'
                                            : 'bg-gray-900 text-white'
                                        }
                            `}>
                                        {msg.role === 'user' ? (
                                            profile && getAvatarUrl(profile.profile?.avatar_url) ? (
                                                <img
                                                    src={getAvatarUrl(profile.profile?.avatar_url) || ''}
                                                    alt={profile?.name || 'User'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {(profile?.name || ((user as Record<string, unknown>)?.name as string) || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )
                                        ) : (
                                            <Sparkles className="w-4 h-4" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        {msg.type === 'image' ? (
                                            <div className={`rounded-2xl overflow-hidden border-2 bg-white shadow-sm ${msg.toolUsed?.borderColor}`}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={msg.content}
                                                    alt="Uploaded content"
                                                    className="w-full h-auto max-h-[400px] object-contain block"
                                                />
                                            </div>
                                        ) : (
                                            <div className={`
                                        px-3 py-2 md:px-4 md:py-3 rounded-2xl text-sm md:text-[15px] leading-relaxed shadow-sm
                                        ${msg.role === 'user'
                                                    ? `${msg.toolUsed?.color} text-white rounded-tr-none`
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                                }
                                    `}>
                                                {msg.error && <AlertCircle className="w-4 h-4 inline-block mr-2 -mt-0.5 text-red-500" />}
                                                {msg.content}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isGenerating && (
                            <div className="flex w-full justify-start animate-fade-in">
                                <div className="flex max-w-[80%] flex-row items-start gap-3">
                                    <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
                                    bg-gray-900 text-white
                                `}>
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-3 md:p-6 bg-white border-t border-gray-100 space-y-3 md:space-y-4 flex-shrink-0 z-10 relative">

                    <div className="relative">
                        <button
                            onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                            className={`
                                flex md:hidden w-full items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-200
                                ${activeTool.borderColor} bg-gray-50 text-gray-900 font-medium text-sm
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <activeTool.icon className={`w-4 h-4 ${activeTool.textColor}`} />
                                <span>{activeTool.name}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isModelMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isModelMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-20 bg-black/5 md:hidden"
                                    onClick={() => setIsModelMenuOpen(false)}
                                />
                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-30 animate-fade-in-up md:hidden">
                                    <div className="max-h-60 overflow-y-auto p-1">
                                        {tools.map((tool) => (
                                            <button
                                                key={tool.name}
                                                onClick={() => {
                                                    setActiveTool(tool);
                                                    setIsModelMenuOpen(false);
                                                }}
                                                className={`
                                                    w-full px-4 py-3 text-left flex items-center gap-3 rounded-lg text-sm font-medium transition-colors
                                                    ${activeTool.name === tool.name ? 'bg-gray-50 text-gray-900 border border-gray-100' : 'text-gray-600 hover:bg-gray-50'}
                                                `}
                                            >
                                                <tool.icon className={`w-4 h-4 ${activeTool.name === tool.name ? tool.textColor : 'text-gray-400'}`} />
                                                {tool.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {tools.map((tool) => (
                                <button
                                    key={tool.name}
                                    onClick={() => setActiveTool(tool)}
                                    className={`
                                      px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 whitespace-nowrap
                                      ${activeTool.name === tool.name
                                            ? `${tool.color} text-white shadow-md ${tool.shadowColor}`
                                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <tool.icon className="w-4 h-4" />
                                    {tool.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedImage && (
                        <div className="animate-fade-in-up">
                            <div className={`relative inline-block h-24 rounded-xl overflow-hidden border-2 bg-white shadow-sm ${activeTool.borderColor}`}>
                                <img
                                    src={selectedImage}
                                    alt="Selected"
                                    className="h-full w-auto object-cover block"
                                />
                                <button
                                    onClick={() => { setSelectedImage(null); setSelectedFile(null); }}
                                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors cursor-pointer backdrop-blur-sm"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={`Generate with ${activeTool.name}...`}
                            className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-14 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-300 transition-all shadow-sm`}
                        />

                        <button
                            onClick={handleUploadClick}
                            className={`
                                absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all duration-200
                                text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center
                            `}
                            title="Upload Image"
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleSend}
                            disabled={(!input.trim() && !selectedImage) || isGenerating}
                            className={`
                                absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all duration-300 shadow-sm flex items-center justify-center
                                ${(input.trim() || selectedImage) && !isGenerating
                                    ? `${activeTool.color} ${activeTool.textColor.replace('text-', 'hover:bg-opacity-90 ')} text-white ${activeTool.shadowColor}`
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
            />
        </div>
    );
}

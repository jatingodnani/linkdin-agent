'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type EmotionalStyle = 'inspirational' | 'vulnerable' | 'passionate' | 'relatable' | 'motivational' | 'controversial';

type StyleAnalysis = {
    tone: string;
    writing_style: string;
    common_themes: string[];
    sentence_structure: string;
    vocabulary: string[];
    emoji_usage: string;
    post_length: string;
    engagement_style: string;
    hashtag_usage: string;
    personal_touch: string;
};

interface EmotionalRewriteProps {
    originalPost: string;
    originalStyle?: StyleAnalysis;
    onRewrite?: (rewrittenPost: string) => void;
}

export default function EmotionalRewrite({ originalPost, originalStyle, onRewrite }: EmotionalRewriteProps) {
    const [isRewriting, setIsRewriting] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState<EmotionalStyle>('inspirational');
    const [rewrittenPost, setRewrittenPost] = useState('');

    const emotionalStyles: { value: EmotionalStyle; label: string; description: string; icon: string }[] = [
        { value: 'inspirational', label: 'Inspirational', description: 'Uplifting and motivational', icon: '✨' },
        { value: 'vulnerable', label: 'Vulnerable', description: 'Honest and authentic', icon: '💭' },
        { value: 'passionate', label: 'Passionate', description: 'Energetic and conviction-driven', icon: '🔥' },
        { value: 'relatable', label: 'Relatable', description: 'Common experiences everyone shares', icon: '🤝' },
        { value: 'motivational', label: 'Motivational', description: 'Action-oriented and empowering', icon: '💪' },
        { value: 'controversial', label: 'Thought-Provoking', description: 'Challenges conventional thinking', icon: '🤔' },
    ];

    const handleRewrite = async () => {
        if (!originalPost.trim()) return;

        setIsRewriting(true);
        try {
            const response = await fetch('/api/rewrite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    post: originalPost,
                    emotionalStyle: selectedStyle,
                    originalStyle
                }),
            });

            if (!response.ok) throw new Error('Failed to rewrite post');

            const data = await response.json();
            setRewrittenPost(data.rewrittenPost);
            onRewrite?.(data.rewrittenPost);
        } catch (error) {
            console.error('Rewrite error:', error);
        } finally {
            setIsRewriting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">🎭 Make It More Emotional</h3>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Choose emotional style:
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {emotionalStyles.map((style) => (
                            <button
                                key={style.value}
                                onClick={() => setSelectedStyle(style.value)}
                                className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${selectedStyle === style.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-lg">{style.icon}</span>
                                    <span className="font-medium text-gray-900">{style.label}</span>
                                </div>
                                <p className="text-xs text-gray-600">{style.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleRewrite}
                    disabled={!originalPost.trim() || isRewriting}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${!originalPost.trim() || isRewriting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600'
                        }`}
                >
                    {isRewriting ? (
                        <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Rewriting with {emotionalStyles.find(s => s.value === selectedStyle)?.label} style...
                        </span>
                    ) : (
                        `Rewrite as ${emotionalStyles.find(s => s.value === selectedStyle)?.label}`
                    )}
                </button>

                {rewrittenPost && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h4 className="font-semibold text-gray-800">
                            {emotionalStyles.find(s => s.value === selectedStyle)?.icon} Emotional Rewrite:
                        </h4>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                                {rewrittenPost}
                            </p>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>{rewrittenPost.length} characters</span>
                            <span>{rewrittenPost.split(/\s+/).length} words</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

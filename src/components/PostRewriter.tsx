'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PostRewriterProps {
    originalPost: string;
    originalStyle?: {
        tone?: string;
        writing_style?: string;
        personal_touch?: string;
        engagement_style?: string;
        emoji_usage?: string;
        hashtag_usage?: string;
    };
    onRewrite: (rewrittenPost: string) => void;
    onClose: () => void;
}

export default function PostRewriter({ originalPost, originalStyle, onRewrite, onClose }: PostRewriterProps) {
    const [customInstructions, setCustomInstructions] = useState('');
    const [suggestions, setSuggestions] = useState<{
        quick_options: string[];
        custom_suggestions: string[];
        tone_adjustments: string[];
        engagement_boosters: string[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [rewrittenPost, setRewrittenPost] = useState('');

    const loadSuggestions = async () => {
        setIsLoadingSuggestions(true);
        try {
            const response = await fetch('/api/rewrite-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post: originalPost }),
            });

            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);
            }
        } catch (error) {
            console.error('Failed to load suggestions:', error);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleRewrite = async (instructions: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/rewrite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    post: originalPost,
                    instructions,
                    originalStyle
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setRewrittenPost(data.rewrittenPost);
            }
        } catch (error) {
            console.error('Failed to rewrite post:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickOption = (option: string) => {
        setCustomInstructions(option);
        handleRewrite(option);
    };

    const handleCustomRewrite = () => {
        if (customInstructions.trim()) {
            handleRewrite(customInstructions);
        }
    };

    const handleUseRewrite = () => {
        onRewrite(rewrittenPost);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Rewrite Your Post</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Original Post */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Original Post</h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <p className="text-gray-700 whitespace-pre-line">{originalPost}</p>
                        </div>
                    </div>

                    {/* Custom Instructions */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Custom Instructions</h3>
                        <div className="flex space-x-3">
                            <input
                                type="text"
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                                placeholder="e.g., 'Make it more emotional and personal', 'Add humor', 'Make it shorter'"
                                className="flex-1 p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                onClick={handleCustomRewrite}
                                disabled={!customInstructions.trim() || isLoading}
                                className={`px-6 py-3 rounded-xl font-semibold transition-colors ${!customInstructions.trim() || isLoading
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {isLoading ? 'Rewriting...' : 'Rewrite'}
                            </button>
                        </div>
                    </div>

                    {/* Quick Options */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">Quick Options</h3>
                            <button
                                onClick={loadSuggestions}
                                disabled={isLoadingSuggestions}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                {isLoadingSuggestions ? 'Loading...' : 'Get AI Suggestions'}
                            </button>
                        </div>

                        {suggestions && (
                            <div className="space-y-4">
                                {/* Quick Options */}
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Quick Rewrites:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.quick_options?.map((option: string, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => handleQuickOption(option)}
                                                disabled={isLoading}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tone Adjustments */}
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Tone Adjustments:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.tone_adjustments?.map((tone: string, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => handleQuickOption(tone)}
                                                disabled={isLoading}
                                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                                            >
                                                {tone}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Engagement Boosters */}
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Engagement Boosters:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.engagement_boosters?.map((booster: string, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => handleQuickOption(booster)}
                                                disabled={isLoading}
                                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                                            >
                                                {booster}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rewritten Post */}
                    <AnimatePresence>
                        {rewrittenPost && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mb-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Rewritten Post</h3>
                                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                    <p className="text-gray-800 whitespace-pre-line leading-relaxed">{rewrittenPost}</p>
                                </div>
                                <div className="mt-4 flex justify-end space-x-3">
                                    <button
                                        onClick={() => setRewrittenPost('')}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={handleUseRewrite}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                                    >
                                        Use This Version
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center">
                                <svg className="animate-spin h-6 w-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-gray-700 font-medium">Rewriting your post...</span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

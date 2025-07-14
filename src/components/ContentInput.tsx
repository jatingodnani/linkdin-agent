'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ContentInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
    disabled?: boolean;
}

export default function ContentInput({
    value,
    onChange,
    placeholder = "Paste your LinkedIn posts here...",
    maxLength = 10000,
    disabled = false
}: ContentInputProps) {
    const [showTips, setShowTips] = useState(false);

    const tips = [
        "Paste 3-5 of your recent LinkedIn posts for better analysis",
        "Include variety - mix different types of posts (insights, stories, announcements)",
        "Separate multiple posts with '---' or '***' for better analysis",
        "The more content you provide, the more accurate the style analysis will be",
        "Personal posts work better than generic company announcements"
    ];

    const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
    const charCount = value.length;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <label className="block text-lg font-bold text-gray-900">
                    Your LinkedIn Content
                </label>
                <button
                    type="button"
                    onClick={() => setShowTips(!showTips)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                >
                    <span className="mr-2">💡</span>
                    {showTips ? 'Hide Tips' : 'Show Tips'}
                </button>
            </div>

            {showTips && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6"
                >
                    <h4 className="font-bold text-blue-900 mb-3 text-lg">💡 Tips for better analysis:</h4>
                    <ul className="text-blue-800 space-y-2">
                        {tips.map((tip, index) => (
                            <li key={index} className="flex items-start leading-relaxed">
                                <span className="mr-3 text-blue-600 font-bold">•</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            <div className="relative">
                <textarea
                    className="w-full h-80 p-6 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-gray-800 text-base leading-relaxed"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    maxLength={maxLength}
                />

                <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 font-medium shadow-sm">
                    {charCount}/{maxLength} chars • {wordCount} words
                </div>
            </div>

            {charCount > maxLength * 0.8 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-base text-orange-600 font-medium bg-orange-50 p-3 rounded-lg border border-orange-200"
                >
                    ⚠️ Approaching character limit. Consider focusing on your most representative posts.
                </motion.p>
            )}
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';

interface StyleAnalysisDisplayProps {
    analysis: {
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
}

export default function StyleAnalysisDisplay({ analysis }: StyleAnalysisDisplayProps) {
    const analysisItems = [
        { label: 'Tone', value: analysis.tone, icon: '🎯' },
        { label: 'Writing Style', value: analysis.writing_style, icon: '✍️' },
        { label: 'Common Themes', value: analysis.common_themes.join(', '), icon: '💡' },
        { label: 'Sentence Structure', value: analysis.sentence_structure, icon: '📝' },
        { label: 'Vocabulary', value: analysis.vocabulary.join(', '), icon: '📖' },
        { label: 'Emoji Usage', value: analysis.emoji_usage, icon: '😊' },
        { label: 'Post Length', value: analysis.post_length, icon: '📏' },
        { label: 'Engagement Style', value: analysis.engagement_style, icon: '🤝' },
        { label: 'Hashtag Usage', value: analysis.hashtag_usage, icon: '#️⃣' },
        { label: 'Personal Touch', value: analysis.personal_touch, icon: '👤' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 mb-8"
        >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Writing Style Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysisItems.map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center mb-3">
                            <span className="text-2xl mr-3">{item.icon}</span>
                            <span className="font-bold text-gray-900 text-lg">{item.label}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-base">{item.value}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

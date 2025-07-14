'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ViralityAnalysis {
    score: number;
    factors: {
        emotional_appeal: number;
        engagement_hooks: number;
        shareability: number;
        trending_relevance: number;
        call_to_action: number;
    };
    recommendations: string[];
    predicted_engagement: string;
}

interface ViralityScoreProps {
    post: string;
    onAnalyze?: (analysis: ViralityAnalysis) => void;
}

export default function ViralityScore({ post, onAnalyze }: ViralityScoreProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<ViralityAnalysis | null>(null);

    const analyzeVirality = async () => {
        if (!post.trim()) return;

        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/virality', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post }),
            });

            if (!response.ok) throw new Error('Failed to analyze virality');

            const data = await response.json();
            setAnalysis(data);
            onAnalyze?.(data);
        } catch (error) {
            console.error('Virality analysis error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-600 bg-green-100';
        if (score >= 6) return 'text-yellow-600 bg-yellow-100';
        if (score >= 4) return 'text-orange-600 bg-orange-100';
        return 'text-red-600 bg-red-100';
    };

    const getEngagementColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'viral': return 'text-purple-600 bg-purple-100';
            case 'high': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">🚀 Virality Score</h3>
                <button
                    onClick={analyzeVirality}
                    disabled={!post.trim() || isAnalyzing}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${!post.trim() || isAnalyzing
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Virality'}
                </button>
            </div>

            {isAnalyzing && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Analyzing viral potential...</span>
                </div>
            )}

            {analysis && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getScoreColor(analysis.score)}`}>
                                {analysis.score}/10
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEngagementColor(analysis.predicted_engagement)}`}>
                                {analysis.predicted_engagement.toUpperCase()} ENGAGEMENT
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h4 className="font-semibold text-gray-800">Virality Factors</h4>
                            {Object.entries(analysis.factors).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 capitalize">
                                        {key.replace('_', ' ')}:
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${(value as number) * 10}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium w-8">{Number(value)}/10</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold text-gray-800">Recommendations</h4>
                            <ul className="space-y-2">
                                {analysis.recommendations.map((rec: string, index: number) => (
                                    <li key={index} className="text-sm text-gray-700 flex items-start">
                                        <span className="text-blue-600 mr-2">•</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

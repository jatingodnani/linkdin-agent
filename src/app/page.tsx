'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import PostRewriter from '@/components/PostRewriter';

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

type ViralityAnalysis = {
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
};

export default function Home() {
  const [step, setStep] = useState<'analyze' | 'generate'>('analyze');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [analysis, setAnalysis] = useState<StyleAnalysis | null>(null);
  const [generatedPost, setGeneratedPost] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [showRewriter, setShowRewriter] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [viralityScore, setViralityScore] = useState<ViralityAnalysis | null>(null);
  const [isAnalyzingVirality, setIsAnalyzingVirality] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCopyToClipboard = (text: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      const button = document.getElementById('copyButton');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          if (button) button.textContent = originalText;
        }, 2000);
      }
    }
  };

  const handleRewritePost = (rewrittenPost: string) => {
    setGeneratedPost(rewrittenPost);
    // Reset virality score when post is rewritten
    setViralityScore(null);
  };

  const analyzeVirality = async (post: string) => {
    setIsAnalyzingVirality(true);
    try {
      const response = await fetch('/api/virality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze virality');
      }

      const data = await response.json();
      setViralityScore(data);
    } catch (error) {
      console.error('Virality analysis error:', error);
    } finally {
      setIsAnalyzingVirality(false);
    }
  };

  // Use the Vercel AI SDK's useChat hook for the generate endpoint
  const {
    isLoading: isGenerating,
    error: generateError
  } = useChat({
    api: '/api/generate',
    onFinish: (message) => {
      setGeneratedPost(message.content);
    },
    onError: (error) => {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate post. Please try again.');
    }
  });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Please enter some content to analyze');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze content');
      }

      const data = await response.json();
      setAnalysis(data);
      setStep('generate');
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalyzeError(error instanceof Error ? error.message : 'Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, style: analysis }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate post');
      }

      const data = await response.json();
      setGeneratedPost(data.post);

      // Automatically analyze virality of the generated post
      analyzeVirality(data.post);
    } catch (error) {
      console.error('Generation error:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate post. Please try again.');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-4">
            LinkedIn Ghostwriter
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            Create authentic LinkedIn posts that sound just like you
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'analyze' ? (<motion.form
            key="analyze"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleAnalyze}
            className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
          >
            <div className="flex items-center mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold mr-4 text-lg">1</div>
              <h2 className="text-3xl font-bold text-gray-900">Analyze Your Writing Style</h2>
            </div>
            <p className="text-gray-700 mb-8 pl-14 -mt-6 text-lg">
              Paste some of your existing LinkedIn posts or content to analyze your unique writing style.
            </p>

            <div className="space-y-6">
              <div className="relative">
                <textarea
                  className="w-full h-72 p-6 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-gray-800 text-base leading-relaxed"
                  placeholder="Paste your LinkedIn posts here... (separate multiple posts with --- or ***)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isAnalyzing}
                />
                <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600">
                  {content.length} characters
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={`w-full py-5 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 ${!content.trim() || isAnalyzing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl'
                  }`}
                disabled={!content.trim() || isAnalyzing}
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing your writing style...
                  </span>
                ) : (
                  'Analyze My Writing Style →'
                )}
              </motion.button>
            </div>

            {analyzeError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg"
              >
                <p className="font-semibold">Error</p>
                <p className="mt-1">{analyzeError}</p>
              </motion.div>
            )}
          </motion.form>
          ) : (
            <motion.div
              key="generate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >              <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleGenerate}
              className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
            >
                <motion.div variants={itemVariants} className="flex items-center mb-8">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold mr-4 text-lg">2</div>
                  <h2 className="text-3xl font-bold text-gray-900">Generate Your Post</h2>
                </motion.div>
                <motion.p variants={itemVariants} className="text-gray-700 mb-8 pl-14 -mt-6 text-lg">
                  Enter a topic for your LinkedIn post, and we&apos;ll generate content that matches your unique writing style.
                </motion.p>

                <motion.div variants={itemVariants} className="mb-8">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Topic for your post
                  </label>
                  <input
                    type="text"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 text-base"
                    placeholder="E.g., My experience with AI in marketing"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="mb-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={`w-full py-5 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 ${!topic.trim() || isGenerating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl'
                      }`}
                    disabled={!topic.trim() || isGenerating}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Crafting your post...
                      </span>
                    ) : (
                      'Generate My Post →'
                    )}
                  </motion.button>
                </motion.div>

                {generateError && (
                  <motion.div
                    variants={itemVariants}
                    className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg"
                  >
                    <p className="font-semibold">Error</p>
                    <p className="mt-1">{generateError.message}</p>
                  </motion.div>
                )}
              </motion.form>

              {generatedPost && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">Your Generated Post</h3>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl transition-colors shadow-lg"
                        onClick={() => isClient && handleCopyToClipboard(generatedPost)}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span id="copyButton">Copy to Clipboard</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl transition-colors shadow-lg"
                        onClick={() => setShowRewriter(true)}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Rewrite Post
                      </motion.button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-8 rounded-xl whitespace-pre-line text-gray-800 leading-relaxed border border-gray-200 text-base">
                    {generatedPost}
                  </div>

                  {/* Virality Score Display */}
                  {isAnalyzingVirality && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-blue-700 font-medium">Analyzing virality potential...</span>
                      </div>
                    </div>
                  )}

                  {viralityScore && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6"
                    >
                      <div className="flex items-center mb-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">🚀</span>
                          <h4 className="text-xl font-bold text-gray-900">Virality Score</h4>
                        </div>
                        <div className="ml-auto flex items-center">
                          <div className={`text-3xl font-bold ${viralityScore.score >= 8 ? 'text-green-600' :
                              viralityScore.score >= 6 ? 'text-yellow-600' :
                                'text-red-600'
                            }`}>
                            {viralityScore.score}/10
                          </div>
                          <div className="ml-3 px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500">
                            {viralityScore.predicted_engagement.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-3 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{viralityScore.factors.emotional_appeal}</div>
                          <div className="text-xs text-gray-600">Emotional Appeal</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{viralityScore.factors.engagement_hooks}</div>
                          <div className="text-xs text-gray-600">Engagement Hooks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{viralityScore.factors.shareability}</div>
                          <div className="text-xs text-gray-600">Shareability</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{viralityScore.factors.trending_relevance}</div>
                          <div className="text-xs text-gray-600">Trending Relevance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{viralityScore.factors.call_to_action}</div>
                          <div className="text-xs text-gray-600">Call to Action</div>
                        </div>
                      </div>

                      {viralityScore.recommendations.length > 0 && (
                        <div className="border-t border-purple-200 pt-4">
                          <h5 className="font-semibold text-gray-900 mb-2">💡 Recommendations to boost virality:</h5>
                          <ul className="space-y-1">
                            {viralityScore.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start">
                                <span className="text-purple-500 mr-2">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                  <div className="mt-8 flex justify-between items-center">
                    <motion.button
                      whileHover={{ x: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      onClick={() => setStep('analyze')}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Analysis
                    </motion.button>
                    <div className="text-sm text-gray-600 font-medium">
                      {generatedPost.length} characters • {generatedPost.split(/\s+/).length} words
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showRewriter && (
        <PostRewriter
          originalPost={generatedPost}
          onClose={() => setShowRewriter(false)}
          onRewrite={handleRewritePost}
        />
      )}
    </div>
  );
}

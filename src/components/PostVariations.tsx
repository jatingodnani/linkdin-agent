'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PostVariationsProps {
    variations: string[];
    onCopy: (text: string) => void;
    onSelect: (text: string) => void;
}

export default function PostVariations({ variations, onCopy, onSelect }: PostVariationsProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const handleSelect = (index: number) => {
        setSelectedIndex(index);
        onSelect(variations[index]);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
        >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Post Variations</h3>
            <p className="text-gray-700 mb-8 text-lg">Choose the version that resonates most with you:</p>

            <div className="space-y-6">
                {variations.map((variation, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${selectedIndex === index
                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                            }`}
                        onClick={() => handleSelect(index)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                Variation {index + 1}
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCopy(variation);
                                    }}
                                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors font-medium"
                                >
                                    Copy
                                </button>
                                {selectedIndex === index && (
                                    <span className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-lg font-medium">
                                        Selected
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-base text-gray-800 whitespace-pre-line leading-relaxed">
                            {variation}
                        </div>
                        <div className="mt-4 text-sm text-gray-600 flex justify-between font-medium">
                            <span>{variation.length} characters</span>
                            <span>{variation.split(/\s+/).length} words</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

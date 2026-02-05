/**
 * Simple Sign Language Tutor
 * 
 * Learn Indian Sign Language with an easy-to-use interface
 * - Type any word to see the sign
 * - Browse common phrases
 * - Practice vocabulary
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, BookOpen, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ISLAvatarPlayer } from '@/components/signLanguage/ISLAvatarPlayer'

// Common words grouped by category  
const VOCABULARY = {
    'Greetings': ['hello', 'thank you', 'good morning', 'good night', 'welcome'],
    'Family': ['mother', 'father', 'brother', 'sister', 'family'],
    'Basic Needs': ['eat', 'drink', 'sleep', 'help', 'water'],
    'Feelings': ['happy', 'sad', 'angry', 'love', 'afraid'],
    'Questions': ['what', 'where', 'when', 'who', 'how'],
    'Numbers': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
}

export default function SignLanguageTutor() {
    const navigate = useNavigate()
    const [selectedWord, setSelectedWord] = useState('hello')
    const [customInput, setCustomInput] = useState('')

    const handleWordClick = (word: string) => {
        setSelectedWord(word)
        setCustomInput('')
    }

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (customInput.trim()) {
            setSelectedWord(customInput.trim())
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/sign-language')}
                        className="p-2 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700 active:scale-95 transition"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <BookOpen size={32} className="text-amber-400" />
                            Sign Language Tutor
                        </h1>
                        <p className="text-neutral-400 text-sm">
                            Learn Indian Sign Language - Type any word to see the sign
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: 3D Avatar Player */}
                    <div className="lg:col-span-2">
                        <Card className="p-6 bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                            <div className="mb-4">
                                <h2 className="text-2xl font-semibold mb-2">Current Word</h2>
                                <p className="text-4xl font-bold text-amber-400">{selectedWord}</p>
                            </div>

                            {/* ISL Avatar Player - This is the PROVEN working component */}
                            <ISLAvatarPlayer initialText={selectedWord} autoPlay />

                            {/* Custom Input */}
                            <form onSubmit={handleCustomSubmit} className="mt-6">
                                <div className="flex gap-2">
                                    <Input
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                        placeholder="Type any word or phrase..."
                                        className="flex-1 bg-neutral-800 border-neutral-700 text-white"
                                    />
                                    <Button type="submit" className="bg-amber-600 hover:bg-amber-500">
                                        Show Sign
                                    </Button>
                                </div>
                                <p className="text-xs text-neutral-500 mt-2">
                                    💡 Try: "how are you", "i am hungry", "வணக்கம்" (Tamil), "नमस्ते" (Hindi)
                                </p>
                            </form>
                        </Card>
                    </div>

                    {/* Right: Vocabulary Browser */}
                    <div>
                        <Card className="p-6 bg-neutral-900/50 backdrop-blur-sm border-neutral-800 sticky top-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Zap className="text-blue-400" size={20} />
                                Vocabulary Categories
                            </h2>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {Object.entries(VOCABULARY).map(([category, words]) => (
                                    <div key={category}>
                                        <h3 className="text-sm font-medium text-neutral-400 mb-2">
                                            {category}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {words.map((word) => (
                                                <button
                                                    key={word}
                                                    onClick={() => handleWordClick(word)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${selectedWord === word
                                                            ? 'bg-amber-600 text-white'
                                                            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                                        }`}
                                                >
                                                    {word}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Stats */}
                            <div className="mt-6 pt-4 border-t border-neutral-800">
                                <p className="text-xs text-neutral-500">
                                    📚 {Object.values(VOCABULARY).flat().length}+ words available
                                </p>
                                <p className="text-xs text-neutral-500 mt-1">
                                    🌐 Supports Tamil, Hindi, English
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Help Section */}
                <Card className="mt-6 p-6 bg-blue-900/20 border-blue-700/30">
                    <h3 className="font-semibold text-blue-300 mb-2">How to Use</h3>
                    <ul className="text-sm text-neutral-300 space-y-1">
                        <li>• Click any word from the vocabulary list to see its sign</li>
                        <li>• Type custom words or phrases in the input box</li>
                        <li>• Avatar will automatically play the sign animation</li>
                        <li>• Try phrases like "how are you", "thank you", "good morning"</li>
                        <li>• Works with Tamil (வணக்கம்) and Hindi (नमस्ते) too!</li>
                    </ul>
                </Card>
            </div>
        </div>
    )
}

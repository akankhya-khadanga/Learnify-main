/**
 * Practice Mode Page
 * 
 * Split-screen practice interface where users can:
 * - See reference sign on the left
 * - Practice with camera on the right
 * - Get real-time feedback and accuracy scoring
 * - Review their attempts
 */

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Award, RotateCcw, TrendingUp, CheckCircle2, Play, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GestureRecognition } from '@/components/signLanguage/GestureRecognition'
import type { SignGesture } from '@/types/signLanguage'

interface PracticeModeProps { }

interface AttemptRecord {
    id: string
    timestamp: number
    accuracy: number
    feedback: string[]
}

export default function PracticeMode() {
    const navigate = useNavigate()
    const location = useLocation()
    const { lesson, gesture } = location.state || {}

    const [isPlaying, setIsPlaying] = useState(false)
    const [attempts, setAttempts] = useState<AttemptRecord[]>([])
    const [currentAttempt, setCurrentAttempt] = useState<AttemptRecord | null>(null)
    const [bestScore, setBestScore] = useState(0)
    const [averageScore, setAverageScore] = useState(0)
    const [avatarLoaded, setAvatarLoaded] = useState(false)
    const [avatarError, setAvatarError] = useState('')

    // Redirect if no lesson/gesture provided
    useEffect(() => {
        if (!lesson || !gesture) {
            navigate('/sign-language')
        }
    }, [lesson, gesture, navigate])

    // Initialize CWASA avatar
    useEffect(() => {
        const initAvatar = () => {
            if (typeof window.CWASA === 'undefined') {
                setTimeout(initAvatar, 100)
                return
            }

            try {
                const container = document.querySelector('.CWASAAvatar.av0')
                if (!container) {
                    setTimeout(initAvatar, 100)
                    return
                }

                const initCfg = {
                    avsbsl: ["anna"],
                    avSettings: {
                        avList: "avsbsl",
                        initAv: "anna"
                    },
                    sysPath: "/jas/loc2021",
                }

                window.CWASA.init(initCfg)

                // Check if avatar rendered
                setTimeout(() => {
                    const canvas = container.querySelector('canvas')
                    if (canvas || container.innerHTML.length > 100) {
                        setAvatarLoaded(true)
                        console.log('[PracticeMode] Avatar loaded successfully')
                    } else {
                        setAvatarError('Avatar failed to load. Try refreshing the page.')
                    }
                }, 2000)
            } catch (error) {
                console.error('[PracticeMode] Avatar init error:', error)
                setAvatarError('Avatar initialization failed')
            }
        }

        initAvatar()
    }, [])

    // Play sign function
    const playSign = async () => {
        if (!avatarLoaded || !gesture.word_or_phrase) return

        setIsPlaying(true)
        try {
            const word = gesture.word_or_phrase.toLowerCase().replace(/\\s+/g, '')
            const signFile = `/SignFiles/${word}.sigml`

            if (window.CWASA) {
                await window.CWASA.playSiGMLURL(signFile)
            }
        } catch (error) {
            console.error('[PracticeMode] Play error:', error)
        } finally {
            setTimeout(() => setIsPlaying(false), 3000)
        }
    }

    if (!lesson || !gesture) {
        return null
    }

    // Handle gesture detection from camera
    const handleGestureDetected = (landmarks: any, accuracy: number) => {
        // Update current attempt in real-time
        if (!currentAttempt) {
            const newAttempt: AttemptRecord = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                accuracy,
                feedback: generateFeedback(accuracy)
            }
            setCurrentAttempt(newAttempt)
        } else {
            // Update accuracy if better
            if (accuracy > currentAttempt.accuracy) {
                setCurrentAttempt({
                    ...currentAttempt,
                    accuracy,
                    feedback: generateFeedback(accuracy)
                })
            }
        }
    }

    // Save current attempt
    const saveAttempt = () => {
        if (!currentAttempt) return

        const newAttempts = [...attempts, currentAttempt]
        setAttempts(newAttempts)

        // Update statistics
        const scores = newAttempts.map(a => a.accuracy)
        setBestScore(Math.max(...scores))
        setAverageScore(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length))

        // Reset current attempt
        setCurrentAttempt(null)
    }

    // Generate feedback based on accuracy
    const generateFeedback = (accuracy: number): string[] => {
        const feedback: string[] = []

        if (accuracy >= 90) {
            feedback.push('🎉 Excellent! Your gesture is very accurate!')
            feedback.push('✅ Hand position is perfect')
            feedback.push('✅ Movement timing is spot on')
        } else if (accuracy >= 75) {
            feedback.push('👍 Good job! Just a few minor adjustments needed')
            feedback.push('⚠️ Try to match the hand position more closely')
        } else if (accuracy >= 60) {
            feedback.push('📚 Keep practicing! You are on the right track')
            feedback.push('⚠️ Focus on hand shape and orientation')
            feedback.push('💡 Watch the reference sign carefully')
        } else {
            feedback.push('🎯 Let us try again! Do not give up!')
            feedback.push('❌ Hand position needs adjustment')
            feedback.push('💡 Tip: Match the reference avatar movements')
        }

        return feedback
    }

    // Reset practice session
    const resetSession = () => {
        setAttempts([])
        setCurrentAttempt(null)
        setBestScore(0)
        setAverageScore(0)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700 active:scale-95 transition"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">Practice Mode</h1>
                            <p className="text-neutral-400 text-sm">
                                Practice: <span className="text-amber-400">{gesture.word_or_phrase}</span>
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl px-4 py-2">
                            <div className="text-xs text-neutral-400">Best Score</div>
                            <div className="text-xl font-bold text-green-400">{bestScore}%</div>
                        </div>
                        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl px-4 py-2">
                            <div className="text-xs text-neutral-400">Average</div>
                            <div className="text-xl font-bold text-blue-400">{averageScore}%</div>
                        </div>
                        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl px-4 py-2">
                            <div className="text-xs text-neutral-400">Attempts</div>
                            <div className="text-xl font-bold text-purple-400">{attempts.length}</div>
                        </div>
                    </div>
                </div>

                {/* Split Screen: Reference + Practice */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Left: Reference Sign */}
                    <Card className="p-6 bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                📖 Reference Sign
                            </h2>
                            <Button
                                onClick={playSign}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                disabled={!avatarLoaded || isPlaying}
                            >
                                {isPlaying ? (
                                    <>
                                        <Square size={16} />
                                        Playing...
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} />
                                        Play Sign
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Avatar Container */}
                        <div className="bg-neutral-950 rounded-xl overflow-hidden mb-4 relative" style={{ minHeight: '400px' }}>
                            {/* CWASA Avatar */}
                            <div className="CWASAAvatar av0" style={{
                                width: '100%',
                                height: '400px',
                                position: 'relative',
                                background: '#1a1a1a'
                            }} />

                            {/* Loading/Error Overlay */}
                            {!avatarLoaded && !avatarError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/90">
                                    <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mb-3"></div>
                                        <p className="text-sm text-neutral-400">Loading 3D avatar...</p>
                                    </div>
                                </div>
                            )}

                            {avatarError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/90">
                                    <div className="text-center px-4">
                                        <p className="text-red-400 text-sm mb-2">{avatarError}</p>
                                        <Button
                                            onClick={() => window.location.reload()}
                                            size="sm"
                                            variant="outline"
                                        >
                                            Refresh Page
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sign Info */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Word/Phrase:</span>
                                <span className="font-semibold">{gesture.word_or_phrase}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Complexity:</span>
                                <span className={`font-semibold ${gesture.complexity === 'simple' ? 'text-green-400' :
                                    gesture.complexity === 'moderate' ? 'text-yellow-400' :
                                        'text-red-400'
                                    }`}>
                                    {gesture.complexity}
                                </span>
                            </div>
                            {gesture.requires_both_hands && (
                                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-2 mt-2">
                                    <span className="text-blue-300 text-xs">👐 This sign requires both hands</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Right: Camera Practice */}
                    <div>
                        <GestureRecognition
                            targetSign={gesture.word_or_phrase}
                            onGestureDetected={handleGestureDetected}
                            showFeedback={true}
                        />

                        {/* Save Attempt Button */}
                        {currentAttempt && (
                            <Button
                                onClick={saveAttempt}
                                className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                                size="lg"
                            >
                                <CheckCircle2 className="mr-2" size={20} />
                                Save Attempt ({currentAttempt.accuracy}%)
                            </Button>
                        )}
                    </div>
                </div>

                {/* Real-time Feedback */}
                {currentAttempt && (
                    <Card className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-700/30 mb-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <TrendingUp size={18} className="text-purple-400" />
                            Real-time Feedback
                        </h3>
                        <div className="space-y-2">
                            {currentAttempt.feedback.map((item, idx) => (
                                <div key={idx} className="text-sm text-neutral-300">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Attempt History */}
                {attempts.length > 0 && (
                    <Card className="p-6 bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Award size={20} className="text-amber-400" />
                                Attempt History
                            </h2>
                            <Button onClick={resetSession} variant="outline" size="sm">
                                <RotateCcw size={16} className="mr-2" />
                                Reset Session
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {attempts.slice().reverse().map((attempt, idx) => (
                                <div
                                    key={attempt.id}
                                    className="bg-neutral-800/50 rounded-lg p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl font-bold text-neutral-500">
                                            #{attempts.length - idx}
                                        </div>
                                        <div>
                                            <div className="text-sm text-neutral-400">
                                                {new Date(attempt.timestamp).toLocaleTimeString()}
                                            </div>
                                            <div className="text-xs text-neutral-500 mt-1">
                                                {attempt.feedback[0]}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className={`text-2xl font-bold ${attempt.accuracy >= 80 ? 'text-green-400' :
                                                attempt.accuracy >= 60 ? 'text-yellow-400' :
                                                    'text-red-400'
                                                }`}>
                                                {attempt.accuracy}%
                                            </div>
                                            {attempt.accuracy === bestScore && (
                                                <div className="text-xs text-amber-400">🏆 Best</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Completion Achievement */}
                        {attempts.length >= 5 && bestScore >= 80 && (
                            <div className="mt-6 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/30 rounded-xl p-4 text-center">
                                <div className="text-3xl mb-2">🎉</div>
                                <div className="font-bold text-lg text-amber-300 mb-1">
                                    Congratulations!
                                </div>
                                <div className="text-sm text-neutral-300">
                                    You've mastered this sign with 5+ attempts and 80%+ accuracy!
                                </div>
                                <Button
                                    onClick={() => navigate(-1)}
                                    className="mt-4 bg-gradient-to-r from-amber-600 to-orange-600"
                                >
                                    Continue Learning
                                </Button>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    )
}

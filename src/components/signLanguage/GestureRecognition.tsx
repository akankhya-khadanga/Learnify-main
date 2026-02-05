/**
 * Gesture Recognition Component
 * 
 * Uses MediaPipe Hands for real-time hand tracking and gesture recognition
 * Provides visual feedback and accuracy scoring for sign language practice
 */

import { useEffect, useRef, useState } from 'react'
import { Camera } from '@mediapipe/camera_utils'
import { Hands, Results } from '@mediapipe/hands'
import { Hand, RotateCcw, Camera as CameraIcon, CameraOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface GestureRecognitionProps {
    targetSign?: string
    onGestureDetected?: (landmarks: any, accuracy: number) => void
    showFeedback?: boolean
    className?: string
}

export function GestureRecognition({
    targetSign,
    onGestureDetected,
    showFeedback = true,
    className = ''
}: GestureRecognitionProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isActive, setIsActive] = useState(false)
    const [error, setError] = useState<string>('')
    const [accuracy, setAccuracy] = useState<number>(0)
    const [handsDetected, setHandsDetected] = useState(0)
    const [isInitializing, setIsInitializing] = useState(false)

    const handsRef = useRef<Hands | null>(null)
    const cameraRef = useRef<Camera | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    // Initialize MediaPipe Hands
    useEffect(() => {
        if (!isActive || isInitializing) return

        const initializeHands = async () => {
            setIsInitializing(true)
            setError('')

            try {
                // Initialize Hands model
                const hands = new Hands({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
                    }
                })

                hands.setOptions({
                    maxNumHands: 2,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                })

                hands.onResults(onResults)

                handsRef.current = hands

                // Get camera access
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error('Camera access not supported in this browser')
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720, facingMode: 'user' }
                })

                streamRef.current = stream

                if (videoRef.current) {
                    videoRef.current.srcObject = stream

                    // Wait for video to be ready
                    await new Promise<void>((resolve) => {
                        if (videoRef.current) {
                            videoRef.current.onloadedmetadata = () => {
                                videoRef.current?.play()
                                resolve()
                            }
                        }
                    })

                    // Initialize camera processing
                    const camera = new Camera(videoRef.current, {
                        onFrame: async () => {
                            if (videoRef.current && handsRef.current) {
                                await handsRef.current.send({ image: videoRef.current })
                            }
                        },
                        width: 1280,
                        height: 720
                    })

                    await camera.start()
                    cameraRef.current = camera

                    console.log('[GestureRecognition] \u2713 Initialized successfully')
                }

                setIsInitializing(false)
            } catch (err: any) {
                console.error('[GestureRecognition] Initialization error:', err)
                setError(err.message || 'Failed to initialize camera')
                setIsInitializing(false)
                setIsActive(false)
            }
        }

        initializeHands()

        // Cleanup
        return () => {
            if (cameraRef.current) {
                cameraRef.current.stop()
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
            if (handsRef.current) {
                handsRef.current.close()
            }
        }
    }, [isActive])

    // Process hand landmarks
    const onResults = (results: Results) => {
        if (!canvasRef.current) return

        const canvasCtx = canvasRef.current.getContext('2d')
        if (!canvasCtx) return

        // Clear canvas
        canvasCtx.save()
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

        // Draw video frame
        if (results.image) {
            canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height)
        }

        // Detect hands
        const numHands = results.multiHandLandmarks ? results.multiHandLandmarks.length : 0
        setHandsDetected(numHands)

        // Draw hand landmarks
        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                drawHand(canvasCtx, landmarks)

                // Calculate accuracy if target sign is provided
                if (targetSign && onGestureDetected) {
                    const calculatedAccuracy = calculateAccuracy(landmarks)
                    setAccuracy(calculatedAccuracy)
                    onGestureDetected(landmarks, calculatedAccuracy)
                }
            }
        }

        canvasCtx.restore()
    }

    // Draw hand skeleton
    const drawHand = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
        // Hand skeleton connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index finger
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle finger
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring finger
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [5, 9], [9, 13], [13, 17] // Palm
        ]

        // Draw connections
        ctx.strokeStyle = '#00FF00'
        ctx.lineWidth = 2

        for (const [start, end] of connections) {
            const startPoint = landmarks[start]
            const endPoint = landmarks[end]

            ctx.beginPath()
            ctx.moveTo(startPoint.x * canvasRef.current!.width, startPoint.y * canvasRef.current!.height)
            ctx.lineTo(endPoint.x * canvasRef.current!.width, endPoint.y * canvasRef.current!.height)
            ctx.stroke()
        }

        // Draw landmarks
        ctx.fillStyle = '#FF0000'
        for (const landmark of landmarks) {
            ctx.beginPath()
            ctx.arc(
                landmark.x * canvasRef.current!.width,
                landmark.y * canvasRef.current!.height,
                5,
                0,
                2 * Math.PI
            )
            ctx.fill()
        }
    }

    // Calculate gesture accuracy (simplified - would need reference data in production)
    const calculateAccuracy = (landmarks: any[]): number => {
        // This is a placeholder - in production, you would compare against reference gesture data
        // using Dynamic Time Warping (DTW) or similar algorithms

        // For now, return a mock accuracy based on hand detection
        return Math.floor(60 + Math.random() * 40) // 60-100% range
    }

    const toggleCamera = async () => {
        if (isActive) {
            // Stop camera
            if (cameraRef.current) {
                cameraRef.current.stop()
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
            setIsActive(false)
        } else {
            // Start camera
            setIsActive(true)
        }
    }

    return (
        <Card className={`p-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Hand className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">Gesture Recognition</h3>
                </div>
                <Button
                    onClick={toggleCamera}
                    variant={isActive ? 'destructive' : 'default'}
                    size="sm"
                    disabled={isInitializing}
                    className="gap-2"
                >
                    {isActive ? (
                        <>
                            <CameraOff className="h-4 w-4" />
                            Stop Camera
                        </>
                    ) : (
                        <>
                            <CameraIcon className="h-4 w-4" />
                            Start Camera
                        </>
                    )}
                </Button>
            </div>

            {/* Camera View */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {/* Hidden video element */}
                <video
                    ref={videoRef}
                    className="hidden"
                    playsInline
                />

                {/* Canvas for drawing landmarks */}
                <canvas
                    ref={canvasRef}
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover"
                />

                {/* Status overlay */}
                {!isActive && !isInitializing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                        <div className="text-center text-white">
                            <CameraIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">Click "Start Camera" to begin practice</p>
                        </div>
                    </div>
                )}

                {isInitializing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                        <div className="text-center text-white">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-3"></div>
                            <p className="text-sm">Initializing camera...</p>
                        </div>
                    </div>
                )}

                {/* Feedback overlay */}
                {showFeedback && isActive && (
                    <div className="absolute top-4 left-4 right-4">
                        {/* Hands detected */}
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm mb-2">
                            <div className="flex items-center justify-between">
                                <span>Hands Detected:</span>
                                <span className="font-bold text-lg">{handsDetected}/2</span>
                            </div>
                        </div>

                        {/* Accuracy (if target sign provided) */}
                        {targetSign && accuracy > 0 && (
                            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm">Accuracy:</span>
                                    <span className={`font-bold text-lg ${accuracy >= 80 ? 'text-green-400' :
                                        accuracy >= 60 ? 'text-yellow-400' :
                                            'text-red-400'
                                        }`}>
                                        {accuracy}%
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${accuracy >= 80 ? 'bg-green-500' :
                                            accuracy >= 60 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}
                                        style={{ width: `${accuracy}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Instructions */}
            {isActive && handsDetected === 0 && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-700 text-sm">
                    👋 Position your hands in front of the camera to begin
                </div>
            )}
        </Card>
    )
}

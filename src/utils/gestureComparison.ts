/**
 * Dynamic Time Warping (DTW) Algorithm
 * 
 * Used for comparing two gesture sequences to calculate similarity/accuracy
 * Handles temporal variations in gesture performance
 */

import type { MotionFrame, PoseKeypoint, HandLandmark } from '@/types/signLanguage'

interface DTWResult {
    distance: number
    similarity: number // 0-100%
    path: number[][]
    alignedFrames: { ref: number; test: number }[]
}

/**
 * Calculate Euclidean distance between two 3D points
 */
function euclideanDistance3D(
    p1: { x: number; y: number; z: number },
    p2: { x: number; y: number; z: number }
): number {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const dz = p2.z - p1.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Calculate distance between two pose keypoint sets
 */
function poseKeypointsDistance(keypoints1: PoseKeypoint[], keypoints2: PoseKeypoint[]): number {
    if (keypoints1.length !== keypoints2.length) {
        return Infinity
    }

    let totalDistance = 0
    let count = 0

    for (let i = 0; i < keypoints1.length; i++) {
        const kp1 = keypoints1[i]
        const kp2 = keypoints2[i]

        // Weight by visibility
        const weight = Math.min(kp1.visibility, kp2.visibility)
        if (weight > 0.5) {
            totalDistance += euclideanDistance3D(kp1, kp2) * weight
            count++
        }
    }

    return count > 0 ? totalDistance / count : Infinity
}

/**
 * Calculate distance between two hand landmark sets
 */
function handLandmarksDistance(landmarks1: HandLandmark[], landmarks2: HandLandmark[]): number {
    if (landmarks1.length !== landmarks2.length) {
        return Infinity
    }

    let totalDistance = 0
    let count = 0

    for (let i = 0; i < landmarks1.length; i++) {
        const lm1 = landmarks1[i]
        const lm2 = landmarks2[i]

        // Weight by confidence
        const weight = Math.min(lm1.confidence, lm2.confidence)
        if (weight > 0.5) {
            totalDistance += euclideanDistance3D(lm1, lm2) * weight
            count++
        }
    }

    return count > 0 ? totalDistance / count : Infinity
}

/**
 * Calculate distance between two motion frames
 */
function frameDistance(frame1: MotionFrame, frame2: MotionFrame): number {
    let distance = 0
    let components = 0

    // Compare pose keypoints
    const poseDistance = poseKeypointsDistance(frame1.keypoints, frame2.keypoints)
    if (poseDistance !== Infinity) {
        distance += poseDistance * 0.3 // 30% weight
        components++
    }

    // Compare left hand
    if (frame1.hand_left && frame2.hand_left) {
        const leftHandDistance = handLandmarksDistance(frame1.hand_left, frame2.hand_left)
        if (leftHandDistance !== Infinity) {
            distance += leftHandDistance * 0.35 // 35% weight
            components++
        }
    }

    // Compare right hand
    if (frame1.hand_right && frame2.hand_right) {
        const rightHandDistance = handLandmarksDistance(frame1.hand_right, frame2.hand_right)
        if (rightHandDistance !== Infinity) {
            distance += rightHandDistance * 0.35 // 35% weight
            components++
        }
    }

    return components > 0 ? distance / components : Infinity
}

/**
 * Dynamic Time Warping algorithm for gesture comparison
 * 
 * @param reference - Reference gesture sequence (ground truth)
 * @param test - Test gesture sequence (user's attempt)
 * @returns DTW result with distance, similarity, and alignment path
 */
export function calculateDTW(reference: MotionFrame[], test: MotionFrame[]): DTWResult {
    const n = reference.length
    const m = test.length

    // Initialize DTW matrix
    const dtw: number[][] = Array(n + 1).fill(null).map(() =>
        Array(m + 1).fill(Infinity)
    )
    dtw[0][0] = 0

    // Fill DTW matrix
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            const cost = frameDistance(reference[i - 1], test[j - 1])

            dtw[i][j] = cost + Math.min(
                dtw[i - 1][j],     // insertion
                dtw[i][j - 1],     // deletion
                dtw[i - 1][j - 1]  // match
            )
        }
    }

    // Get final distance
    const distance = dtw[n][m]

    // Backtrack to find alignment path
    const path: number[][] = []
    const alignedFrames: { ref: number; test: number }[] = []

    let i = n
    let j = m

    while (i > 0 && j > 0) {
        path.unshift([i - 1, j - 1])
        alignedFrames.unshift({ ref: i - 1, test: j - 1 })

        // Find which direction gave minimum
        const costs = [
            dtw[i - 1][j],     // insertion
            dtw[i][j - 1],     // deletion
            dtw[i - 1][j - 1]  // match
        ]
        const minIdx = costs.indexOf(Math.min(...costs))

        if (minIdx === 0) {
            i--
        } else if (minIdx === 1) {
            j--
        } else {
            i--
            j--
        }
    }

    // Convert distance to similarity percentage
    // Lower distance = higher similarity
    // Normalize based on sequence length
    const maxDistance = Math.max(n, m) * 0.5 // Empirical max
    const normalizedDistance = Math.min(distance / maxDistance, 1.0)
    const similarity = Math.round((1 - normalizedDistance) * 100)

    return {
        distance,
        similarity: Math.max(0, Math.min(100, similarity)),
        path,
        alignedFrames
    }
}

/**
 * Calculate similarity between two gesture sequences
 * Simplified version that returns just the similarity percentage
 */
export function calculateGestureSimilarity(
    reference: MotionFrame[],
    test: MotionFrame[]
): number {
    const result = calculateDTW(reference, test)
    return result.similarity
}

/**
 * Provide detailed feedback based on DTW comparison
 */
export function getGestureFeedback(
    reference: MotionFrame[],
    test: MotionFrame[],
    similarity: number
): {
    overall: string
    handPosition: string
    timing: string
    suggestions: string[]
} {
    const feedback = {
        overall: '',
        handPosition: '',
        timing: '',
        suggestions: [] as string[]
    }

    // Overall assessment
    if (similarity >= 90) {
        feedback.overall = 'Excellent! Nearly perfect gesture.'
    } else if (similarity >= 75) {
        feedback.overall = 'Good job! Minor improvements needed.'
    } else if (similarity >= 60) {
        feedback.overall = 'Fair attempt. Keep practicing!'
    } else {
        feedback.overall = 'Needs work. Review the reference carefully.'
    }

    // Hand position analysis
    const handAccuracy = analyzeHandAccuracy(reference, test)
    if (handAccuracy >= 80) {
        feedback.handPosition = 'Hand positions are accurate.'
    } else if (handAccuracy >= 60) {
        feedback.handPosition = 'Hand positions need slight adjustment.'
    } else {
        feedback.handPosition = 'Hand positions need significant improvement.'
        feedback.suggestions.push('Focus on matching hand shapes exactly')
    }

    // Timing analysis
    const timingRatio = test.length / reference.length
    if (timingRatio > 1.5) {
        feedback.timing = 'Too slow - try to match the reference speed.'
        feedback.suggestions.push('Speed up your gesture')
    } else if (timingRatio < 0.7) {
        feedback.timing = 'Too fast - slow down for clarity.'
        feedback.suggestions.push('Slow down and be more deliberate')
    } else {
        feedback.timing = 'Timing is good.'
    }

    // General suggestions
    if (similarity < 75) {
        feedback.suggestions.push('Watch the reference sign multiple times')
        feedback.suggestions.push('Break down the gesture into smaller parts')
    }

    return feedback
}

/**
 * Analyze hand position accuracy
 */
function analyzeHandAccuracy(reference: MotionFrame[], test: MotionFrame[]): number {
    if (reference.length === 0 || test.length === 0) return 0

    let totalAccuracy = 0
    let count = 0

    // Sample frames evenly
    const sampleCount = Math.min(reference.length, test.length, 10)
    for (let i = 0; i < sampleCount; i++) {
        const refIdx = Math.floor((i / sampleCount) * reference.length)
        const testIdx = Math.floor((i / sampleCount) * test.length)

        const refFrame = reference[refIdx]
        const testFrame = test[testIdx]

        // Calculate hand landmark distance
        if (refFrame.hand_left && testFrame.hand_left) {
            const distance = handLandmarksDistance(refFrame.hand_left, testFrame.hand_left)
            totalAccuracy += Math.max(0, 1 - distance) * 100
            count++
        }

        if (refFrame.hand_right && testFrame.hand_right) {
            const distance = handLandmarksDistance(refFrame.hand_right, testFrame.hand_right)
            totalAccuracy += Math.max(0, 1 - distance) * 100
            count++
        }
    }

    return count > 0 ? totalAccuracy / count : 0
}

/**
 * WebRTC Service
 * Handles peer-to-peer connections for audio/video calling
 */

export interface PeerConnectionConfig {
    iceServers: RTCIceServer[];
}

export interface MediaStreamConfig {
    audio: boolean;
    video: boolean | MediaTrackConstraints;
}

export class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private iceCandidateBuffer: RTCIceCandidateInit[] = []; // Buffer for early ICE candidates

    private readonly config: PeerConnectionConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    /**
     * Initialize WebRTC peer connection
     */
    initializePeerConnection(
        onIceCandidate: (candidate: RTCIceCandidate) => void,
        onTrack: (stream: MediaStream) => void
    ): RTCPeerConnection {
        this.peerConnection = new RTCPeerConnection(this.config);

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                onIceCandidate(event.candidate);
            }
        };

        // Handle incoming media tracks
        this.peerConnection.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                this.remoteStream = event.streams[0];
                onTrack(event.streams[0]);
            }
        };

        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection?.connectionState);
        };

        // Flush buffered ICE candidates
        if (this.iceCandidateBuffer.length > 0) {
            console.log(`[WebRTC] Flushing ${this.iceCandidateBuffer.length} buffered ICE candidates`);
            this.iceCandidateBuffer.forEach((candidate) => {
                this.peerConnection!.addIceCandidate(new RTCIceCandidate(candidate))
                    .catch((err) => console.error('[WebRTC] Error adding buffered ICE candidate:', err));
            });
            this.iceCandidateBuffer = [];
        }

        return this.peerConnection;
    }

    /**
     * Get local media stream (camera/microphone)
     */
    async getLocalStream(config: MediaStreamConfig): Promise<MediaStream> {
        try {
            const constraints: MediaStreamConstraints = {
                audio: config.audio,
                video: config.video,
            };

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            return this.localStream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw new Error('Failed to access camera/microphone. Please check permissions.');
        }
    }

    /**
     * Add local stream to peer connection
     */
    addLocalStream(stream: MediaStream): void {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized');
        }

        stream.getTracks().forEach((track) => {
            this.peerConnection!.addTrack(track, stream);
        });
    }

    /**
     * Create SDP offer
     */
    async createOffer(): Promise<RTCSessionDescriptionInit> {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized');
        }

        const offer = await this.peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
        });

        await this.peerConnection.setLocalDescription(offer);
        return offer;
    }

    /**
     * Create SDP answer
     */
    async createAnswer(): Promise<RTCSessionDescriptionInit> {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized');
        }

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        return answer;
    }

    /**
     * Set remote description
     */
    async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized');
        }

        await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(description)
        );
    }

    /**
     * Add ICE candidate
     */
    async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
        if (!this.peerConnection) {
            // Buffer candidates that arrive before peer connection is initialized
            console.log('[WebRTC] Buffering ICE candidate (peer connection not ready yet)');
            this.iceCandidateBuffer.push(candidate);
            return;
        }

        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error('[WebRTC] Error adding ICE candidate:', error);
        }
    }

    /**
     * Toggle audio track
     */
    toggleAudio(enabled?: boolean): boolean {
        if (!this.localStream) return false;

        const audioTracks = this.localStream.getAudioTracks();
        if (audioTracks.length === 0) return false;

        const newState = enabled !== undefined ? enabled : !audioTracks[0].enabled;
        audioTracks.forEach((track) => {
            track.enabled = newState;
        });

        return newState;
    }

    /**
     * Toggle video track
     */
    toggleVideo(enabled?: boolean): boolean {
        if (!this.localStream) return false;

        const videoTracks = this.localStream.getVideoTracks();
        if (videoTracks.length === 0) return false;

        const newState = enabled !== undefined ? enabled : !videoTracks[0].enabled;
        videoTracks.forEach((track) => {
            track.enabled = newState;
        });

        return newState;
    }

    /**
     * Get screen share stream
     */
    async getScreenStream(): Promise<MediaStream> {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                } as any,
                audio: false,
            });

            return stream;
        } catch (error) {
            console.error('Error accessing screen share:', error);
            throw new Error('Failed to start screen sharing');
        }
    }

    /**
     * Replace video track with screen share
     */
    async startScreenShare(): Promise<MediaStream> {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized');
        }

        const screenStream = await this.getScreenStream();
        const screenTrack = screenStream.getVideoTracks()[0];

        // Find the sender for video track
        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find((sender) => sender.track?.kind === 'video');

        if (videoSender) {
            await videoSender.replaceTrack(screenTrack);
        }

        // Handle screen share stop
        screenTrack.onended = () => {
            this.stopScreenShare();
        };

        return screenStream;
    }

    /**
     * Stop screen sharing and return to camera
     */
    async stopScreenShare(): Promise<void> {
        if (!this.peerConnection || !this.localStream) return;

        const videoTrack = this.localStream.getVideoTracks()[0];

        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find((sender) => sender.track?.kind === 'video');

        if (videoSender && videoTrack) {
            await videoSender.replaceTrack(videoTrack);
        }
    }

    /**
     * Get connection stats
     */
    async getConnectionStats(): Promise<RTCStatsReport> {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized');
        }

        return await this.peerConnection.getStats();
    }

    /**
     * Close connection and cleanup
     */
    cleanup(): void {
        // Stop all local stream tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
        }

        // Stop all remote stream tracks
        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach((track) => track.stop());
            this.remoteStream = null;
        }

        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        // Clear ICE candidate buffer
        this.iceCandidateBuffer = [];
    }

    /**
     * Get local stream
     */
    getLocalStreamInstance(): MediaStream | null {
        return this.localStream;
    }

    /**
     * Get remote stream
     */
    getRemoteStreamInstance(): MediaStream | null {
        return this.remoteStream;
    }
}

// Singleton instance
export const webrtcService = new WebRTCService();

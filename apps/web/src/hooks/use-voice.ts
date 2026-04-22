import { useState, useEffect, useCallback, useRef } from 'react';
import { Room, createLocalAudioTrack } from 'livekit-client';
import { voiceApi } from '@/lib/api';

export const useVoice = (roomName: string, getToken: () => Promise<string | null>) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState('');
    const [isAiTalking, setIsAiTalking] = useState(false);

    const roomRef = useRef<Room | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const disconnect = useCallback(() => {
        if (roomRef.current) {
            roomRef.current.disconnect();
            roomRef.current = null;
        }
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const connect = useCallback(async () => {
        try {
            setIsConnecting(true);
            disconnect();

            // 1. Get LiveKit Token
            const { token } = await voiceApi.getToken(roomName, getToken);
            const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

            if (!livekitUrl) {
                throw new Error("LiveKit URL is not configured (NEXT_PUBLIC_LIVEKIT_URL)");
            }

            const room = new Room();
            roomRef.current = room;

            await room.connect(livekitUrl, token);
            setIsConnected(true);

            // 2. Start local audio
            const track = await createLocalAudioTrack();
            await room.localParticipant.publishTrack(track);

            // 3. Connect Deepgram via WebSocket (direct browser-to-deepgram)
            const dgApiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
            console.log('[useVoice] Deepgram API Key present:', !!dgApiKey);

            if (dgApiKey) {
                const socket = new WebSocket('wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', [
                    'token',
                    dgApiKey,
                ]);

                socket.onopen = () => {
                    console.log('[useVoice] Deepgram Socket Open');
                    // Construction of a MediaStream from the track to ensure compatibility
                    const ms = new MediaStream([track.mediaStreamTrack!]);
                    const mediaRecorder = new MediaRecorder(ms);
                    mediaRecorderRef.current = mediaRecorder;
                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0 && socket.readyState === 1) {
                            socket.send(event.data);
                        }
                    };
                    mediaRecorder.start(250); // Increased timeslice for stability
                };

                socket.onmessage = (message) => {
                    const received = JSON.parse(message.data);
                    const result = received.channel?.alternatives?.[0]?.transcript;
                    if (result && received.is_final) {
                        console.log('[useVoice] Transcript Received:', result);
                        setTranscript(prev => prev + ' ' + result);
                    }
                };

                socket.onerror = (err) => {
                    console.error('[useVoice] Deepgram Socket Error:', err);
                };

                socket.onclose = () => {
                    console.log('[useVoice] Deepgram Socket Closed');
                };

                socketRef.current = socket;
            } else {
                console.warn('[useVoice] Deepgram API Key is missing - transcription will not work.');
            }

        } catch (err: any) {
            console.error('Voice connection error:', err);
            setError(err.message || 'Failed to connect to voice services');
        } finally {
            setIsConnecting(false);
        }
    }, [roomName, getToken, disconnect]);

    const speak = useCallback(async (text: string) => {
        if (!text) return;

        try {
            setIsAiTalking(true);
            const blob = await voiceApi.getTTS(text, getToken);
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            audio.onended = () => {
                setIsAiTalking(false);
                URL.revokeObjectURL(url);
            };

            await audio.play();
        } catch (err) {
            console.error('TTS error:', err);
            setIsAiTalking(false);
        }
    }, [getToken]);

    useEffect(() => {
        return () => disconnect();
    }, [disconnect]);

    return {
        connect,
        disconnect,
        isConnected,
        isConnecting,
        error,
        transcript,
        setTranscript,
        speak,
        isAiTalking
    };
};

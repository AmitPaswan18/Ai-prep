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
    const localTrackRef = useRef<any>(null);
    const isAiTalkingRef = useRef(false);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    // Monotonic speak-call counter — lets us cancel stale speak() calls
    const speakVersionRef = useRef(0);
    // Store getToken in a ref so connect/speak useCallbacks stay stable
    // (Clerk returns a new getToken reference every render which would otherwise
    //  cause infinite reconnect loops if included in dependency arrays)
    const getTokenRef = useRef(getToken);
    useEffect(() => { getTokenRef.current = getToken; }, [getToken]);

    useEffect(() => {
        isAiTalkingRef.current = isAiTalking;
        // Toggle dedicated-mic stream enabled state so Deepgram ignores AI audio
        if (micStreamRef.current) {
            micStreamRef.current.getAudioTracks().forEach(t => {
                t.enabled = !isAiTalking;
            });
        }
    }, [isAiTalking]);

    const disconnect = useCallback(() => {
        if (currentAudioRef.current) {
            try {
                currentAudioRef.current.pause();
                currentAudioRef.current.src = '';
            } catch (_) { }
            currentAudioRef.current = null;
        }
        if (mediaRecorderRef.current) {
            try { mediaRecorderRef.current.stop(); } catch (_) { }
            mediaRecorderRef.current = null;
        }
        if (micStreamRef.current) {
            try { micStreamRef.current.getTracks().forEach(t => t.stop()); } catch (_) { }
            micStreamRef.current = null;
        }
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        if (localTrackRef.current) {
            try { localTrackRef.current.stop(); } catch (_) { }
            localTrackRef.current = null;
        }
        if (roomRef.current) {
            roomRef.current.disconnect();
            roomRef.current = null;
        }
        speakVersionRef.current += 1; // cancel any in-flight speak
        setIsAiTalking(false);
        setIsConnected(false);
    }, []);

    const connect = useCallback(async () => {
        try {
            setIsConnecting(true);
            disconnect();
            setError(null);

            // 1. LiveKit (Optional connection - fail silently to let Deepgram work)
            try {
                const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
                if (livekitUrl) {
                    const { token } = await voiceApi.getToken(roomName, getTokenRef.current);
                    const room = new Room();
                    roomRef.current = room;
                    await room.connect(livekitUrl, token);
                    
                    const track = await createLocalAudioTrack({
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    });
                    localTrackRef.current = track;
                    await room.localParticipant.publishTrack(track);
                    console.log('[useVoice] Connected to LiveKit successfully');
                }
            } catch (lkErr) {
                console.warn('[useVoice] LiveKit connection failed (continuing to Deepgram STT):', lkErr);
            }

            // 2. Deepgram — dedicated separate mic stream
            const dgApiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
            if (!dgApiKey) {
                console.warn('[useVoice] Deepgram API Key missing — transcription disabled');
                setError('Deepgram API key is missing. Transcription disabled.');
                return;
            }

            const socket = new WebSocket(
                'wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&endpointing=800',
                ['token', dgApiKey]
            );
            socketRef.current = socket;

            socket.onopen = async () => {
                try {
                    const micStream = await navigator.mediaDevices.getUserMedia({
                        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
                    });
                    micStreamRef.current = micStream;

                    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                        ? 'audio/webm;codecs=opus'
                        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
                            ? 'audio/ogg;codecs=opus'
                            : 'audio/webm';

                    const mr = new MediaRecorder(micStream, { mimeType });
                    mediaRecorderRef.current = mr;

                    mr.ondataavailable = (e) => {
                        if (e.data.size > 0 && socket.readyState === WebSocket.OPEN && !isAiTalkingRef.current) {
                            socket.send(e.data);
                        }
                    };
                    mr.start(250);
                    
                    // Mark voice input as connected when socket opens and mic is listening
                    setIsConnected(true);
                } catch (micErr: any) {
                    console.error('[useVoice] Mic capture failed:', micErr);
                    setError(micErr.message || 'Microphone access denied or failed.');
                    setIsConnected(false);
                    disconnect();
                }
            };

            socket.onmessage = (msg) => {
                const data = JSON.parse(msg.data);
                const text = data.channel?.alternatives?.[0]?.transcript;
                if (text && data.is_final) {
                    setTranscript(prev => (prev + ' ' + text).trim());
                }
            };

            socket.onerror = (e) => {
                console.error('[useVoice] Deepgram error:', e);
                setError('Deepgram connection error.');
            };
            socket.onclose = () => {
                console.log('[useVoice] Deepgram closed');
                setIsConnected(false);
            };

        } catch (err: any) {
            console.error('[useVoice] connect error:', err);
            setError(err.message || 'Failed to connect to voice services');
            setIsConnected(false);
        } finally {
            setIsConnecting(false);
        }
    }, [roomName, disconnect]);

    /**
     * speak() — returns a Promise that resolves when audio finishes playing.
     * A new call to speak() automatically cancels any previous in-flight call.
     */
    const speak = useCallback(async (text: string): Promise<void> => {
        if (!text) return;

        // Bump version to invalidate older calls
        speakVersionRef.current += 1;
        const myVersion = speakVersionRef.current;

        // Stop anything currently playing
        if (currentAudioRef.current) {
            try {
                currentAudioRef.current.pause();
                currentAudioRef.current.src = '';
            } catch (_) { }
            currentAudioRef.current = null;
        }

        setIsAiTalking(true);

        try {
            const blob = await voiceApi.getTTS(text, getTokenRef.current);

            // If a newer speak() call arrived while we were fetching TTS, bail out
            if (speakVersionRef.current !== myVersion) return;

            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            currentAudioRef.current = audio;

            return new Promise<void>((resolve) => {
                audio.onended = () => {
                    URL.revokeObjectURL(url);
                    if (speakVersionRef.current === myVersion) {
                        setIsAiTalking(false);
                        currentAudioRef.current = null;
                    }
                    resolve();
                };
                audio.onerror = () => {
                    URL.revokeObjectURL(url);
                    if (speakVersionRef.current === myVersion) {
                        setIsAiTalking(false);
                        currentAudioRef.current = null;
                    }
                    resolve();
                };
                audio.play().catch(() => {
                    if (speakVersionRef.current === myVersion) setIsAiTalking(false);
                    resolve();
                });
            });
        } catch (err) {
            console.error('[useVoice] TTS error:', err);
            if (speakVersionRef.current === myVersion) setIsAiTalking(false);
        }
    }, []);

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
        isAiTalking,
    };
};

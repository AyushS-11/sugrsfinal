import { useState, useEffect, useRef, useCallback } from 'react';

// ─── WebSocket Hook ────────────────────────────────────
export function useWebSocket(onMessage) {
    const [connected, setConnected] = useState(false);
    const wsRef = useRef(null);
    const reconnectTimer = useRef(null);

    const connect = useCallback(() => {
        try {
            const ws = new WebSocket(`ws://${window.location.hostname}:8080`);
            wsRef.current = ws;
            ws.onopen = () => setConnected(true);
            ws.onclose = () => {
                setConnected(false);
                reconnectTimer.current = setTimeout(connect, 3000);
            };
            ws.onerror = () => ws.close();
            ws.onmessage = (e) => {
                try { onMessage(JSON.parse(e.data)); } catch { }
            };
        } catch { }
    }, [onMessage]);

    useEffect(() => {
        connect();
        return () => {
            clearTimeout(reconnectTimer.current);
            wsRef.current?.close();
        };
    }, [connect]);

    return { connected };
}

// ─── Speech Input Hook ─────────────────────────────────
export function useSpeechInput(onResult) {
    const [listening, setListening] = useState(false);
    const recogRef = useRef(null);
    const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    useEffect(() => {
        if (!supported) return;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const r = new SR();
        r.continuous = true;
        r.interimResults = true;
        r.lang = 'en-IN';
        r.onresult = (e) => {
            const text = Array.from(e.results).map(r => r[0].transcript).join('');
            onResult(text);
        };
        r.onend = () => setListening(false);
        recogRef.current = r;
    }, [supported]);

    const start = () => { recogRef.current?.start(); setListening(true); };
    const stop = () => { recogRef.current?.stop(); setListening(false); };

    return { listening, start, stop, supported };
}

// ─── Animated Counter Hook ─────────────────────────────
export function useAnimatedCounter(target, duration = 800) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        const start = Date.now();
        const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            setValue(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [target, duration]);
    return value;
}

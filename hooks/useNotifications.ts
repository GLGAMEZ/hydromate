
import { useCallback, useRef } from 'react';

export const useNotifications = () => {
    const reminderIntervalId = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const playSound = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const audioContext = audioContextRef.current;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 pitch
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    }, []);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            console.error('This browser does not support desktop notification');
            return;
        }
        if (Notification.permission !== 'granted') {
            await Notification.requestPermission();
        }
    }, []);

    const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (Notification.permission === 'granted') {
            new Notification(title, { ...options, icon: '/icons/icon-192x192.png', badge: '/icons/icon-192x192.png' });
            playSound();
        }
    }, [playSound]);

    const clearReminder = useCallback(() => {
        if (reminderIntervalId.current) {
            clearInterval(reminderIntervalId.current);
            reminderIntervalId.current = null;
        }
    }, []);

    const setupReminder = useCallback((intervalMinutes: number) => {
        clearReminder();
        if (intervalMinutes > 0) {
            const intervalMilliseconds = intervalMinutes * 60 * 1000;
            reminderIntervalId.current = window.setInterval(() => {
                sendNotification('💧 Time to Hydrate!', {
                    body: "Don't forget to drink some water.",
                });
            }, intervalMilliseconds);
        }
    }, [sendNotification, clearReminder]);

    return { requestPermission, sendNotification, setupReminder, clearReminder };
};

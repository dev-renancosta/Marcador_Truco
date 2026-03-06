import { useRef, useEffect, useCallback } from 'react';

export function useAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AC();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Init Audio on first interaction (iOS requirement)
  useEffect(() => {
    const initAudio = () => {
      getCtx();
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('touchstart', initAudio, { passive: true });
    document.addEventListener('click', initAudio);
    return () => {
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('click', initAudio);
    };
  }, [getCtx]);

  const playSound = useCallback((type: 'point' | 'win') => {
    try {
      const ctx = getCtx();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === 'point') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.1);
      } else {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.error('Audio error', e);
    }
  }, [getCtx]);

  return { playSound };
}

import React, { useRef, useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Team, TeamState } from '../types';
import { DANGER_THRESHOLD, WIN_POINTS } from '../constants';

interface TeamAreaProps {
    team: Team;
    data: TeamState;
    onAdd: (p: number) => void;
    isWinner: boolean;
    inverted?: boolean;
}

export function TeamArea({ team, data, onAdd, isWinner, inverted = false }: TeamAreaProps) {
    const colorAccent = team === 'us' ? '#00ff9c' : '#ff3b3b';
    const colorClass = team === 'us' ? 'text-[#00ff9c]' : 'text-[#ff3b3b]';
    const bgClass = team === 'us' ? 'bg-[#00ff9c]' : 'bg-[#ff3b3b]';
    const isDanger = data.points >= DANGER_THRESHOLD;
    const progress = Math.min(data.points / WIN_POINTS, 1);

    // Gesture refs — only for the score zone
    const touchStartY = useRef(0);
    const lastTap = useRef(0);

    // Gesture onboarding
    const [showGestureHint, setShowGestureHint] = useState(false);

    useEffect(() => {
        if (!inverted) {
            const seen = localStorage.getItem('truco_gesture_hint_seen');
            if (!seen) {
                setShowGestureHint(true);
            }
        }
    }, [inverted]);

    const dismissHint = () => {
        setShowGestureHint(false);
        localStorage.setItem('truco_gesture_hint_seen', 'true');
    };

    // Button flash state
    const [flashBtn, setFlashBtn] = useState<number | null>(null);

    const handleBtnClick = (points: number) => {
        setFlashBtn(points);
        setTimeout(() => setFlashBtn(null), 150);
        onAdd(points);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
        if (showGestureHint) dismissHint();
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY.current - touchEndY;

        if (Math.abs(diff) > 50) {
            if (diff > 0) onAdd(1);
            else onAdd(-1);
        } else {
            const now = Date.now();
            if (now - lastTap.current < 300) {
                onAdd(3);
                lastTap.current = 0;
            } else {
                lastTap.current = now;
            }
        }
    };

    const header = (
        <div className={`flex justify-between items-center ${inverted ? 'landscape:flex-row-reverse' : ''}`}>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${colorClass}`}>{data.name}</h2>
            <div className="flex items-center gap-2 bg-[#151515] px-3 py-1.5 rounded-full border border-[#333]">
                <Trophy size={14} className={colorClass} />
                <span className="font-bold text-lg">{data.wins}</span>
            </div>
        </div>
    );

    const progressBar = (
        <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden mt-2">
            <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: colorAccent }}
                initial={{ width: 0 }}
                animate={{
                    width: `${progress * 100}%`,
                    opacity: isDanger ? [0.7, 1, 0.7] : 1,
                }}
                transition={isDanger
                    ? { width: { type: 'spring', stiffness: 300, damping: 25 }, opacity: { duration: 1, repeat: Infinity } }
                    : { type: 'spring', stiffness: 300, damping: 25 }
                }
            />
        </div>
    );

    const btnBase = "font-bold active:scale-90 transition-all duration-100 border border-[#333]";

    const buttons = (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2 h-14 sm:h-16">
                <button
                    onClick={() => handleBtnClick(-1)}
                    className={`w-14 sm:w-16 rounded-2xl bg-[#151515] text-[#ff3b3b] text-2xl ${btnBase} ${flashBtn === -1 ? 'brightness-150' : ''}`}
                >
                    −1
                </button>
                <button
                    onClick={() => handleBtnClick(1)}
                    className={`flex-1 rounded-2xl ${bgClass} text-black font-black text-3xl sm:text-4xl active:scale-90 transition-all duration-100 shadow-lg ${flashBtn === 1 ? 'brightness-125 shadow-xl' : ''}`}
                    style={flashBtn === 1 ? { boxShadow: `0 0 25px ${colorAccent}44` } : {}}
                >
                    +1
                </button>
                <button
                    onClick={() => handleBtnClick(3)}
                    className={`w-14 sm:w-16 rounded-2xl bg-[#151515] text-white text-2xl ${btnBase} ${flashBtn === 3 ? 'brightness-150' : ''}`}
                >
                    +3
                </button>
            </div>
            <div className="flex gap-2 h-12 sm:h-14">
                <button
                    onClick={() => handleBtnClick(6)}
                    className={`flex-1 rounded-xl bg-[#151515] text-gray-300 text-lg sm:text-xl ${btnBase} ${flashBtn === 6 ? 'brightness-150' : ''}`}
                >
                    +6
                </button>
                <button
                    onClick={() => handleBtnClick(9)}
                    className={`flex-1 rounded-xl bg-[#151515] text-gray-300 text-lg sm:text-xl ${btnBase} ${flashBtn === 9 ? 'brightness-150' : ''}`}
                >
                    +9
                </button>
                <button
                    onClick={() => handleBtnClick(12)}
                    className={`flex-1 rounded-xl bg-[#151515] text-gray-300 text-lg sm:text-xl ${btnBase} ${flashBtn === 12 ? 'brightness-150' : ''}`}
                >
                    +12
                </button>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: inverted ? -30 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`flex-1 flex ${inverted ? 'flex-col-reverse' : 'flex-col'} relative overflow-hidden
        ${inverted ? 'border-b landscape:border-b-0 landscape:border-r border-[#333]' : ''}
        ${isWinner ? 'bg-white/5' : ''} transition-colors duration-500`}
            style={{
                paddingTop: inverted ? 'max(0.75rem, env(safe-area-inset-top))' : '0.75rem',
                paddingBottom: inverted ? '0.75rem' : 'max(0.75rem, env(safe-area-inset-bottom))',
                paddingLeft: 'max(1rem, env(safe-area-inset-left))',
                paddingRight: 'max(1rem, env(safe-area-inset-right))',
            }}
        >
            {/* Danger glow when close to winning */}
            {isDanger && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.15, 0.35, 0.15] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `radial-gradient(ellipse at center, ${colorAccent}22 0%, transparent 70%)`,
                    }}
                />
            )}

            {header}
            {progressBar}

            {/* Score zone — gestures only here */}
            <div
                className="flex-1 flex items-center justify-center touch-manipulation cursor-pointer relative"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <motion.span
                    key={data.points}
                    initial={{ scale: 1.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`font-black leading-none tracking-tighter ${isDanger ? 'animate-pulse' : ''}`}
                    style={{
                        fontSize: 'clamp(4rem, 18vh, 12rem)',
                        textShadow: `0 0 ${isDanger ? '60px' : '40px'} ${colorAccent}${isDanger ? '55' : '22'}`,
                    }}
                >
                    {data.points}
                </motion.span>

                {/* Danger indicator */}
                {isDanger && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`absolute ${inverted ? 'top-2' : 'bottom-2'} left-1/2 -translate-x-1/2 text-xs font-bold tracking-widest ${colorClass}`}
                    >
                        {data.points >= 11 ? '🔥 MÃO DE 11!' : '⚠️ NA QUEDA'}
                    </motion.div>
                )}

                {/* Gesture onboarding hint */}
                <AnimatePresence>
                    {showGestureHint && !inverted && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl z-10"
                            onClick={dismissHint}
                        >
                            <motion.div
                                animate={{ y: [-8, 8, -8] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-3xl mb-3"
                            >
                                👆
                            </motion.div>
                            <p className="text-white/80 text-sm font-semibold text-center px-4">
                                Deslize ↑ para <span className="text-[#00ff9c]">+1</span> &nbsp;·&nbsp; Deslize ↓ para <span className="text-[#ff3b3b]">−1</span>
                            </p>
                            <p className="text-white/60 text-xs mt-1">
                                Toque 2× para <span className="text-white/80">+3</span>
                            </p>
                            <p className="text-white/40 text-xs mt-4">Toque para fechar</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {buttons}
        </motion.div>
    );
}

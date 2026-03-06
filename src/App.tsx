import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Settings, History, Download, Undo2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { TeamArea } from './components/TeamArea';
import { Modal } from './components/Modal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { WinnerOverlay } from './components/WinnerOverlay';

import { useAudio } from './hooks/useAudio';
import { useWakeLock } from './hooks/useWakeLock';
import { usePWAInstall } from './hooks/usePWAInstall';

import type { Team, GameState, MatchRecord } from './types';
import { INITIAL_STATE, WIN_POINTS, WIN_DISPLAY_DURATION_MS } from './constants';

const vibrate = (ms: number | number[]) => {
  if (navigator.vibrate) navigator.vibrate(ms);
};

export default function App() {
  const { playSound } = useAudio();
  useWakeLock();
  const { canInstall, handleInstall } = usePWAInstall();

  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem('truco_state');
      return saved ? JSON.parse(saved) : INITIAL_STATE;
    } catch {
      return INITIAL_STATE;
    }
  });

  const [history, setHistory] = useState<MatchRecord[]>(() => {
    try {
      const saved = localStorage.getItem('truco_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [winner, setWinner] = useState<Team | null>(null);

  // Undo system
  const [undoState, setUndoState] = useState<GameState | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showConfirm = useCallback((message: string, onConfirm: () => void) => {
    setConfirmDialog({ message, onConfirm });
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('truco_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('truco_history', JSON.stringify(history));
  }, [history]);

  const triggerUndo = useCallback((previousState: GameState) => {
    setUndoState(previousState);
    setShowUndo(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setShowUndo(false);
      setUndoState(null);
    }, 3000);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoState) {
      setState(undoState);
      setShowUndo(false);
      setUndoState(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      vibrate(30);
    }
  }, [undoState]);

  const handleWin = useCallback((team: Team) => {
    playSound('win');
    vibrate([100, 50, 100, 50, 200]);
    setWinner(team);
    setShowUndo(false);

    setTimeout(() => {
      setState(prev => {
        const newState = {
          us: { ...prev.us, points: 0 },
          them: { ...prev.them, points: 0 },
        };
        newState[team].wins += 1;
        return newState;
      });
      setWinner(null);
    }, WIN_DISPLAY_DURATION_MS);
  }, [playSound]);

  const addPoints = useCallback((team: Team, points: number) => {
    if (winner) return;

    setState(prev => {
      const newPoints = Math.max(0, prev[team].points + points);
      const newState = {
        ...prev,
        [team]: { ...prev[team], points: newPoints },
      };

      if (points > 0) {
        playSound('point');
        vibrate(50);
      } else {
        vibrate(20);
      }

      // Save for undo
      triggerUndo(prev);

      if (newPoints >= WIN_POINTS) {
        setTimeout(() => handleWin(team), 100);
      }

      return newState;
    });
  }, [winner, playSound, handleWin, triggerUndo]);

  const resetMatch = useCallback(() => {
    showConfirm('Zerar a queda atual?', () => {
      setState(prev => ({
        us: { ...prev.us, points: 0 },
        them: { ...prev.them, points: 0 },
      }));
      setConfirmDialog(null);
    });
  }, [showConfirm]);

  const newGame = useCallback(() => {
    showConfirm('Começar novo jogo? Isso salvará o atual no histórico.', () => {
      if (state.us.wins > 0 || state.them.wins > 0) {
        setHistory(prev => [{
          id: Date.now().toString(),
          date: new Date().toLocaleString('pt-BR'),
          usName: state.us.name,
          themName: state.them.name,
          usWins: state.us.wins,
          themWins: state.them.wins,
        }, ...prev]);
      }
      setState(INITIAL_STATE);
      setConfirmDialog(null);
      setShowSettings(false);
    });
  }, [showConfirm, state]);

  const clearHistory = useCallback(() => {
    showConfirm('Limpar todo o histórico de partidas?', () => {
      setHistory([]);
      setConfirmDialog(null);
    });
  }, [showConfirm]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col landscape:flex-row h-[100dvh] w-screen overflow-hidden bg-[#0b0b0b] text-white select-none"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      <TeamArea
        team="them"
        data={state.them}
        onAdd={(p) => addPoints('them', p)}
        isWinner={winner === 'them'}
        inverted={true}
      />

      {/* Gradient separator + center controls */}
      <div className="relative z-10 flex items-center justify-center landscape:flex-col">
        {/* Gradient line */}
        <div className="absolute inset-0 landscape:inset-auto landscape:w-px landscape:h-full">
          <div className="w-full h-px landscape:w-px landscape:h-full bg-gradient-to-r landscape:bg-gradient-to-b from-transparent via-[#333] to-transparent" />
        </div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
          className="relative flex landscape:flex-col gap-3 bg-[#0b0b0b]/90 backdrop-blur-sm p-2 rounded-full border border-[#333] shadow-2xl"
        >
          <button
            onClick={resetMatch}
            className="p-3 rounded-full bg-[#151515] text-gray-400 hover:text-white active:scale-90 transition-all border border-transparent hover:border-[#333]"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="p-3 rounded-full bg-[#151515] text-gray-400 hover:text-white active:scale-90 transition-all border border-transparent hover:border-[#333]"
          >
            <History size={18} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-full bg-[#151515] text-gray-400 hover:text-white active:scale-90 transition-all border border-transparent hover:border-[#333]"
          >
            <Settings size={18} />
          </button>
        </motion.div>
      </div>

      <TeamArea
        team="us"
        data={state.us}
        onAdd={(p) => addPoints('us', p)}
        isWinner={winner === 'us'}
      />

      {/* Undo Toast */}
      <AnimatePresence>
        {showUndo && (
          <motion.button
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={handleUndo}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#1a1a1a] border border-[#444] px-5 py-3 rounded-full shadow-2xl active:scale-95 transition-transform"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            <Undo2 size={16} className="text-[#00ff9c]" />
            <span className="text-white text-sm font-semibold">Desfazer</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showHistory && (
          <Modal onClose={() => setShowHistory(false)} title="Histórico">
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <History size={40} className="mx-auto text-gray-700 mb-4" />
                  <p className="text-gray-500 text-lg">Nenhuma partida registrada.</p>
                </div>
              ) : (
                <>
                  {history.map((h, i) => {
                    const usWon = h.usWins > h.themWins;
                    const themWon = h.themWins > h.usWins;
                    return (
                      <motion.div
                        key={h.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#151515] p-4 rounded-2xl border border-[#222]"
                      >
                        <div className="text-gray-500 text-xs mb-2 text-center">{h.date}</div>
                        <div className="flex justify-between items-center">
                          <div className="flex-1 text-center">
                            <div className={`font-bold text-sm ${usWon ? 'text-[#00ff9c]' : 'text-gray-400'}`}>
                              {h.usName} {usWon && '👑'}
                            </div>
                            <div className={`text-2xl font-black ${usWon ? '' : 'text-gray-500'}`}>{h.usWins}</div>
                          </div>
                          <div className="text-gray-600 text-sm px-4 font-bold">×</div>
                          <div className="flex-1 text-center">
                            <div className={`font-bold text-sm ${themWon ? 'text-[#ff3b3b]' : 'text-gray-400'}`}>
                              {h.themName} {themWon && '👑'}
                            </div>
                            <div className={`text-2xl font-black ${themWon ? '' : 'text-gray-500'}`}>{h.themWins}</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <button
                    onClick={clearHistory}
                    className="w-full mt-4 py-3 rounded-2xl bg-[#1a1a1a] text-[#ff3b3b] font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform border border-[#222]"
                  >
                    <Trash2 size={14} />
                    Limpar Histórico
                  </button>
                </>
              )}
            </div>
          </Modal>
        )}

        {showSettings && (
          <Modal onClose={() => setShowSettings(false)} title="Configurações">
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Nome do seu time</label>
                <input
                  type="text"
                  value={state.us.name}
                  onChange={e => setState(s => ({ ...s, us: { ...s.us, name: e.target.value } }))}
                  className="w-full bg-[#151515] border border-[#333] rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-[#00ff9c] transition-colors"
                  enterKeyHint="done"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Nome do time adversário</label>
                <input
                  type="text"
                  value={state.them.name}
                  onChange={e => setState(s => ({ ...s, them: { ...s.them, name: e.target.value } }))}
                  className="w-full bg-[#151515] border border-[#333] rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-[#ff3b3b] transition-colors"
                  enterKeyHint="done"
                />
              </div>

              <button
                onClick={newGame}
                className="w-full bg-[#151515] text-white font-bold py-4 rounded-2xl border border-[#333] hover:bg-[#222] active:scale-95 transition-all"
              >
                Encerrar Jogo Atual
              </button>

              {canInstall && (
                <button
                  onClick={handleInstall}
                  className="w-full bg-[#00ff9c] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,156,0.15)]"
                >
                  <Download size={20} />
                  Instalar App
                </button>
              )}
            </div>
          </Modal>
        )}

        {confirmDialog && (
          <ConfirmDialog
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
          />
        )}

        {winner && (
          <WinnerOverlay winnerName={state[winner].name} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

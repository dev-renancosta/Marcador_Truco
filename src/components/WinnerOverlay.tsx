import { Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface WinnerOverlayProps {
  winnerName: string;
}

export function WinnerOverlay({ winnerName }: WinnerOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.3, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Trophy size={80} className="mx-auto text-[#00ff9c] mb-6 drop-shadow-[0_0_30px_rgba(0,255,156,0.5)]" />
        </motion.div>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-black mb-2 drop-shadow-lg"
        >
          {winnerName}
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-2xl text-[#00ff9c] font-bold tracking-wide"
        >
          VENCEU A QUEDA!
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-6 h-1 w-32 mx-auto rounded-full bg-gradient-to-r from-transparent via-[#00ff9c] to-transparent"
        />
      </motion.div>
    </motion.div>
  );
}

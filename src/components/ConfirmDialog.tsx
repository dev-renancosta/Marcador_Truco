import { motion } from 'motion/react';

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="bg-[#1a1a1a] rounded-3xl p-6 mx-6 w-full max-w-sm border border-[#333] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-white text-lg font-semibold text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl bg-[#252525] text-gray-300 font-bold text-lg active:scale-95 transition-transform border border-[#333]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-2xl bg-[#ff3b3b] text-white font-bold text-lg active:scale-95 transition-transform"
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

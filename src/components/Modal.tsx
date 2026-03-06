import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}

export function Modal({ children, onClose, title }: ModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col"
      style={{
        paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
        paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
      }}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex justify-between items-center mb-8 mt-4"
      >
        <h2 className="text-3xl font-black">{title}</h2>
        <button
          onClick={onClose}
          className="p-2.5 bg-[#151515] rounded-full text-white active:scale-90 transition-transform border border-[#333]"
        >
          <Plus size={22} className="rotate-45" />
        </button>
      </motion.div>
      <div className="flex-1 overflow-y-auto pb-10 overscroll-contain">
        {children}
      </div>
    </motion.div>
  );
}

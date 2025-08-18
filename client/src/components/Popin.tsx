// src/components/Popin.tsx
import React, { useEffect } from 'react';

interface PopinProps {
  message: string;
  onClose?: () => void;
  duration?: number;
}

export default function Popin({ message, onClose, duration = 2000 }: PopinProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-4 py-2 rounded shadow-lg">
      {message}
    </div>
  );
}

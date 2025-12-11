"use client";

import React, { ReactNode, MouseEvent } from "react";

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const BaseModal = ({ open, onClose, children }: BaseModalProps) => {
  if (!open) return null;

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContentClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onClick={handleContentClick}
      >
        {children}
      </div>
    </div>
  );
};

export default BaseModal;

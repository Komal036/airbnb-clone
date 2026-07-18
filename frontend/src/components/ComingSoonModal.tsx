"use client";

import { LucideIcon } from "lucide-react";
import Modal from "./Modal";

export default function ComingSoonModal({
  open,
  onClose,
  icon: Icon,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center py-6 gap-3">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon size={26} className="text-graytext" />
        </div>
        <p className="font-medium text-ink">Coming soon</p>
        <p className="text-sm text-graytext max-w-xs">{description}</p>
        <button
          onClick={onClose}
          className="mt-2 border border-ink text-ink text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-50"
        >
          Got it
        </button>
      </div>
    </Modal>
  );
}

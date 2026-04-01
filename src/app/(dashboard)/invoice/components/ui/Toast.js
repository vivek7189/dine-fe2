'use client';

import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiX } from 'react-icons/hi';

const icons = {
  success: HiCheckCircle,
  error: HiExclamationCircle,
  info: HiInformationCircle,
};

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
};

export default function Toast({ toast, onDismiss }) {
  const Icon = icons[toast.type] || icons.info;

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[320px] max-w-md
        animate-slide-in-right
        ${styles[toast.type] || styles.info}
      `}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${iconStyles[toast.type] || iconStyles.info}`} />
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="p-0.5 hover:bg-black/5 rounded transition-colors cursor-pointer"
      >
        <HiX className="h-4 w-4" />
      </button>
    </div>
  );
}

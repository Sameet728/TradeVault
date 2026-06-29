'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteStrategyAction } from '@/actions/strategy.actions';
import { Trash2 } from 'lucide-react';

interface StrategyDeleteButtonProps {
  id: string;
  name: string;
}

export function StrategyDeleteButton({ id, name }: StrategyDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    startTransition(async () => {
      const result = await deleteStrategyAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Strategy "${name}" deleted`);
        router.refresh();
      }
    });
  }

  return (
    <button
      className={`icon-action delete-btn ${confirming ? 'confirming' : ''}`}
      onClick={handleDelete}
      disabled={isPending}
      title={confirming ? 'Click again to confirm' : 'Delete strategy'}
    >
      <Trash2 size={14} />
      <style jsx>{`
        .icon-action {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 6px;
          color: #71717a; background: none; border: none; cursor: pointer;
          transition: all 0.15s;
        }
        .icon-action:hover { color: #ef4444; background: rgba(239,68,68,0.08); }
        .icon-action.confirming { color: #ef4444; background: rgba(239,68,68,0.12); }
        .icon-action:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </button>
  );
}

import * as Dialog from '@radix-ui/react-dialog';
import { Trash2, X } from 'lucide-react';
import { Button } from '../shared/Button';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  projectName?: string;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading,
  projectName,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs card p-6 shadow-xl"
          aria-describedby="delete-dialog-description"
        >
          <Dialog.Close asChild>
            <button className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-[hsl(var(--color-surface-alt2))] transition-colors">
              <X size={15} className="text-[hsl(var(--color-text-muted))]" />
            </button>
          </Dialog.Close>

          <div className="flex flex-col gap-1 mb-5">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-2">
              <Trash2 size={18} className="text-[hsl(var(--color-error))]" />
            </div>
            <Dialog.Title className="text-lg font-bold text-[hsl(var(--color-text))]">
              Delete project?
            </Dialog.Title>
            <p id="delete-dialog-description" className="text-sm text-[hsl(var(--color-text-muted))]">
              {projectName ? (
                <>
                  "<strong>{projectName}</strong>" will be permanently deleted.
                </>
              ) : (
                'This project will be permanently deleted.'
              )}{' '}
              This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={onClose}
              id="delete-dialog-cancel"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              className="flex-1"
              loading={loading}
              onClick={onConfirm}
              id="delete-dialog-confirm"
            >
              Delete
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

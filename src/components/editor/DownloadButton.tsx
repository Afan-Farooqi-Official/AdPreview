import { useState } from 'react';
import { Download, Crown } from 'lucide-react';
import { Button } from '../shared/Button';
import { useSubscription } from '../../hooks/useSubscription';
import { useToast } from '../shared/Toast';

interface DownloadButtonProps {
  onExport: (hd: boolean) => string | null;
  onUpgradeNeeded: () => void;
  disabled?: boolean;
}

export function DownloadButton({ onExport, onUpgradeNeeded, disabled }: DownloadButtonProps) {
  const { isPro } = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDownload = async (hd: boolean) => {
    if (hd && !isPro) {
      onUpgradeNeeded();
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => requestAnimationFrame(r));
      const dataUrl = onExport(hd);
      if (!dataUrl) throw new Error('Export failed.');

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `adviz-billboard-${hd ? 'hd' : 'standard'}-${Date.now()}.jpg`;
      a.click();
      toast('success', `Downloaded ${hd ? 'HD' : 'standard'} image successfully.`);
    } catch {
      toast('error', 'Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-t border-[hsl(var(--color-border))] flex flex-col gap-2">
      <Button
        id="download-standard-btn"
        variant="outline"
        size="md"
        loading={loading}
        disabled={disabled}
        onClick={() => handleDownload(false)}
        className="w-full"
      >
        <Download size={15} />
        Download Standard
      </Button>

      <Button
        id="download-hd-btn"
        size="md"
        loading={loading}
        disabled={disabled}
        onClick={() => handleDownload(true)}
        className="w-full"
      >
        {isPro ? (
          <Download size={15} />
        ) : (
          <Crown size={15} />
        )}
        {isPro ? 'Download HD' : 'Download HD — Pro'}
      </Button>

      {!isPro && (
        <p className="text-[10px] text-center text-[hsl(var(--color-text-subtle))]">
          HD export &amp; watermark-free with{' '}
          <button
            onClick={onUpgradeNeeded}
            className="text-[hsl(var(--color-pro))] font-medium underline-offset-2 hover:underline"
          >
            Pro
          </button>
        </p>
      )}
    </div>
  );
}

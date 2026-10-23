import { useState, type ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ZurichIcon } from '@/components/zurich-icon';

// An info icon, 44px to tap, whose tooltip explains the field beside it. Radix tooltips open only
// on hover and keyboard focus, so a click or tap opens this one too, for touch screens. Tapping
// elsewhere, moving away or Esc closes it.
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-2xl text-zurich-blue transition-colors hover:bg-muted"
          // Radix closes the tooltip when the button is pressed. Skipping that keeps it open.
          onPointerDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.preventDefault();
            setOpen(true);
          }}
        >
          <ZurichIcon name="info:line" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}

import { ZurichIcon, type ZurichIconName } from '@/components/zurich-icon';
import { cn } from '@/lib/cn';

const tones = {
  // As in the home page's benefits.
  blue: 'bg-zurich-blue text-white',
  // For mint, lime and pink panels.
  white: 'bg-white text-zurich-blue',
};

// An icon in a 48px circle, the home page's marker for a point or a card.
export function IconCircle({
  name,
  tone = 'blue',
  className,
}: {
  name: ZurichIconName;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-full text-2xl',
        tones[tone],
        className,
      )}
    >
      <ZurichIcon name={name} />
    </span>
  );
}

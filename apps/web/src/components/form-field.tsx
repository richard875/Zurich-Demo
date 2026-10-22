import { useId, type ReactNode } from 'react';
import { IconCircle } from '@/components/icon-circle';
import { Label } from '@/components/ui/label';
import { ZurichIcon, type ZurichIconName } from '@/components/zurich-icon';
import { cn } from '@/lib/cn';

export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

export function describedBy(...ids: (string | false | undefined)[]): string | undefined {
  const joined = ids.filter(Boolean).join(' ');
  return joined || undefined;
}

export function FieldError({
  id,
  message,
  className,
}: {
  id: string;
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p id={id} className={cn('flex items-center gap-2 text-sm font-medium', className)}>
      <ZurichIcon name="alert-circle:line" className="text-lg text-peach" />
      {message}
    </p>
  );
}

// A labelled control with an optional hint and error, both linked by aria-describedby.
export function FormField({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: (control: FieldControlProps) => ReactNode;
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {children({
        id,
        'aria-describedby': describedBy(hint && hintId, error && errorId),
        'aria-invalid': error ? true : undefined,
      })}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

// A card of related fields, like the quote chooser's choices: white, a Dove outline and 16px corners,
// 24px inside, 40px from md. An icon, title and line can open it, 24px above the fields.
export function FormSection({
  icon,
  title,
  description,
  badge,
  className,
  children,
}: {
  icon?: ZurichIconName;
  title?: ReactNode;
  description?: string;
  badge?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={cn(
        'grid gap-6 rounded-card bg-white p-6 ring-1 ring-dove transition-shadow md:p-10',
        className,
      )}
    >
      {title && (
        <div className="flex flex-wrap items-start gap-4">
          {icon && <IconCircle name={icon} />}
          <div className="grid flex-1 basis-48 gap-2">
            <h2 id={headingId} className="text-b-20 font-semibold">
              {title}
            </h2>
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
          {badge}
        </div>
      )}
      {children}
    </section>
  );
}

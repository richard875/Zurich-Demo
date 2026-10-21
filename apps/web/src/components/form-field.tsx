import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

export function describedBy(...ids: (string | false | undefined)[]): string | undefined {
  const joined = ids.filter(Boolean).join(' ');
  return joined || undefined;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="border-l-4 border-peach pl-3 text-sm font-medium">
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

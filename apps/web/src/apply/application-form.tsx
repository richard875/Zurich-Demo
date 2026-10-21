import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  applicationFormSchema,
  HEALTH_QUESTIONS,
  type ApplicationForm as ApplicationFormValues,
} from '@shared/application';
import { describedBy, FieldError, FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function ApplicationForm({
  pending,
  error,
  onSubmit,
}: {
  pending: boolean;
  error: string | null;
  onSubmit: (values: ApplicationFormValues) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: { firstName: '' },
  });

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-10">
      <FormField id="first-name" label="First name" error={errors.firstName?.message}>
        {(controlProps) => (
          <Input
            autoComplete="given-name"
            className="sm:max-w-xs"
            {...controlProps}
            {...register('firstName')}
          />
        )}
      </FormField>

      <section aria-labelledby="health-heading" className="grid gap-6">
        <div>
          <h2 id="health-heading" className="text-xl font-medium">
            Health and lifestyle
          </h2>
          <p className="mt-1 text-muted-foreground">
            Four questions. Answering yes means we’ll review your application by hand.
          </p>
        </div>
        {HEALTH_QUESTIONS.map((question, index) => {
          const error = errors.answers?.[question.id]?.message;
          const errorId = `${question.id}-error`;
          return (
            <fieldset key={question.id} className="grid gap-3 border-t pt-6">
              <legend className="float-left mb-3 w-full font-medium">
                {index + 1}. {question.text}
              </legend>
              <Controller
                name={`answers.${question.id}`}
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    name={field.name}
                    value={field.value === true ? 'yes' : field.value === false ? 'no' : ''}
                    onValueChange={(value) => field.onChange(value === 'yes')}
                    aria-describedby={describedBy(error && errorId)}
                    aria-invalid={error ? true : undefined}
                    className="clear-left flex gap-8"
                  >
                    {(['no', 'yes'] as const).map((option) => (
                      <div key={option} className="flex items-center gap-3">
                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                        <Label htmlFor={`${question.id}-${option}`} className="font-normal">
                          {option === 'yes' ? 'Yes' : 'No'}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              <FieldError id={errorId} message={error} />
            </fieldset>
          );
        })}
      </section>

      <div className="grid gap-3 border-t pt-6">
        <Controller
          name="declaration"
          control={control}
          render={({ field }) => (
            <div className="flex items-start gap-3">
              <Checkbox
                id="declaration"
                className="mt-0.5"
                checked={field.value === true}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-describedby={describedBy(errors.declaration && 'declaration-error')}
                aria-invalid={errors.declaration ? true : undefined}
              />
              <Label htmlFor="declaration" className="font-normal">
                My answers are true and complete. I understand this is a demo and no cover is
                provided.
              </Label>
            </div>
          )}
        />
        <FieldError id="declaration-error" message={errors.declaration?.message} />
      </div>

      {error && (
        <div role="alert" className="border-l-4 border-peach py-1 pl-4">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <Button type="submit" className="justify-self-start" disabled={pending}>
        {pending ? 'Sending your application…' : 'Submit application'}
      </Button>
      <p className="sr-only" aria-live="polite">
        {pending ? 'Sending your application' : ''}
      </p>
    </form>
  );
}

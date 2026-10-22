import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  applicationFormSchema,
  HEALTH_QUESTIONS,
  type ApplicationForm as ApplicationFormValues,
} from '@shared/application';
import { describedBy, FieldError, FormField, FormSection } from '@/components/form-field';
import { ErrorAlert } from '@/components/message-panel';
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
      <FormSection>
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
      </FormSection>

      {/* Each question is numbered in a circle like the cover tabs' points, its pills lined up with
          its words. The number stays in the group's name as "1. " for screen readers. */}
      <FormSection
        icon="heart-medical:line"
        title="Health and lifestyle"
        description="Four questions. Answering yes means we'll review your application by hand."
      >
        {HEALTH_QUESTIONS.map((question, index) => {
          const error = errors.answers?.[question.id]?.message;
          const errorId = `${question.id}-error`;
          return (
            <fieldset key={question.id} className="grid gap-4 border-t border-dove pt-6">
              <legend className="float-left flex w-full items-start gap-4 text-b-18 font-medium">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zurich-blue text-base font-semibold text-white"
                >
                  {index + 1}
                </span>
                <span className="pt-0.5">
                  <span className="sr-only">{index + 1}. </span>
                  {question.text}
                </span>
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
                    className="clear-left pl-12"
                  >
                    <RadioGroupItem value="no">No</RadioGroupItem>
                    <RadioGroupItem value="yes">Yes</RadioGroupItem>
                  </RadioGroup>
                )}
              />
              <FieldError id={errorId} message={error} className="pl-12" />
            </fieldset>
          );
        })}
      </FormSection>

      <div className="grid gap-2 rounded-card bg-zurich-white p-6">
        <Controller
          name="declaration"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-4">
              <Checkbox
                id="declaration"
                checked={field.value === true}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-describedby={describedBy(errors.declaration && 'declaration-error')}
                aria-invalid={errors.declaration ? true : undefined}
              />
              <Label htmlFor="declaration" className="cursor-pointer font-normal">
                My answers are true and complete. I understand this is a demo and no cover is
                provided.
              </Label>
            </div>
          )}
        />
        <FieldError
          id="declaration-error"
          message={errors.declaration?.message}
          className="pl-10"
        />
      </div>

      {error && <ErrorAlert>{error}</ErrorAlert>}

      <div>
        <Button type="submit" size="md" className="max-sm:w-full" disabled={pending}>
          {pending ? 'Sending your application…' : 'Submit application'}
        </Button>
      </div>
      <p className="sr-only" aria-live="polite">
        {pending ? 'Sending your application' : ''}
      </p>
    </form>
  );
}

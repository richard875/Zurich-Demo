import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { aboutYouSchema, STATE_NAMES, STATES, type AboutYou } from '@shared/quote';
import { describedBy, FieldError, FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ZurichIcon } from '@/components/zurich-icon';
import { demoDetails } from './demo-details';

export function AboutYouForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues: AboutYou | null;
  onSubmit: (values: AboutYou) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AboutYou>({
    resolver: zodResolver(aboutYouSchema),
    defaultValues: defaultValues ?? { dateOfBirth: '' },
  });

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-zurich-white p-4">
        <p className="text-sm">In a hurry? Fill in made-up details.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => reset(demoDetails)}>
          Use demo details
        </Button>
      </div>

      <FormField
        id="date-of-birth"
        label="Date of birth"
        hint="You need to be aged 18 to 60."
        error={errors.dateOfBirth?.message}
      >
        {(controlProps) => (
          <Input
            type="date"
            autoComplete="bday"
            className="sm:max-w-xs"
            {...controlProps}
            {...register('dateOfBirth')}
          />
        )}
      </FormField>

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-base font-medium">Do you smoke?</legend>
        <p id="smoker-hint" className="-mt-1 text-sm text-muted-foreground">
          Include vapes and e-cigarettes.
        </p>
        <Controller
          name="smoker"
          control={control}
          render={({ field }) => (
            <RadioGroup
              name={field.name}
              value={field.value === true ? 'yes' : field.value === false ? 'no' : ''}
              onValueChange={(value) => field.onChange(value === 'yes')}
              aria-describedby={describedBy('smoker-hint', errors.smoker && 'smoker-error')}
              aria-invalid={errors.smoker ? true : undefined}
              className="flex gap-8"
            >
              {(['no', 'yes'] as const).map((option) => (
                <div key={option} className="flex items-center gap-3">
                  <RadioGroupItem value={option} id={`smoker-${option}`} />
                  <Label htmlFor={`smoker-${option}`} className="font-normal">
                    {option === 'yes' ? 'Yes' : 'No'}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
        <FieldError id="smoker-error" message={errors.smoker?.message} />
      </fieldset>

      <FormField id="state" label="State or territory" error={errors.state?.message}>
        {(controlProps) => (
          <NativeSelect
            autoComplete="address-level1"
            className="sm:max-w-xs"
            {...controlProps}
            {...register('state')}
          >
            <option value="">Select</option>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {STATE_NAMES[state]}
              </option>
            ))}
          </NativeSelect>
        )}
      </FormField>

      <Button type="submit" className="justify-self-start">
        Continue
        <ZurichIcon name="arrow-right:line" />
      </Button>
    </form>
  );
}

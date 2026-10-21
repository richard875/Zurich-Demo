import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { formatWholeDollars } from '@shared/money';
import { coverSchema, INCOME_PROTECTION, LIFE_COVER, type Cover } from '@shared/quote';
import { FieldError } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ZurichIcon } from '@/components/zurich-icon';

// The form keeps the benefit amount while income protection is switched off, then maps to a Cover.
const coverFormSchema = z.object({
  lifeCover: coverSchema.shape.lifeCover,
  includeIncomeProtection: z.boolean(),
  incomeProtection: coverSchema.shape.incomeProtection.unwrap(),
});

type CoverFormValues = z.infer<typeof coverFormSchema>;

const DEFAULT_LIFE_COVER = 500_000;
const DEFAULT_MONTHLY_BENEFIT = 4_000;

function AmountSlider({
  id,
  label,
  range,
  value,
  onChange,
  suffix = '',
}: {
  id: string;
  label: string;
  range: { min: number; max: number; step: number };
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  const valueText = `${formatWholeDollars(value)}${suffix}`;
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span id={`${id}-label`} className="font-medium">
          {label}
        </span>
        <span className="text-2xl font-light" aria-hidden="true">
          {valueText}
        </span>
      </div>
      <Slider
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onValueChange={onChange}
        thumbProps={{ 'aria-labelledby': `${id}-label`, 'aria-valuetext': valueText }}
      />
      <div className="flex justify-between text-sm text-muted-foreground" aria-hidden="true">
        <span>{formatWholeDollars(range.min)}</span>
        <span>{formatWholeDollars(range.max)}</span>
      </div>
    </div>
  );
}

export function CoverForm({
  defaultValues,
  pending,
  error,
  onBack,
  onSubmit,
}: {
  defaultValues: Cover | null;
  pending: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: (cover: Cover) => void;
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CoverFormValues>({
    resolver: zodResolver(coverFormSchema),
    defaultValues: {
      lifeCover: defaultValues?.lifeCover ?? DEFAULT_LIFE_COVER,
      includeIncomeProtection: defaultValues ? defaultValues.incomeProtection !== null : false,
      incomeProtection: defaultValues?.incomeProtection ?? DEFAULT_MONTHLY_BENEFIT,
    },
  });
  const includeIncomeProtection = useWatch({ control, name: 'includeIncomeProtection' });

  const submit = handleSubmit((values) =>
    onSubmit({
      lifeCover: values.lifeCover,
      incomeProtection: values.includeIncomeProtection ? values.incomeProtection : null,
    }),
  );

  return (
    <form noValidate onSubmit={submit} className="grid gap-8">
      <section
        aria-labelledby="life-heading"
        className="grid gap-5 rounded-xl p-6 ring-1 ring-dove"
      >
        <div className="flex items-start gap-4">
          <ZurichIcon name="family:line" className="text-3xl text-zurich-blue" />
          <div>
            <h2 id="life-heading" className="text-xl font-medium">
              Life cover
            </h2>
            <p className="mt-1 text-muted-foreground">
              A lump sum if you die or are diagnosed with a terminal illness.
            </p>
          </div>
        </div>
        <Controller
          name="lifeCover"
          control={control}
          render={({ field }) => (
            <AmountSlider
              id="life-cover"
              label="Amount of cover"
              range={LIFE_COVER}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <FieldError id="life-cover-error" message={errors.lifeCover?.message} />
      </section>

      <section
        aria-labelledby="income-heading"
        className="grid gap-5 rounded-xl p-6 ring-1 ring-dove"
      >
        <div className="flex items-start gap-4">
          <ZurichIcon name="financial-health:line" className="text-3xl text-zurich-blue" />
          <div>
            <h2 id="income-heading" className="text-xl font-medium">
              Income protection{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </h2>
            <p className="mt-1 text-muted-foreground">
              A monthly benefit if illness or injury stops you working for more than 30 days.
            </p>
          </div>
        </div>
        <Controller
          name="includeIncomeProtection"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <Checkbox
                id="include-income-protection"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <Label htmlFor="include-income-protection" className="font-normal">
                Add income protection and save 10% on it
              </Label>
            </div>
          )}
        />
        {includeIncomeProtection && (
          <Controller
            name="incomeProtection"
            control={control}
            render={({ field }) => (
              <AmountSlider
                id="monthly-benefit"
                label="Monthly benefit"
                range={INCOME_PROTECTION}
                value={field.value}
                onChange={field.onChange}
                suffix=" a month"
              />
            )}
          />
        )}
        <FieldError id="monthly-benefit-error" message={errors.incomeProtection?.message} />
      </section>

      {error && (
        <div role="alert" className="border-l-4 border-peach py-1 pl-4">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? 'Working out your price…' : 'See my price'}
          {!pending && <ZurichIcon name="arrow-right:line" />}
        </Button>
        <Button type="button" variant="ghost" onClick={onBack}>
          <ZurichIcon name="arrow-left:line" />
          Back
        </Button>
      </div>
      <p className="sr-only" aria-live="polite">
        {pending ? 'Working out your price' : ''}
      </p>
    </form>
  );
}

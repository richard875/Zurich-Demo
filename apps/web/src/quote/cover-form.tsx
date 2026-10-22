import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { formatWholeDollars } from '@shared/money';
import { coverSchema, INCOME_PROTECTION, LIFE_COVER, type Cover } from '@shared/quote';
import { FieldError, FormSection } from '@/components/form-field';
import { ErrorAlert } from '@/components/message-panel';
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
    <div className="grid gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span id={`${id}-label`} className="font-medium">
          {label}
        </span>
        <span aria-hidden="true">
          <span className="text-h-32 font-light">{formatWholeDollars(value)}</span>
          {suffix && <span className="text-b-18">{suffix}</span>}
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
  incomeProtectionPreset = null,
  pending,
  error,
  onBack,
  onSubmit,
}: {
  defaultValues: Cover | null;
  incomeProtectionPreset?: boolean | null;
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
      includeIncomeProtection:
        incomeProtectionPreset ?? (defaultValues ? defaultValues.incomeProtection !== null : false),
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
    <form noValidate onSubmit={submit} className="grid gap-10">
      <FormSection
        icon="family:line"
        title="Ezicover Life Insurance"
        description="A lump sum if you die or are diagnosed with a terminal illness."
      >
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
      </FormSection>

      {/* Outlined in Zurich Blue once it's added, like a hovered quote chooser card. */}
      <FormSection
        icon="financial-health:line"
        title={
          <>
            Ezicover Income Protection{' '}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </>
        }
        description="A monthly benefit if illness or injury stops you working for more than 30 days."
        badge={<span className="rounded-full bg-lime px-3 py-1 text-sm font-medium">Save 5%</span>}
        className={includeIncomeProtection ? 'ring-2 ring-zurich-blue' : undefined}
      >
        <Controller
          name="includeIncomeProtection"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3 rounded-input bg-zurich-white px-4">
              <Checkbox
                id="include-income-protection"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              {/* The label fills the row, so the whole row ticks the box. */}
              <Label
                htmlFor="include-income-protection"
                className="flex-1 cursor-pointer py-4 font-normal"
              >
                Add Ezicover Income Protection and save 5% on it
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
      </FormSection>

      {error && <ErrorAlert>{error}</ErrorAlert>}

      {/* The main action first; on phones the two stack, full width. */}
      <div className="grid gap-4 sm:flex sm:flex-wrap">
        <Button type="submit" size="md" disabled={pending}>
          {pending ? 'Working out your price…' : 'See my price'}
          {!pending && <ZurichIcon name="arrow-right:line" />}
        </Button>
        <Button type="button" variant="outline" size="md" onClick={onBack}>
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

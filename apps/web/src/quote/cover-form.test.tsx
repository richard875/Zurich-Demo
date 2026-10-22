// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CoverForm } from './cover-form';

function renderForm(props: Partial<Parameters<typeof CoverForm>[0]> = {}) {
  const onSubmit = vi.fn();
  render(
    <CoverForm
      defaultValues={null}
      pending={false}
      error={null}
      onBack={vi.fn()}
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return { onSubmit, user: userEvent.setup() };
}

describe('CoverForm', () => {
  it('submits $500,000 of life cover and no income protection by default', async () => {
    const { onSubmit, user } = renderForm();
    expect(screen.getByRole('slider', { name: 'Amount of cover' })).toHaveAttribute(
      'aria-valuetext',
      '$500,000',
    );
    expect(screen.queryByRole('slider', { name: 'Monthly benefit' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'See my price' }));
    expect(onSubmit).toHaveBeenCalledWith({ lifeCover: 500_000, incomeProtection: null });
  });

  it('moves life cover in $50,000 steps from the keyboard', async () => {
    const { onSubmit, user } = renderForm();
    const slider = screen.getByRole('slider', { name: 'Amount of cover' });
    slider.focus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(slider).toHaveAttribute('aria-valuetext', '$600,000');

    await user.click(screen.getByRole('button', { name: 'See my price' }));
    expect(onSubmit).toHaveBeenCalledWith({ lifeCover: 600_000, incomeProtection: null });
  });

  it('adds income protection with a $4,000 monthly benefit', async () => {
    const { onSubmit, user } = renderForm();
    await user.click(screen.getByRole('checkbox', { name: /Add Ezicover Income Protection/ }));
    expect(screen.getByRole('slider', { name: 'Monthly benefit' })).toHaveAttribute(
      'aria-valuetext',
      '$4,000 a month',
    );

    await user.click(screen.getByRole('button', { name: 'See my price' }));
    expect(onSubmit).toHaveBeenCalledWith({ lifeCover: 500_000, incomeProtection: 4_000 });
  });

  it('starts with income protection on when the quote chooser asked for it', () => {
    renderForm({ incomeProtectionPreset: true });
    expect(screen.getByRole('checkbox', { name: /Add Ezicover Income Protection/ })).toBeChecked();
  });

  it('lets the chooser switch off income protection from an earlier quote', () => {
    renderForm({
      defaultValues: { lifeCover: 750_000, incomeProtection: 3_000 },
      incomeProtectionPreset: false,
    });
    expect(
      screen.getByRole('checkbox', { name: /Add Ezicover Income Protection/ }),
    ).not.toBeChecked();
    expect(screen.getByRole('slider', { name: 'Amount of cover' })).toHaveAttribute(
      'aria-valuetext',
      '$750,000',
    );
  });

  it('shows a pending state and a friendly error', () => {
    renderForm({ pending: true, error: 'We couldn’t work out your price just now.' });
    expect(screen.getByRole('button', { name: 'Working out your price…' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'We couldn’t work out your price just now.',
    );
  });
});

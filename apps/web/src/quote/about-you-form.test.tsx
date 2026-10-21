// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AboutYouForm } from './about-you-form';
import { demoDetails } from './demo-details';

function renderForm() {
  const onSubmit = vi.fn();
  render(<AboutYouForm defaultValues={null} onSubmit={onSubmit} />);
  return { onSubmit, user: userEvent.setup() };
}

describe('AboutYouForm', () => {
  it('shows an error on each empty field, linked to it, and does not continue', async () => {
    const { onSubmit, user } = renderForm();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByLabelText('Date of birth')).toHaveAccessibleDescription(
      'You need to be aged 18 to 60. Enter your date of birth',
    );
    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription(
      'Include vapes and e-cigarettes. Tell us whether you smoke',
    );
    expect(screen.getByLabelText('State or territory')).toHaveAccessibleDescription(
      'Choose your state or territory',
    );
    expect(screen.getByLabelText('Date of birth')).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects anyone under 18', async () => {
    const { onSubmit, user } = renderForm();
    await user.click(screen.getByRole('button', { name: 'Use demo details' }));
    fireEvent.change(screen.getByLabelText('Date of birth'), { target: { value: '2015-01-01' } });
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      await screen.findByText('You need to be aged 18 to 60 to get a quote'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('fills in demo details that pass validation', async () => {
    const { onSubmit, user } = renderForm();
    await user.click(screen.getByRole('button', { name: 'Use demo details' }));
    expect(screen.getByRole('radio', { name: 'No' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onSubmit).toHaveBeenCalledWith(demoDetails, expect.anything());
  });

  it('submits answers entered by hand', async () => {
    const { onSubmit, user } = renderForm();
    fireEvent.change(screen.getByLabelText('Date of birth'), { target: { value: '1985-03-09' } });
    await user.click(screen.getByRole('radio', { name: 'Yes' }));
    await user.selectOptions(screen.getByLabelText('State or territory'), 'Queensland');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onSubmit).toHaveBeenCalledWith(
      { dateOfBirth: '1985-03-09', smoker: true, state: 'QLD' },
      expect.anything(),
    );
  });
});

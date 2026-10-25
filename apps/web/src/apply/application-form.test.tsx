// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationForm } from './application-form';
import { DEMO_FIRST_NAMES } from './demo-names';

function renderForm() {
  const onSubmit = vi.fn();
  render(<ApplicationForm pending={false} error={null} onSubmit={onSubmit} />);
  return { onSubmit, user: userEvent.setup() };
}

describe('ApplicationForm', () => {
  it('fills in a made-up first name that cannot be changed', async () => {
    const { user } = renderForm();
    const firstName = screen.getByLabelText<HTMLInputElement>('First name');
    const picked = firstName.value;
    expect(DEMO_FIRST_NAMES).toContain(picked);
    expect(firstName).toHaveAttribute('readonly');

    await user.type(firstName, 'Sam');
    expect(firstName).toHaveValue(picked);
  });

  it('explains why in a tooltip from the info button', async () => {
    const { user } = renderForm();
    await user.click(screen.getByRole('button', { name: "Why can't I change my name?" }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      "This is a demo, so we've picked a made-up name",
    );
  });

  it('opens the tooltip from a tap, even when no click follows (as in WebKit)', async () => {
    renderForm();
    const info = screen.getByRole('button', { name: "Why can't I change my name?" });
    fireEvent.pointerDown(info, { pointerType: 'touch' });
    expect(await screen.findByRole('tooltip')).toHaveTextContent('made-up name');
  });

  it('submits the answers and the declaration, never a name', async () => {
    const { onSubmit, user } = renderForm();
    for (const no of screen.getAllByRole('radio', { name: 'No' })) await user.click(no);
    await user.click(screen.getByRole('checkbox', { name: /My answers are true/ }));
    await user.click(screen.getByRole('button', { name: 'Submit application' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      answers: {
        heartCancerStroke: false,
        undiagnosedSymptoms: false,
        hazardousWork: false,
        overseasStay: false,
      },
      declaration: true,
    });
  });
});

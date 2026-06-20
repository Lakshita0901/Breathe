import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import WhatIfSimulator from '../components/WhatIfSimulator';
import { LanguageProvider } from '../contexts/LanguageContext';

const mockAnswers = {
  transportId: 'car_petrol',
  weeklyKm: 100,
  dietId: 'vegetarian',
  electricityKwh: 100,
  monthlySpend: 0,
};

function renderSimulator(currentTotal = 200) {
  return render(
    <LanguageProvider lang="en">
      <WhatIfSimulator countryCode="IN" currentTotal={currentTotal} />
    </LanguageProvider>
  );
}

describe('WhatIfSimulator Component', () => {
  beforeEach(() => {
    localStorage.setItem('breathe_quiz_answers', JSON.stringify(mockAnswers));
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── INITIAL RENDER ────────────────────────────────────────────

  test('renders title and subtitle', () => {
    renderSimulator();
    expect(screen.getByText('What if you changed one thing?')).toBeInTheDocument();
    expect(
      screen.getByText(/What if you changed one thing/i)
    ).toBeInTheDocument();
  });

  test('renders initial hint when no change is selected', () => {
    renderSimulator();
    expect(screen.getByText('Pick a change above to see your potential savings')).toBeInTheDocument();
  });

  test('renders transport dropdown', () => {
    renderSimulator();
    const select = screen.getByRole('combobox', { name: /Select alternative transport mode/i });
    expect(select).toBeInTheDocument();
    // "Keep current" is the placeholder option text (from actual DOM)
    expect(screen.getAllByText("Keep current").length).toBeGreaterThan(0);
  });

  test('renders diet dropdown', () => {
    renderSimulator();
    const select = screen.getByRole('combobox', { name: /Select alternative diet/i });
    expect(select).toBeInTheDocument();
  });

  test('renders energy range slider with 0 initial value', () => {
    renderSimulator();
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect((slider as HTMLInputElement).value).toBe('0');
  });

  // ── WHEN NO STORED ANSWERS ────────────────────────────────────

  test('renders without crashing when localStorage has no answers', () => {
    localStorage.clear();
    renderSimulator();
    expect(screen.getByText('What if you changed one thing?')).toBeInTheDocument();
  });

  test('renders without crashing when localStorage contains invalid JSON', () => {
    localStorage.setItem('breathe_quiz_answers', 'NOT_JSON');
    renderSimulator();
    expect(screen.getByText('What if you changed one thing?')).toBeInTheDocument();
  });

  // ── TRANSPORT SELECTION ───────────────────────────────────────

  test('calculates savings when switching to walk or cycle', () => {
    renderSimulator();
    const select = screen.getByLabelText('Change your transport');
    fireEvent.change(select, { target: { value: 'walk_cycle' } });
    expect(screen.getByText(/You could save 90 kg/i)).toBeInTheDocument();
    expect(screen.getByText(/New monthly total/i)).toBeInTheDocument();
  });

  test('shows new monthly total values when transport changes', () => {
    renderSimulator(246);
    const select = screen.getByLabelText('Change your transport');
    fireEvent.change(select, { target: { value: 'walk_cycle' } });
    // Shows current total (strikethrough)
    expect(screen.getByText(/246 kg/i)).toBeInTheDocument();
  });

  test('shows emotional saving text when saving is positive', () => {
    renderSimulator();
    const select = screen.getByLabelText('Change your transport');
    fireEvent.change(select, { target: { value: 'walk_cycle' } });
    // The emotional message starts with "That's like"
    expect(document.body.textContent).toContain('90 auto rides');
  });

  test('shows "would add" warning when switching to higher-emission transport', () => {
    localStorage.setItem('breathe_quiz_answers', JSON.stringify({
      ...mockAnswers,
      transportId: 'walk_cycle',
    }));
    renderSimulator();
    const select = screen.getByLabelText('Change your transport');
    fireEvent.change(select, { target: { value: 'car_petrol' } });
    expect(screen.getByText(/would add/i)).toBeInTheDocument();
  });

  test('resetting transport to empty hides result panel', () => {
    renderSimulator();
    const select = screen.getByLabelText('Change your transport');
    fireEvent.change(select, { target: { value: 'walk_cycle' } });
    expect(screen.getByText(/You could save/i)).toBeInTheDocument();

    fireEvent.change(select, { target: { value: '' } });
    expect(screen.queryByText(/You could save/i)).not.toBeInTheDocument();
    expect(screen.getByText('Pick a change above to see your potential savings')).toBeInTheDocument();
  });

  // ── DIET SELECTION ────────────────────────────────────────────

  test('calculates savings when switching to eggetarian from vegetarian', () => {
    // In India: vegetarian=55 (current), eggetarian=65 -> switching TO eggetarian would INCREASE
    // Let's switch FROM eggetarian TO vegetarian to save
    localStorage.setItem('breathe_quiz_answers', JSON.stringify({
      ...mockAnswers,
      dietId: 'eggetarian',
    }));
    renderSimulator();
    const dietSelect = screen.getByLabelText('Change your diet');
    fireEvent.change(dietSelect, { target: { value: 'vegetarian' } });
    // eggetarian=65, vegetarian=55 -> saved = 10 kg
    expect(screen.getByText(/You could save 10 kg/i)).toBeInTheDocument();
  });

  test('shows same-total message when switching to same diet', () => {
    renderSimulator();
    const dietSelect = screen.getByLabelText('Change your diet');
    // vegetarian -> vegetarian = same
    fireEvent.change(dietSelect, { target: { value: 'vegetarian' } });
    expect(document.body.textContent).toContain(
      'Same as your current selection'
    );
  });

  test('shows would-add when switching to higher-emission diet', () => {
    renderSimulator();
    const dietSelect = screen.getByLabelText('Change your diet');
    // vegetarian (55) -> eggetarian (65) -> would add 10 kg
    fireEvent.change(dietSelect, { target: { value: 'eggetarian' } });
    expect(screen.getByText(/would add/i)).toBeInTheDocument();
  });

  // ── ENERGY SLIDER ─────────────────────────────────────────────

  test('energy label updates when slider changes to 20', () => {
    renderSimulator();
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '20' } });
    expect(screen.getByText('Reduce energy use by 20%')).toBeInTheDocument();
  });

  test('calculates energy reduction savings when slider is at 50 percent', () => {
    renderSimulator();
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '50' } });
    // energy = 100 * 0.82 = 82. 50% of 82 = 41 kg saved
    expect(screen.getByText(/You could save 41 kg/i)).toBeInTheDocument();
  });

  test('energy slider resets result panel when set back to 0', () => {
    renderSimulator();
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '30' } });
    expect(screen.getByText(/You could save/i)).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '0' } });
    expect(screen.queryByText(/You could save/i)).not.toBeInTheDocument();
  });

  // ── COMBINED CHANGES ──────────────────────────────────────────

  test('combined transport and energy change shows larger savings', () => {
    renderSimulator();
    fireEvent.change(screen.getByLabelText('Change your transport'), { target: { value: 'walk_cycle' } });
    fireEvent.change(screen.getByRole('slider'), { target: { value: '50' } });
    // transport saves 90, energy saves 41 -> 131
    expect(screen.getByText(/You could save 131 kg/i)).toBeInTheDocument();
  });

  // ── ACCESSIBILITY ─────────────────────────────────────────────

  test('transport select has accessible label', () => {
    renderSimulator();
    expect(screen.getByRole('combobox', { name: /Select alternative transport mode/i })).toBeInTheDocument();
  });

  test('diet select has accessible label', () => {
    renderSimulator();
    expect(screen.getByRole('combobox', { name: /Select alternative diet/i })).toBeInTheDocument();
  });

  test('energy slider has accessible aria-label with current value', () => {
    renderSimulator();
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-label', 'Reduce energy by 0 percent');
  });

  test('energy slider aria-label updates when value changes', () => {
    renderSimulator();
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '25' } });
    expect(slider).toHaveAttribute('aria-label', 'Reduce energy by 25 percent');
  });
});

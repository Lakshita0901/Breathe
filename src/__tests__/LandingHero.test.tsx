import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import LandingHero from '../components/LandingHero';

describe('LandingHero Component Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders LandingHero elements correctly', () => {
    const onStart = vi.fn();
    render(<LandingHero onStart={onStart} />);

    // Hero title
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Every breath you take/i);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/tells a story/i);

    // Subtitle
    expect(
      screen.getByText(/See what your daily choices cost the air around you/i)
    ).toBeInTheDocument();

    // CTA Button
    const ctaBtn = screen.getByRole('button', { name: /Start breathing better/i });
    expect(ctaBtn).toBeInTheDocument();

    // Badges/statistic info in footer
    expect(screen.getByText('Available in 12 languages')).toBeInTheDocument();
    expect(screen.getByText('🌍 6 Countries')).toBeInTheDocument();
    expect(screen.getByText('🗣 12 Languages')).toBeInTheDocument();
    expect(screen.getByText('⚡ 2 Minutes')).toBeInTheDocument();
  });

  test('clicking CTA button triggers exit animation and then calls onStart callback', () => {
    const onStart = vi.fn();
    const { container } = render(<LandingHero onStart={onStart} />);

    const ctaBtn = screen.getByRole('button', { name: /Start breathing better/i });
    fireEvent.click(ctaBtn);

    // It sets isExiting to true, which sets opacity-0 on the outer wrapper div
    expect(container.firstChild).toHaveClass('opacity-0');

    // Callback onStart should NOT be called immediately
    expect(onStart).not.toHaveBeenCalled();

    // Advance timer by 500ms to trigger the onStart call
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  test('rotates facts correctly using intervals', () => {
    const onStart = vi.fn();
    render(<LandingHero onStart={onStart} />);

    // Initial fact
    expect(screen.getByText(/One Delhi/i)).toBeInTheDocument();

    // Advance 3000ms to trigger the first interval step (fade out)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // During the 300ms transition time, the index is updated inside a setTimeout
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Now the second fact should be visible: "🥗 Going vegetarian 3 days a week saves 200kg CO₂ a year"
    expect(screen.getByText(/Going vegetarian/i)).toBeInTheDocument();

    // Advance again by 3000ms + 300ms
    act(() => {
      vi.advanceTimersByTime(3300);
    });

    // Third fact: "🚌 Switching to bus for 1 month = planting 2 trees"
    expect(screen.getByText(/Switching to bus/i)).toBeInTheDocument();

    // Advance again by 3000ms + 300ms
    act(() => {
      vi.advanceTimersByTime(3300);
    });

    // Fourth fact: "⚡ The average Indian uses 158kg CO₂ every month"
    expect(screen.getByText(/The average Indian/i)).toBeInTheDocument();

    // Advance again by 3000ms + 300ms should loop back to the first fact
    act(() => {
      vi.advanceTimersByTime(3300);
    });

    expect(screen.getByText(/One Delhi/i)).toBeInTheDocument();
  });
});

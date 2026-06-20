import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import LanguageSelector from '../components/LanguageSelector';
import { LanguageProvider } from '../contexts/LanguageContext';

describe('LanguageSelector Component', () => {
  test('renders language options for country (IN)', () => {
    const handleSelect = vi.fn();
    const handleBack = vi.fn();

    render(
      <LanguageProvider lang="en">
        <LanguageSelector countryCode="IN" onSelect={handleSelect} onBack={handleBack} />
      </LanguageProvider>
    );

    // IN country has English, Hindi, Marathi, Tamil, Telugu
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('हिंदी')).toBeInTheDocument();
    expect(screen.getByText('मराठी')).toBeInTheDocument();
    expect(screen.getByText('தமிழ்')).toBeInTheDocument();
    expect(screen.getByText('తెలుగు')).toBeInTheDocument();
  });

  test('calls onBack when back button is clicked', () => {
    const handleSelect = vi.fn();
    const handleBack = vi.fn();

    render(
      <LanguageProvider lang="en">
        <LanguageSelector countryCode="IN" onSelect={handleSelect} onBack={handleBack} />
      </LanguageProvider>
    );

    const backButton = screen.getByRole('button', { name: /go back/i });
    fireEvent.click(backButton);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  test('enables continue button and calls onSelect when language chosen', () => {
    const handleSelect = vi.fn();
    const handleBack = vi.fn();

    render(
      <LanguageProvider lang="en">
        <LanguageSelector countryCode="IN" onSelect={handleSelect} onBack={handleBack} />
      </LanguageProvider>
    );

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();

    // Click on Hindi option
    const hindiOption = screen.getByText('हिंदी');
    fireEvent.click(hindiOption);

    // Now continue button should be enabled
    expect(continueBtn).toBeEnabled();

    // Click continue
    fireEvent.click(continueBtn);
    expect(handleSelect).toHaveBeenCalledWith('hi');
  });
});

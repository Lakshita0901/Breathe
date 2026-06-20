import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Quiz from '../components/Quiz';
import { LanguageProvider } from '../contexts/LanguageContext';

describe('Quiz Component', () => {
  test('walks through all quiz steps and submits answers', () => {
    const handleSubmit = vi.fn();
    const handleBack = vi.fn();

    render(
      <LanguageProvider lang="en">
        <Quiz countryCode="IN" onSubmit={handleSubmit} onBack={handleBack} />
      </LanguageProvider>
    );

    // --- STEP 0: Transport ---
    expect(screen.getByText('How do you usually get around?')).toBeInTheDocument();
    
    // Select Auto-rickshaw
    const autoBtn = screen.getByRole('button', { name: /Select Auto-rickshaw/i });
    fireEvent.click(autoBtn);

    // Set weekly km
    const kmInput = screen.getByLabelText(/Weekly distance/i);
    fireEvent.change(kmInput, { target: { value: '80' } });

    // Click Next
    const nextBtn1 = screen.getByRole('button', { name: /Next section/i });
    fireEvent.click(nextBtn1);

    // --- STEP 1: Food ---
    expect(screen.getByText('What does your diet look like?')).toBeInTheDocument();
    
    // Select Vegetarian
    const vegBtn = screen.getByRole('button', { name: /Select Vegetarian/i });
    fireEvent.click(vegBtn);

    // Click Next
    const nextBtn2 = screen.getByRole('button', { name: /Next section/i });
    fireEvent.click(nextBtn2);

    // --- STEP 2: Energy ---
    expect(screen.getByText('Monthly electricity usage')).toBeInTheDocument();
    
    // Set kWh
    const kwhInput = screen.getByLabelText(/Monthly electricity usage/i);
    fireEvent.change(kwhInput, { target: { value: '150' } });

    // Click Next
    const nextBtn3 = screen.getByRole('button', { name: /Next section/i });
    fireEvent.click(nextBtn3);

    // --- STEP 3: Shopping ---
    expect(screen.getByText('Monthly spend on new items (clothes, electronics)')).toBeInTheDocument();
    
    // Set spend
    const spendInput = screen.getByLabelText(/Monthly spend on new items/i);
    fireEvent.change(spendInput, { target: { value: '2500' } });

    // Click Next
    const nextBtn4 = screen.getByRole('button', { name: /Next section/i });
    fireEvent.click(nextBtn4);

    // --- STEP 4: Region ---
    expect(screen.getByText('Which best describes where you live?')).toBeInTheDocument();
    
    // Select Metro city
    const metroBtn = screen.getByRole('button', { name: /Select Metro city/i });
    fireEvent.click(metroBtn);

    // Click Submit
    const submitBtn = screen.getByRole('button', { name: /See your footprint/i });
    fireEvent.click(submitBtn);

    // Verify submission
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({
      transportId: 'auto',
      weeklyKm: 80,
      dietId: 'vegetarian',
      electricityKwh: 150,
      monthlySpend: 2500,
      regionId: 'metro',
    });
  });

  test('calls onBack and handles section previous navigation', () => {
    const handleSubmit = vi.fn();
    const handleBack = vi.fn();

    render(
      <LanguageProvider lang="en">
        <Quiz countryCode="IN" onSubmit={handleSubmit} onBack={handleBack} />
      </LanguageProvider>
    );

    // Click Go Back on main header
    const mainBack = screen.getByRole('button', { name: /Go back/i });
    fireEvent.click(mainBack);
    expect(handleBack).toHaveBeenCalledTimes(1);

    // Select Walk / Cycle to enable Next button
    fireEvent.click(screen.getByRole('button', { name: /Select Walk \/ Cycle/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next section/i }));

    // Click Previous section
    const prevBtn = screen.getByRole('button', { name: /Previous section/i });
    fireEvent.click(prevBtn);

    // We should be back at Step 0
    expect(screen.getByText('How do you usually get around?')).toBeInTheDocument();
  });
});

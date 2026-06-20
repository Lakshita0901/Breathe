import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import App from '../App';
import LandingHero from '../components/LandingHero';
import CountrySelector from '../components/CountrySelector';
import { LanguageProvider } from '../contexts/LanguageContext';

describe('App Component Tests', () => {
  test('App renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  test('LandingPage (LandingHero) shows the main heading', () => {
    render(<LandingHero onStart={vi.fn()} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Every breath you take/i);
    expect(heading).toHaveTextContent(/tells a story/i);
  });

  test('CountrySelector shows 6 countries', () => {
    render(
      <LanguageProvider lang="en">
        <CountrySelector onSelect={vi.fn()} onViewHistory={vi.fn()} />
      </LanguageProvider>
    );

    const countriesList = ['India', 'Nigeria', 'Germany', 'Brazil', 'Kenya', 'USA'];
    countriesList.forEach((countryName) => {
      expect(screen.getByText(countryName)).toBeInTheDocument();
    });
  });
});

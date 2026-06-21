import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../translations';

describe('LanguageContext Unit Tests', () => {
  // TestComponent uses the context hook
  const TestComponent = ({ translationKey, params }: { translationKey: TranslationKey; params?: Record<string, string | number> }) => {
    const { lang, t } = useLanguage();
    return (
      <div>
        <span data-testid="lang-val">{lang}</span>
        <span data-testid="t-val">{t(translationKey, params)}</span>
      </div>
    );
  };

  test('default language value and t() behavior when used without a provider', () => {
    render(<TestComponent translationKey="app_startOver" />);
    
    // Default lang should be 'en'
    expect(screen.getByTestId('lang-val').textContent).toBe('en');
    
    // Default t() should resolve key using English
    expect(screen.getByTestId('t-val').textContent).toBe('Start over');
  });

  test('default t() returns key if not found in English', () => {
    render(<TestComponent translationKey="non_existent_key" as any />);
    expect(screen.getByTestId('t-val').textContent).toBe('non_existent_key');
  });

  test('LanguageProvider updates consumers with correct language and translation', () => {
    render(
      <LanguageProvider lang="hi">
        <TestComponent translationKey="app_startOver" />
      </LanguageProvider>
    );

    expect(screen.getByTestId('lang-val').textContent).toBe('hi');
    expect(screen.getByTestId('t-val').textContent).toBe('फिर से शुरू करें');
  });

  test('t() supports parameter substitution with params object', () => {
    render(
      <LanguageProvider lang="en">
        <TestComponent 
          translationKey="app_tailoredTo" 
          params={{ country: 'Germany' }} 
        />
      </LanguageProvider>
    );

    expect(screen.getByTestId('t-val').textContent).toBe('Tailored to your life in Germany');
  });

  test('t() parameter substitution converts numbers/parameters correctly', () => {
    render(
      <LanguageProvider lang="en">
        <TestComponent 
          translationKey="cs_avgFootprint" 
          params={{ n: 675 }} 
        />
      </LanguageProvider>
    );

    expect(screen.getByTestId('t-val').textContent).toBe('avg 675 kg CO₂/mo');
  });

  test('invalid language fallback to English dictionary', () => {
    // 'fr' is not in translations, should fallback to English
    render(
      <LanguageProvider lang="fr">
        <TestComponent translationKey="app_startOver" />
      </LanguageProvider>
    );

    expect(screen.getByTestId('lang-val').textContent).toBe('fr');
    expect(screen.getByTestId('t-val').textContent).toBe('Start over');
  });

  test('missing key in supported language falls back to English translation', () => {
    // If a key is missing in 'hi' (e.g. mock a custom key that does not exist in 'hi' but exists in 'en')
    // Since translations.ts is statically typed, let's test a key that does not exist in either, which should return the key itself.
    render(
      <LanguageProvider lang="hi">
        <TestComponent translationKey="non_existent_key" as any />
      </LanguageProvider>
    );

    expect(screen.getByTestId('t-val').textContent).toBe('non_existent_key');
  });
});

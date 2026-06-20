import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { translations } from '../translations';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';

const TestComponent = ({ translationKey }: { translationKey: any }) => {
  const { t } = useLanguage();
  return React.createElement('div', { 'data-testid': 'translated' }, t(translationKey));
};

describe('Translations Tests', () => {
  test('all 12 language codes exist in translations', () => {
    const expectedLangs = ['en', 'hi', 'mr', 'ta', 'te', 'yo', 'ha', 'ig', 'de', 'pt', 'es', 'sw'];
    expectedLangs.forEach((lang) => {
      expect(translations[lang]).toBeDefined();
    });
    expect(Object.keys(translations).length).toBe(12);
  });

  test('Hindi translation for quiz_transport exists', () => {
    expect(translations.hi.quiz_transport).toBeDefined();
    expect(translations.hi.quiz_transport).toBe('परिवहन');
  });

  test('t() function returns string not undefined', () => {
    render(
      React.createElement(
        LanguageProvider,
        {
          lang: 'en',
          children: React.createElement(TestComponent, { translationKey: 'app_startOver' })
        }
      )
    );
    const element = screen.getByTestId('translated');
    expect(element.textContent).toBe('Start over');
    expect(element.textContent).not.toBeUndefined();
  });

  test('English fallback works for unknown language', () => {
    render(
      React.createElement(
        LanguageProvider,
        {
          lang: 'fr',
          children: React.createElement(TestComponent, { translationKey: 'app_startOver' })
        }
      )
    );
    const element = screen.getByTestId('translated');
    expect(element.textContent).toBe('Start over');
  });

  test('English fallback works for missing keys in supported language', () => {
    render(
      React.createElement(
        LanguageProvider,
        {
          lang: 'hi',
          children: React.createElement(TestComponent, { translationKey: 'non_existent_key' as any })
        }
      )
    );
    const element = screen.getByTestId('translated');
    expect(element.textContent).toBe('non_existent_key');
  });
});

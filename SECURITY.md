# Security Policy

## Reporting a Vulnerability

If you discover a security issue, please report it privately to the project maintainer.

## Security Features

Breathe includes multiple security measures:

* Input sanitization to prevent XSS attacks
* Content Security Policy (CSP)
* Environment variable protection
* API key validation
* Rate limiting for chatbot interactions
* Error boundaries for graceful failure handling

## Best Practices

When contributing:

* Never commit API keys or secrets
* Store sensitive values in environment variables
* Keep dependencies updated
* Validate user input before processing
* Follow secure coding practices

## Environment Variables

The application requires:

VITE_GEMINI_API_KEY=your_api_key_here

Do not expose production API keys in public repositories.

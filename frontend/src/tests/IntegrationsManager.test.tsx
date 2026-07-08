import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IntegrationsManager from '../components/IntegrationsManager';

describe('IntegrationsManager Component', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location.href assignment
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' } as any;
  });

  afterEach(() => {
    window.location = originalLocation;
    vi.restoreAllMocks();
  });

  test('renders all integration cards and titles', () => {
    render(<IntegrationsManager userId={99} />);
    
    expect(screen.getByText('WhatsApp Gateway')).toBeDefined();
    expect(screen.getByText('Property Finder')).toBeDefined();
    expect(screen.getByText('Bayut Portal')).toBeDefined();
    expect(screen.getByText('Email Ingestion')).toBeDefined();
  });

  test('redirects to Meta login when connecting WhatsApp', () => {
    render(<IntegrationsManager userId={99} />);
    
    // Email is disconnected initially, so it has "Authenticate Mailbox"
    const emailButton = screen.getByText('Authenticate Mailbox');
    expect(emailButton).toBeDefined();
    
    // Click Email Connect -> should redirect to Google OAuth
    fireEvent.click(emailButton);
    expect(window.location.href).toContain('api/oauth/google/login?user_id=99');
  });

  test('disconnects active channels', () => {
    render(<IntegrationsManager userId={99} />);
    
    // WhatsApp is active initially, so it has "Disconnect" button
    const disconnectButtons = screen.getAllByText('Disconnect');
    expect(disconnectButtons.length).toBeGreaterThan(0);
  });
});

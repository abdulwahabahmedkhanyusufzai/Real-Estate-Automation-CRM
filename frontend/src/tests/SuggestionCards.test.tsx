import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuggestionCards } from '../components/SuggestionCards';

describe('SuggestionCards Component', () => {
  test('renders all suggestion cards', () => {
    const handleSelect = vi.fn();
    render(<SuggestionCards onSelectSuggestion={handleSelect} />);
    
    // Check if the titles of suggestion cards are in the document
    expect(screen.getByText('Qualify WhatsApp Lead 💬')).toBeDefined();
    expect(screen.getByText('Analyze Email Lead 📧')).toBeDefined();
    expect(screen.getByText('Portal Lead Ingestion 🏠')).toBeDefined();
    expect(screen.getByText('Dubai Hills Market Report 📊')).toBeDefined();
  });

  test('calls onSelectSuggestion when a card is clicked', () => {
    const handleSelect = vi.fn();
    render(<SuggestionCards onSelectSuggestion={handleSelect} />);
    
    const whatsappCard = screen.getByText('Qualify WhatsApp Lead 💬').closest('button');
    expect(whatsappCard).not.toBeNull();
    
    if (whatsappCard) {
      fireEvent.click(whatsappCard);
      expect(handleSelect).toHaveBeenCalledWith(
        'Qualify this WhatsApp lead: "hi, looking for 4b villa in dxb hills budget 3m urgent"'
      );
    }
  });
});

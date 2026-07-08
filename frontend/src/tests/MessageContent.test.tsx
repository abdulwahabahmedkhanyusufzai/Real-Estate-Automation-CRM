import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageContent } from '../components/MessageContent';

describe('MessageContent Component', () => {
  test('renders plain text line by line', () => {
    render(<MessageContent content={`Hello World
Second Line`} />);
    expect(screen.getByText('Hello World')).toBeDefined();
    expect(screen.getByText('Second Line')).toBeDefined();
  });

  test('renders bold text correctly', () => {
    render(<MessageContent content="This is **bold text** here." />);
    const boldEl = screen.getByText('bold text');
    expect(boldEl).toBeDefined();
    expect(boldEl.tagName).toBe('STRONG');
  });

  test('renders headers correctly', () => {
    render(<MessageContent content="### My Header" />);
    const headerEl = screen.getByText('My Header');
    expect(headerEl).toBeDefined();
    expect(headerEl.tagName).toBe('H3');
  });

  test('renders code blocks correctly', () => {
    const codeBlock = '```javascript\nconsole.log("hello");\n```';
    render(<MessageContent content={codeBlock} />);
    expect(screen.getByText('javascript')).toBeDefined();
    expect(screen.getByText('console.log("hello");')).toBeDefined();
  });
});

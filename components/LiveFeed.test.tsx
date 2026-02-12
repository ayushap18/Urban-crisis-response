import React from 'react';
import { render, screen, fireEvent } from '../test-utils';
import LiveFeed from './LiveFeed';
import { describe, it, expect, jest } from '@jest/globals';

// Mock react-window to render full list in test
jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemSize, ...props }: any) => (
    <div data-testid="virtual-list">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index}>
          {children({ index, style: { height: itemSize, top: index * itemSize } })}
        </div>
      ))}
    </div>
  ),
}));

// Mock hooks if necessary, but using test-utils with Context is better
// However, we want to control the data returned by useCrisis for specific test cases.
// For now, we rely on the Mock Data provided by the Context in test-utils default state.

describe('LiveFeed Component', () => {
  it('renders without crashing', () => {
    render(<LiveFeed />);
    expect(screen.getByText('Live Dispatch')).toBeInTheDocument();
  });

  it('filters incidents when filter buttons are clicked', () => {
    render(<LiveFeed />);
    
    // Default should show all
    // Note: This relies on MOCK_INCIDENTS being loaded by the Context on mount
    
    // Click CRITICAL filter
    const criticalBtn = screen.getByText('CRITICAL');
    fireEvent.click(criticalBtn);
    
    // Check if aria-selected updated
    expect(criticalBtn).toHaveAttribute('aria-selected', 'true');
    
    // We expect to see incident-001 (Structure Fire) which is CRITICAL
    expect(screen.getByText(/Structure Fire/i)).toBeInTheDocument();
  });

  it('searches incidents by text', () => {
    render(<LiveFeed />);
    
    const searchInput = screen.getByPlaceholderText(/Search incidents/i);
    fireEvent.change(searchInput, { target: { value: 'Suspicious' } });
    
    // Should show Suspicious Package
    expect(screen.getByText(/Suspicious Package/i)).toBeInTheDocument();
    
    // Should NOT show Structure Fire
    expect(screen.queryByText(/Structure Fire/i)).not.toBeInTheDocument();
  });

  it('supports keyboard navigation for filtering', () => {
    render(<LiveFeed />);
    
    // Press Ctrl+2 for Critical
    fireEvent.keyDown(window, { key: '2', ctrlKey: true });
    
    const criticalBtn = screen.getByText('CRITICAL');
    expect(criticalBtn).toHaveAttribute('aria-selected', 'true');
  });
});
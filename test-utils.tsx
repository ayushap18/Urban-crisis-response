import React, { ReactElement } from 'react';
import { render, RenderOptions, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CrisisProvider } from './context/CrisisContext';
import { AccessibilityProvider } from './context/AccessibilityContext';

// Create a custom render function that wraps components in all necessary providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Turn off retries for testing
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <CrisisProvider>
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
      </CrisisProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render, screen, fireEvent, waitFor };
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageErrorBoundary from '../PageErrorBoundary';

// A component that crashes when rendered
const ThrowingComponent = () => {
  throw new Error('Test rendering crash');
};

describe('PageErrorBoundary component', () => {
  it('should catch errors from children and show the recovery UI', () => {
    // Suppress console.error output during the throwing test to keep test runs clean
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <PageErrorBoundary>
        <ThrowingComponent />
      </PageErrorBoundary>
    );

    expect(screen.getByText('This page failed to load')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong while opening this section.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload/i })).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});

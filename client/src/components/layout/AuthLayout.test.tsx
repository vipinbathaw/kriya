import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('renders title and subtitle', () => {
    render(<AuthLayout title="Welcome" subtitle="Sign in">child</AuthLayout>);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<AuthLayout title="Test">form content</AuthLayout>);
    expect(screen.getByText('form content')).toBeInTheDocument();
  });

  it('renders Kriya branding', () => {
    render(<AuthLayout title="Test">child</AuthLayout>);
    expect(screen.getByText('Kriya')).toBeInTheDocument();
    expect(screen.getByText('life management')).toBeInTheDocument();
  });
});

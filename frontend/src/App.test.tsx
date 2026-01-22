import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Pollen Paw title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Pollen Paw/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders search button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Search/i);
  expect(buttonElement).toBeInTheDocument();
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders data input area', () => {
  render(<App />);
  const inputEditor = screen.getByTestId('data-input');
  expect(inputEditor).toBeInTheDocument();
});

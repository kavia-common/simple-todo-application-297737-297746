import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header and input', () => {
  render(<App />);
  expect(screen.getByText(/Ocean Todos/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/What needs to be done/i)).toBeInTheDocument();
});

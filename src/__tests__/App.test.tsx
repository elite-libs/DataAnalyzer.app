import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import eventSearch from '../../public/data/ticketmaster-event-results.json';

test('renders data input area', async () => {
  const { container, getByLabelText, getByText } = render(<App />);
  const textbox = await waitFor(() => {
    return container.querySelector('textbox');
  });
  // queryAllByRole('textbox').map((el) => console.warn(el.outerHTML));
  if (textbox) {
    textbox.nodeValue = JSON.stringify(eventSearch, null, 2);
  }
  const outputButtons = await waitFor(() => {
    return getByLabelText('Output to TypeScript');
  });
  const tsButton = getByLabelText('Output to TypeScript');
  // console.log('tsButton', tsButton);
  fireEvent.click(tsButton);
  fireEvent.change(getByLabelText('Enter your schema name').querySelector('input')!, {
    target: { value: 'EventResults' },
  });
  tsButton.click();
  await waitFor(() => fireEvent.click(tsButton));
  const inputEditor = screen.getByTestId('data-input');
  expect(inputEditor).toBeInTheDocument();
  const codeArea = await waitFor(() => {
    return container.querySelector('pre');
  });
  // console.log('CODE', codeArea?.textContent);
  // const codeResults = await waitFor(() => getByText('EventResults'));
  // expect(codeResults).toBeInTheDocument();
});

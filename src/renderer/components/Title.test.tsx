import { render } from '@testing-library/react';
import { Title } from './Title';

describe('Title', () => {
  it('sets document.title when rendered', () => {
    render(<Title>Test</Title>);
    expect(document.title).toBe('Test');
  });
});

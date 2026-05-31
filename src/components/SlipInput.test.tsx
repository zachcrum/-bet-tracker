import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SlipInput } from './SlipInput';

describe('SlipInput', () => {
  it('submits pasted slip text', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SlipInput onSubmitText={onSubmit} onUploadImage={vi.fn()} isReadingImage={false} />);

    await user.type(screen.getByLabelText('Sportsbet slip text'), 'Same Game Multi @ 10.00');
    await user.click(screen.getByRole('button', { name: 'Analyze Slip' }));

    expect(onSubmit).toHaveBeenCalledWith('Same Game Multi @ 10.00');
  });

  it('disables screenshot upload while reading an image', () => {
    render(<SlipInput onSubmitText={vi.fn()} onUploadImage={vi.fn()} isReadingImage={true} />);

    expect(screen.getByLabelText('Upload Screenshot')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reading Image' })).toBeDisabled();
  });
});

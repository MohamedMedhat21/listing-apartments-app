import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ApartmentGallery } from './apartment-gallery';

describe('ApartmentGallery', () => {
  it('renders a placeholder when imageUrls is empty (BR-17)', () => {
    render(<ApartmentGallery imageUrls={[]} unitName="Palm View 3A" />);

    expect(screen.getByTestId('apartment-gallery-empty')).toBeInTheDocument();
    expect(screen.getByText('No photos available for this apartment.')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders the main image and thumbnails when multiple images exist', () => {
    render(
      <ApartmentGallery
        unitName="Palm View 3A"
        imageUrls={[
          'https://example.com/a.jpg',
          'https://example.com/b.jpg',
          'https://example.com/c.jpg',
        ]}
      />,
    );

    expect(screen.getByRole('img', { name: /Palm View 3A photo 1 of 3/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Show photo/i })).toHaveLength(3);
  });
});

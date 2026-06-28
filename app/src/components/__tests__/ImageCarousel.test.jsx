import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageCarousel from '../ImageCarousel';

describe('ImageCarousel component', () => {
    it('should render fallback container when no images are provided', () => {
        render(<ImageCarousel images={[]} />);
        
        expect(screen.getByText(/No Image Available/i)).toBeInTheDocument();
    });

    it('should sanitize invalid images (placeholders, missing, null, undefined) and deduplicate them', () => {
        const testImages = [
            'valid-species-1.jpg',
            'placeholder-image.jpg',
            'no-image-found.png',
            'missing-file.jpg',
            'null.jpg',
            'undefined-path.png',
            'valid-species-1.jpg' // duplicate
        ];

        render(<ImageCarousel images={testImages} />);

        // The image elements should only render the sanitized one ('valid-species-1.jpg')
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(1);
        expect(images[0]).toHaveAttribute('src', '/images/wildlife/valid-species-1.jpg');
    });

    it('should filter out a broken image on load failure and show fallback if none remain', async () => {
        const testImages = ['broken-image-1.jpg'];
        render(<ImageCarousel images={testImages} />);

        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', '/images/wildlife/broken-image-1.jpg');

        // Simulate onError event trigger
        fireEvent.error(img);

        // Wait for the state to update and image to be removed
        await waitFor(() => {
            expect(screen.queryByRole('img')).toBeNull();
            expect(screen.getByText(/No Image Available/i)).toBeInTheDocument();
        });
    });

    it('should filter out a broken image and swap to the next available image if one exists', async () => {
        const testImages = ['broken-image.jpg', 'working-image.jpg'];
        render(<ImageCarousel images={testImages} />);

        const img = screen.getByAltText('Image 1');
        expect(img).toHaveAttribute('src', '/images/wildlife/broken-image.jpg');

        // Trigger load failure on the first image
        fireEvent.error(img);

        // Wait for the next image to be promoted and render
        await waitFor(() => {
            const updatedImg = screen.getByRole('img');
            expect(updatedImg).toHaveAttribute('src', '/images/wildlife/working-image.jpg');
        });
    });
});

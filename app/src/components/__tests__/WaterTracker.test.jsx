import React from 'react';
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WaterTracker from '../WaterTracker';

describe('WaterTracker', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <WaterTracker />
            </MemoryRouter>
        );
    });
});

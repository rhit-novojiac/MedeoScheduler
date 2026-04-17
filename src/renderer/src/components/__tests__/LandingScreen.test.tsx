// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingScreen } from '../shared/LandingScreen';

const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
    useNavigate: () => mockNavigate
}));

vi.mock('../../../hooks/useTheme', () => ({
    useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() })
}));

describe('LandingScreen Component', () => {
    it('should render the main title and options', () => {
        render(<LandingScreen />);
        expect(screen.getByText('Medeo Scheduler')).toBeInTheDocument();
        expect(screen.getByText('Admin Mode')).toBeInTheDocument();
        expect(screen.getByText('Student Kiosk')).toBeInTheDocument();
    });

    it('should navigate to /admin when Admin Mode is clicked', () => {
        render(<LandingScreen />);
        fireEvent.click(screen.getByText('Admin Mode'));
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/admin' });
    });

    it('should navigate to /kiosk when Student Kiosk is clicked', () => {
        render(<LandingScreen />);
        fireEvent.click(screen.getByText('Student Kiosk'));
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/kiosk' });
    });
});

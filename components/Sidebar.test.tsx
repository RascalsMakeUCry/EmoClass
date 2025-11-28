import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('Sidebar Component', () => {
  describe('Unit Tests', () => {
    it('should render all navigation items', () => {
      render(<Sidebar />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Input Emotion')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('More')).toBeInTheDocument();
    });

    it('should render EmoClass logo', () => {
      render(<Sidebar />);

      expect(screen.getByText('EmoClass')).toBeInTheDocument();
    });

    it('should highlight active navigation item', () => {
      render(<Sidebar />);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('bg-red-50');
      expect(dashboardLink).toHaveClass('text-red-600');
    });

    it('should render mobile menu button', () => {
      render(<Sidebar />);

      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toBeInTheDocument();
    });

    it('should toggle mobile menu when button is clicked', () => {
      render(<Sidebar />);

      const menuButton = screen.getByLabelText('Toggle menu');
      const sidebar = screen.getByRole('complementary');

      // Initially closed on mobile
      expect(sidebar).toHaveClass('-translate-x-full');

      // Click to open
      fireEvent.click(menuButton);
      expect(sidebar).toHaveClass('translate-x-0');

      // Click to close
      fireEvent.click(menuButton);
      expect(sidebar).toHaveClass('-translate-x-full');
    });

    it('should call onToggle callback when mobile menu is toggled', () => {
      const onToggle = vi.fn();
      render(<Sidebar onToggle={onToggle} />);

      const menuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(menuButton);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should close mobile menu when clicking overlay', () => {
      render(<Sidebar />);

      const menuButton = screen.getByLabelText('Toggle menu');
      
      // Open menu
      fireEvent.click(menuButton);
      
      const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
      expect(overlay).toBeInTheDocument();

      // Click overlay to close
      if (overlay) {
        fireEvent.click(overlay);
      }

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('-translate-x-full');
    });

    it('should close mobile menu when clicking a navigation item', () => {
      render(<Sidebar />);

      const menuButton = screen.getByLabelText('Toggle menu');
      
      // Open menu
      fireEvent.click(menuButton);

      // Click a navigation item
      const reportsLink = screen.getByText('Reports');
      fireEvent.click(reportsLink);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('-translate-x-full');
    });

    it('should render collapsed sidebar when isCollapsed is true', () => {
      render(<Sidebar isCollapsed={true} />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('w-20');
    });

    it('should render expanded sidebar when isCollapsed is false', () => {
      render(<Sidebar isCollapsed={false} />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('w-64');
    });

    it('should hide labels when collapsed', () => {
      const { rerender } = render(<Sidebar isCollapsed={false} />);
      
      // Labels visible when expanded
      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      // Rerender with collapsed
      rerender(<Sidebar isCollapsed={true} />);
      
      // Labels should not be visible (but icons still are)
      const dashboardText = screen.queryByText('Dashboard');
      expect(dashboardText).not.toBeInTheDocument();
    });

    it('should render footer with version info when not collapsed', () => {
      render(<Sidebar isCollapsed={false} />);

      expect(screen.getByText('EmoClass v1.0')).toBeInTheDocument();
      expect(screen.getByText('© 2025 EISD Hackathon')).toBeInTheDocument();
    });

    it('should not render footer when collapsed', () => {
      render(<Sidebar isCollapsed={true} />);

      expect(screen.queryByText('EmoClass v1.0')).not.toBeInTheDocument();
    });

    it('should have proper ARIA labels for accessibility', () => {
      render(<Sidebar />);

      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toHaveAttribute('aria-label', 'Toggle menu');
    });

    it('should apply hover styles to navigation items', () => {
      render(<Sidebar />);

      const reportsLink = screen.getByText('Reports').closest('a');
      expect(reportsLink).toHaveClass('hover:bg-gray-50');
      expect(reportsLink).toHaveClass('hover:text-gray-900');
    });
  });
});

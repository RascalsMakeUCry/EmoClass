import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsCard from './StatsCard';

describe('StatsCard Component', () => {
  it('should render title, value, and subtitle', () => {
    render(
      <StatsCard
        title="Students Checked In"
        value="28/30"
        subtitle="95% participation today"
        icon="✓"
        color="green"
      />
    );

    expect(screen.getByText('Students Checked In')).toBeInTheDocument();
    expect(screen.getByText('28/30')).toBeInTheDocument();
    expect(screen.getByText('95% participation today')).toBeInTheDocument();
  });

  it('should render icon', () => {
    render(
      <StatsCard
        title="Test"
        value="100"
        subtitle="Test subtitle"
        icon="✓"
        color="green"
      />
    );

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should apply green color classes', () => {
    const { container } = render(
      <StatsCard
        title="Test"
        value="100"
        subtitle="Test"
        icon="✓"
        color="green"
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('from-green-50');
    expect(card.className).toContain('border-green-200');
  });

  it('should apply yellow color classes', () => {
    const { container } = render(
      <StatsCard
        title="Test"
        value="100"
        subtitle="Test"
        icon="⚠"
        color="yellow"
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('from-yellow-50');
    expect(card.className).toContain('border-yellow-200');
  });

  it('should apply red color classes', () => {
    const { container } = render(
      <StatsCard
        title="Test"
        value="100"
        subtitle="Test"
        icon="✗"
        color="red"
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('from-red-50');
    expect(card.className).toContain('border-red-200');
  });

  it('should render trend indicator when provided', () => {
    render(
      <StatsCard
        title="Test"
        value="100"
        subtitle="Test"
        icon="✓"
        color="green"
        trend={{ value: 5, direction: 'up' }}
      />
    );

    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
  });

  it('should render down trend indicator', () => {
    render(
      <StatsCard
        title="Test"
        value="100"
        subtitle="Test"
        icon="✓"
        color="green"
        trend={{ value: 3, direction: 'down' }}
      />
    );

    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText('3%')).toBeInTheDocument();
  });

  it('should not render trend when not provided', () => {
    render(
      <StatsCard
        title="Test"
        value="100"
        subtitle="Test"
        icon="✓"
        color="green"
      />
    );

    expect(screen.queryByText('↑')).not.toBeInTheDocument();
    expect(screen.queryByText('↓')).not.toBeInTheDocument();
  });

  it('should handle numeric values', () => {
    render(
      <StatsCard
        title="Test"
        value={42}
        subtitle="Test"
        icon="✓"
        color="green"
      />
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should handle string values', () => {
    render(
      <StatsCard
        title="Test"
        value="25/30"
        subtitle="Test"
        icon="✓"
        color="green"
      />
    );

    expect(screen.getByText('25/30')).toBeInTheDocument();
  });
});

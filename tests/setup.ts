import '@testing-library/jest-dom';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
    defaults: {},
    prototype: {}
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn()
}));

// Mock react-chartjs-2 Line component
jest.mock('react-chartjs-2', () => ({
  Line: function MockChart() {
    return '<div data-testid="mock-chart"></div>';
  }
}));

// Set test environment
process.env.NODE_ENV = 'test';

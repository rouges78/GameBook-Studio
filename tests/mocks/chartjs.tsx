import React from 'react';

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

// Create a mock Line component
const MockLine = () => {
  return React.createElement('div', { 'data-testid': 'mock-chart' });
};

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: MockLine
}));

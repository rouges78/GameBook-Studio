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

// Mock react-chartjs-2 Line component
jest.mock('react-chartjs-2', () => ({
  Line: function MockChart(props: { data: { datasets: Array<{ data: number[] }> } }) {
    return React.createElement('div', {
      'data-testid': 'mock-chart',
      children: props.data.datasets[0].data.map((point, index) =>
        React.createElement('div', {
          key: index,
          'data-point': point
        })
      )
    });
  }
}));

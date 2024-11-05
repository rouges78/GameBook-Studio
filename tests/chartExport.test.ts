import { svgToPng, getSvgString, exportChart } from '../src/components/TelemetryDashboard/utils/chartExport';
import type { ChartExportOptions } from '../src/components/TelemetryDashboard/types';

describe('Chart Export Utils', () => {
  let mockSvgElement: SVGElement;
  let appendChildSpy: jest.SpyInstance;
  let removeChildSpy: jest.SpyInstance;
  let createElementSpy: jest.SpyInstance;
  let revokeObjectURLSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock SVG element
    mockSvgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockSvgElement.setAttribute('width', '100');
    mockSvgElement.setAttribute('height', '100');

    // Mock canvas and context
    const mockContext = {
      fillStyle: '',
      fillRect: jest.fn(),
      drawImage: jest.fn(),
    };

    const mockCanvas = {
      getContext: jest.fn(() => mockContext),
      toDataURL: jest.fn(() => 'mock-data-url'),
      width: 0,
      height: 0,
    };

    // Mock createElement with specific element types
    createElementSpy = jest.spyOn(document, 'createElement');
    createElementSpy.mockImplementation((tagName: string): HTMLElement => {
      switch (tagName) {
        case 'canvas':
          return mockCanvas as unknown as HTMLCanvasElement;
        case 'a': {
          const link = document.createElement('a');
          Object.defineProperty(link, 'click', {
            value: jest.fn(),
            writable: true
          });
          return link;
        }
        default:
          return document.createElement(tagName);
      }
    });

    appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(node => node);
    removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(node => node);
    revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    // Mock URL.createObjectURL
    URL.createObjectURL = jest.fn(() => 'mock-object-url');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('svgToPng', () => {
    it('should convert SVG to PNG data URL', async () => {
      const options = { width: 800, height: 600, quality: 1 };
      const result = await svgToPng(mockSvgElement, options);
      
      expect(result).toBe('mock-data-url');
      expect(createElementSpy).toHaveBeenCalledWith('canvas');
    });

    it('should handle canvas context error', async () => {
      const mockCanvasWithoutContext = {
        getContext: () => null,
      };
      createElementSpy.mockReturnValueOnce(mockCanvasWithoutContext as unknown as HTMLCanvasElement);

      await expect(svgToPng(mockSvgElement, {})).rejects.toThrow('Failed to get canvas context');
    });
  });

  describe('getSvgString', () => {
    it('should convert SVG element to string with background', () => {
      const result = getSvgString(mockSvgElement);
      
      expect(result).toContain('rect');
      expect(result).toContain('fill="white"');
    });
  });

  describe('exportChart', () => {
    const mockOptions: ChartExportOptions = {
      format: 'PNG',
      filename: 'test-chart',
      width: 800,
      height: 600,
      quality: 1,
    };

    it('should export chart as PNG', async () => {
      const mockLink = document.createElement('a');
      const clickSpy = jest.fn();
      Object.defineProperty(mockLink, 'click', {
        value: clickSpy,
        writable: true
      });
      createElementSpy.mockReturnValueOnce(mockLink);

      await exportChart(mockSvgElement, mockOptions);

      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it('should export chart as SVG', async () => {
      const mockLink = document.createElement('a');
      const clickSpy = jest.fn();
      Object.defineProperty(mockLink, 'click', {
        value: clickSpy,
        writable: true
      });
      createElementSpy.mockReturnValueOnce(mockLink);

      await exportChart(mockSvgElement, { ...mockOptions, format: 'SVG' });

      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).not.toHaveBeenCalled();
    });

    it('should handle export errors', async () => {
      createElementSpy.mockImplementationOnce(() => {
        throw new Error('Export failed');
      });

      await expect(exportChart(mockSvgElement, mockOptions)).rejects.toThrow('Export failed');
    });
  });
});

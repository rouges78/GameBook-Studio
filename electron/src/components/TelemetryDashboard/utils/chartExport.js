"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportChart = exports.getSvgString = exports.svgToPng = void 0;
/**
 * Converts an SVG element to a PNG data URL
 * @param svgElement The SVG element to convert
 * @param options Export options including width, height, and quality
 * @returns Promise resolving to a data URL containing the PNG image
 */
const svgToPng = async (svgElement, options) => {
    return new Promise((resolve, reject) => {
        const { width = 1200, height = 600, quality = 1 } = options;
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
        }
        // Create an image from the SVG
        const image = new Image();
        image.onload = () => {
            // Set background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            // Draw the image
            ctx.drawImage(image, 0, 0, width, height);
            try {
                // Convert to PNG
                const dataUrl = canvas.toDataURL('image/png', quality);
                resolve(dataUrl);
            }
            catch (error) {
                reject(error);
            }
        };
        image.onerror = reject;
        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        image.src = URL.createObjectURL(svgBlob);
    });
};
exports.svgToPng = svgToPng;
/**
 * Converts an SVG element to SVG string
 * @param svgElement The SVG element to convert
 * @returns SVG as a string
 */
const getSvgString = (svgElement) => {
    const clone = svgElement.cloneNode(true);
    // Add white background
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', 'white');
    clone.insertBefore(background, clone.firstChild);
    return new XMLSerializer().serializeToString(clone);
};
exports.getSvgString = getSvgString;
/**
 * Exports a chart as either PNG or SVG
 * @param svgElement The SVG element representing the chart
 * @param options Export options including format, dimensions, and filename
 */
const exportChart = async (svgElement, options) => {
    const { format, filename = 'chart' } = options;
    try {
        let content;
        let mimeType;
        let extension;
        if (format === 'PNG') {
            content = await (0, exports.svgToPng)(svgElement, options);
            mimeType = 'image/png';
            extension = 'png';
        }
        else {
            content = `data:image/svg+xml;charset=utf-8,${encodeURIComponent((0, exports.getSvgString)(svgElement))}`;
            mimeType = 'image/svg+xml';
            extension = 'svg';
        }
        // Create download link
        const link = document.createElement('a');
        link.href = content;
        link.download = `${filename}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Clean up object URL if created
        if (format === 'PNG') {
            URL.revokeObjectURL(content);
        }
    }
    catch (error) {
        console.error('Failed to export chart:', error);
        throw error;
    }
};
exports.exportChart = exportChart;

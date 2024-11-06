"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniMap = void 0;
const react_1 = __importStar(require("react"));
const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 150;
const NODE_SIZE = 4;
const MiniMap = ({ nodes, links, viewBox, mapWidth, mapHeight, onViewBoxChange }) => {
    // Calculate scale to fit the entire map in the minimap
    const scale = Math.min(MINIMAP_WIDTH / mapWidth, MINIMAP_HEIGHT / mapHeight);
    // Calculate dimensions to maintain aspect ratio
    const scaledWidth = mapWidth * scale;
    const scaledHeight = mapHeight * scale;
    // Center the scaled map in the minimap container
    const offsetX = (MINIMAP_WIDTH - scaledWidth) / 2;
    const offsetY = (MINIMAP_HEIGHT - scaledHeight) / 2;
    // Calculate viewport rectangle dimensions
    const viewportWidth = (viewBox.width / mapWidth) * scaledWidth;
    const viewportHeight = (viewBox.height / mapHeight) * scaledHeight;
    const viewportX = (viewBox.x / mapWidth) * scaledWidth + offsetX;
    const viewportY = (viewBox.y / mapHeight) * scaledHeight + offsetY;
    const handleClick = (0, react_1.useCallback)((event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left - offsetX;
        const y = event.clientY - rect.top - offsetY;
        // Convert click coordinates back to map coordinates
        const mapX = (x / scaledWidth) * mapWidth;
        const mapY = (y / scaledHeight) * mapHeight;
        // Center the viewport on the clicked point
        const newX = Math.max(0, Math.min(mapWidth - viewBox.width, mapX - viewBox.width / 2));
        const newY = Math.max(0, Math.min(mapHeight - viewBox.height, mapY - viewBox.height / 2));
        onViewBoxChange(newX, newY);
    }, [mapWidth, mapHeight, scaledWidth, scaledHeight, offsetX, offsetY, viewBox.width, viewBox.height, onViewBoxChange]);
    return (<div className="absolute bottom-4 left-4 bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700">
      <svg width={MINIMAP_WIDTH} height={MINIMAP_HEIGHT} onClick={handleClick} className="cursor-pointer">
        {/* Background */}
        <rect x={0} y={0} width={MINIMAP_WIDTH} height={MINIMAP_HEIGHT} fill="#1a1a1a"/>

        {/* Links */}
        <g transform={`translate(${offsetX},${offsetY})`}>
          {links.map((link) => {
            const source = nodes.find(n => n.id === link.source);
            const target = nodes.find(n => n.id === link.target);
            if (!source || !target)
                return null;
            return (<line key={`${link.source}-${link.target}`} x1={source.x * scale} y1={source.y * scale} x2={target.x * scale} y2={target.y * scale} stroke={link.isHighlighted ? '#4CAF50' : '#666'} strokeWidth={1} opacity={0.5}/>);
        })}
        </g>

        {/* Nodes */}
        <g transform={`translate(${offsetX},${offsetY})`}>
          {nodes.map((node) => (<circle key={node.id} cx={node.x * scale} cy={node.y * scale} r={NODE_SIZE} fill={node.type === 'finale' ? '#e74c3c' : node.type === 'nodo' ? '#3498db' : '#2ecc71'} opacity={0.8}/>))}
        </g>

        {/* Viewport Rectangle */}
        <rect x={viewportX} y={viewportY} width={viewportWidth} height={viewportHeight} fill="none" stroke="#fff" strokeWidth={1} opacity={0.5}/>
      </svg>
    </div>);
};
exports.MiniMap = MiniMap;

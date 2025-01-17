"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryMapCanvas = void 0;
const react_1 = __importDefault(require("react"));
const framer_motion_1 = require("framer-motion");
const utils_1 = require("../utils");
const StoryMapCanvas = ({ svgRef, nodes, links, viewBox, showGrid, backgroundImage, imageAdjustments, useCurvedLines, selectedNode, isDragMode, onNodeClick, onNodeDragStart, onMapPanStart, onMapPan, onMapPanEnd, onNodeDrag, onNodeDragEnd, onZoom }) => {
    const [isPanning, setIsPanning] = react_1.default.useState(false);
    const handleTouchStart = (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        onMapPanStart({
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => { },
        });
    };
    const handleTouchMove = (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        onMapPan({
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => { },
        });
        onNodeDrag({
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => { },
        });
    };
    const handleTouchEnd = () => {
        onMapPanEnd();
        onNodeDragEnd();
    };
    const handleMouseDown = (event) => {
        setIsPanning(true);
        onMapPanStart(event);
    };
    const handleMouseUp = () => {
        setIsPanning(false);
        onMapPanEnd();
        onNodeDragEnd();
    };
    const handleMouseLeave = () => {
        setIsPanning(false);
        onMapPanEnd();
        onNodeDragEnd();
    };
    const handleWheel = (event) => {
        if (backgroundImage) {
            event.preventDefault();
            const delta = event.deltaY > 0 ? -0.1 : 0.1;
            onZoom(delta);
        }
    };
    return (<svg ref={svgRef} className={`w-full h-full select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`} style={{ background: '#0A1929', touchAction: 'none' }} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} onMouseDown={handleMouseDown} onMouseMove={(e) => {
            onMapPan(e);
            onNodeDrag(e);
        }} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd} onWheel={handleWheel}>
      {backgroundImage && (<image href={backgroundImage} width={imageAdjustments.width} height={imageAdjustments.height} style={{
                filter: `
              contrast(${imageAdjustments.contrast}%)
              brightness(${imageAdjustments.brightness}%)
              grayscale(${imageAdjustments.blackAndWhite}%)
              opacity(${imageAdjustments.transparency}%)
              ${imageAdjustments.sharpness !== 100 ? `blur(${(100 - imageAdjustments.sharpness) * 0.1}px)` : ''}
            `
            }} className="pointer-events-none"/>)}
      
      {showGrid && (<>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1E3A5F" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" className="pointer-events-none"/>
        </>)}

      {/* Connection Lines */}
      {links.map((link, index) => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            if (sourceNode && targetNode) {
                return (<g key={`link-${index}`} className="pointer-events-none">
              <framer_motion_1.motion.path d={(0, utils_1.getConnectionPath)(sourceNode, targetNode, useCurvedLines)} stroke={link.isHighlighted ? "#FFE55C" : "#4A90E2"} strokeWidth={link.isHighlighted ? "3" : "2"} strokeDasharray="10,10" initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: -20 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} fill="none" markerEnd={`url(#${link.isHighlighted ? 'arrowhead-highlighted' : 'arrowhead'})`} className={link.isHighlighted ? "filter drop-shadow-[0_0_8px_rgba(255,229,92,0.5)]" : ""}/>
            </g>);
            }
            return null;
        })}

      {/* Nodes */}
      {nodes.map(node => (<g key={node.id} transform={`translate(${node.x},${node.y})`} onMouseDown={(e) => {
                e.stopPropagation();
                onNodeDragStart(e, node.id);
            }} onClick={(e) => {
                e.stopPropagation();
                onNodeClick(node.id);
            }} style={{ cursor: isDragMode && !node.locked ? 'move' : 'pointer' }}>
          {node.locked && (<circle r="32" fill="none" stroke="white" strokeWidth="2" className="animate-pulse opacity-50"/>)}
          <circle r="30" fill={(0, utils_1.getNodeColor)(node.type, node.locked)} className={`filter transition-colors duration-200 ${selectedNode === node.id ? 'drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]' : ''}`}/>
          <text textAnchor="middle" dy="5" fill="white" fontSize="16" fontWeight="bold" className="pointer-events-none">
            #{node.id}
          </text>
        </g>))}

      {/* Arrow Marker Definitions */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#4A90E2"/>
        </marker>
        <marker id="arrowhead-highlighted" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#FFE55C" className="filter drop-shadow-[0_0_8px_rgba(255,229,92,0.5)]"/>
        </marker>
      </defs>
    </svg>);
};
exports.StoryMapCanvas = StoryMapCanvas;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStoryMap = void 0;
const react_1 = require("react");
const useInertiaScroll_1 = require("./useInertiaScroll");
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const useStoryMap = (paragraphs, mapSettings, onSave, onUpdateParagraphs, onUpdateMapSettings) => {
    const [zoom, setZoom] = (0, react_1.useState)(1);
    const [showGrid, setShowGrid] = (0, react_1.useState)(true);
    const [selectedNode, setSelectedNode] = (0, react_1.useState)(null);
    const [selectedAction, setSelectedAction] = (0, react_1.useState)(null);
    const [nodes, setNodes] = (0, react_1.useState)([]);
    const [links, setLinks] = (0, react_1.useState)([]);
    const [viewBox, setViewBox] = (0, react_1.useState)({ x: 0, y: 0, width: 1000, height: 800 });
    const [backgroundImage, setBackgroundImage] = (0, react_1.useState)(mapSettings?.backgroundImage || null);
    const [isDragMode, setIsDragMode] = (0, react_1.useState)(false);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const [dragStart, setDragStart] = (0, react_1.useState)({ x: 0, y: 0 });
    const [useCurvedLines, setUseCurvedLines] = (0, react_1.useState)(true);
    const [isPanning, setIsPanning] = (0, react_1.useState)(false);
    const [panStart, setPanStart] = (0, react_1.useState)({ x: 0, y: 0 });
    const [lastBackup, setLastBackup] = (0, react_1.useState)(null);
    const [isAutoBackupEnabled, setIsAutoBackupEnabled] = (0, react_1.useState)(true);
    const [imageAdjustments, setImageAdjustments] = (0, react_1.useState)(mapSettings?.imageAdjustments || {
        contrast: 100,
        transparency: 100,
        blackAndWhite: 0,
        sharpness: 100,
        brightness: 100,
        width: 1000,
        height: 800,
        maintainAspectRatio: true
    });
    const svgRef = (0, react_1.useRef)(null);
    const fileInputRef = (0, react_1.useRef)(null);
    const originalImageDimensions = (0, react_1.useRef)(null);
    const isInitialized = (0, react_1.useRef)(false);
    // Get bounds for panning and zooming
    const getBounds = (0, react_1.useCallback)(() => {
        const bounds = {
            minX: 0,
            minY: 0,
            maxX: imageAdjustments.width || viewBox.width,
            maxY: imageAdjustments.height || viewBox.height
        };
        return bounds;
    }, [imageAdjustments.width, imageAdjustments.height, viewBox.width, viewBox.height]);
    // Handle inertia scrolling
    const handleInertiaScroll = (0, react_1.useCallback)((dx, dy) => {
        const bounds = getBounds();
        setViewBox(prev => {
            // Calculate new viewBox position
            const newX = prev.x - dx;
            const newY = prev.y - dy;
            // Calculate maximum allowed pan distances
            const maxX = Math.max(0, bounds.maxX - prev.width);
            const maxY = Math.max(0, bounds.maxY - prev.height);
            // Constrain the viewBox within the bounds
            const constrainedX = Math.max(0, Math.min(maxX, newX));
            const constrainedY = Math.max(0, Math.min(maxY, newY));
            return {
                ...prev,
                x: constrainedX,
                y: constrainedY
            };
        });
    }, [getBounds]);
    const { startTracking, updateTracking, stopTracking } = (0, useInertiaScroll_1.useInertiaScroll)(handleInertiaScroll, { friction: 0.95, minVelocity: 0.1 });
    // Save map settings
    const saveMapSettings = (0, react_1.useCallback)(() => {
        if (!onUpdateMapSettings)
            return;
        onUpdateMapSettings({
            backgroundImage,
            imageAdjustments
        });
    }, [backgroundImage, imageAdjustments, onUpdateMapSettings]);
    // Update links based on current nodes
    const updateLinks = (0, react_1.useCallback)((currentNodes) => {
        const newLinks = currentNodes.flatMap(node => node.actions
            .filter(a => a['N.Par.'])
            .map(a => ({
            source: node.id,
            target: parseInt(a['N.Par.']),
            isPaused: false,
            isHighlighted: false
        })));
        setLinks(newLinks);
    }, []);
    // Save node positions and update paragraphs
    const saveNodePositions = (0, react_1.useCallback)(() => {
        if (!onUpdateParagraphs)
            return;
        const updatedParagraphs = paragraphs.map(p => {
            const node = nodes.find(n => n.id === p.id);
            if (!node)
                return p;
            return {
                ...p,
                x: node.x,
                y: node.y,
                locked: node.locked,
                title: node.title,
                type: node.type,
                actions: node.actions,
                content: p.content,
                incomingConnections: p.incomingConnections,
                outgoingConnections: p.outgoingConnections,
                image: p.image
            };
        });
        onUpdateParagraphs(updatedParagraphs);
    }, [nodes, paragraphs, onUpdateParagraphs]);
    // Initialize nodes with saved positions or default positions
    (0, react_1.useEffect)(() => {
        if (!isInitialized.current) {
            const initialNodes = paragraphs.map((p, index) => ({
                id: p.id,
                x: p.x ?? (100 + (index % 5) * 200),
                y: p.y ?? (100 + Math.floor(index / 5) * 200),
                type: p.type,
                title: p.title,
                locked: p.locked || false,
                actions: p.actions,
                outgoingConnections: p.actions
                    .filter(a => a['N.Par.'])
                    .map(a => a['N.Par.'])
            }));
            setNodes(initialNodes);
            updateLinks(initialNodes);
            isInitialized.current = true;
        }
    }, [paragraphs, updateLinks]);
    // Handle manual save
    const handleManualSave = (0, react_1.useCallback)(() => {
        // First update paragraphs to save positions
        if (onUpdateParagraphs) {
            saveNodePositions();
        }
        // Then save map settings
        saveMapSettings();
        // Then save nodes to ensure positions are included
        if (onSave) {
            onSave(nodes);
        }
        setLastBackup(new Date());
    }, [nodes, onSave, onUpdateParagraphs, saveNodePositions, saveMapSettings]);
    // Auto backup
    (0, react_1.useEffect)(() => {
        if (!isAutoBackupEnabled)
            return;
        const backupInterval = setInterval(() => {
            handleManualSave();
        }, 5 * 60 * 1000);
        return () => clearInterval(backupInterval);
    }, [isAutoBackupEnabled, handleManualSave]);
    const handleZoom = (0, react_1.useCallback)((delta, clientX, clientY) => {
        setZoom(prev => {
            const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta));
            if (newZoom === prev)
                return prev;
            const rect = svgRef.current?.getBoundingClientRect();
            if (!rect)
                return newZoom;
            // If clientX/Y are provided, zoom towards that point
            // Otherwise, zoom towards the center
            const pointX = clientX ?? (rect.left + rect.width / 2);
            const pointY = clientY ?? (rect.top + rect.height / 2);
            // Convert client coordinates to SVG coordinates
            const svgX = (pointX - rect.left) * viewBox.width / rect.width + viewBox.x;
            const svgY = (pointY - rect.top) * viewBox.height / rect.height + viewBox.y;
            const scale = newZoom / prev;
            const newWidth = viewBox.width / scale;
            const newHeight = viewBox.height / scale;
            // Calculate new viewBox position to maintain the zoom point
            const dx = svgX - viewBox.x;
            const dy = svgY - viewBox.y;
            const newX = svgX - dx / scale;
            const newY = svgY - dy / scale;
            // Apply bounds to prevent zooming outside the map
            const bounds = getBounds();
            const maxX = Math.max(0, bounds.maxX - newWidth);
            const maxY = Math.max(0, bounds.maxY - newHeight);
            setViewBox({
                x: Math.max(0, Math.min(maxX, newX)),
                y: Math.max(0, Math.min(maxY, newY)),
                width: newWidth,
                height: newHeight
            });
            return newZoom;
        });
    }, [viewBox, getBounds]);
    const handleNodeDragStart = (0, react_1.useCallback)((event, id) => {
        if (!isDragMode || nodes.find(n => n.id === id)?.locked)
            return;
        setIsDragging(true);
        setSelectedNode(id);
        setDragStart({
            x: event.clientX,
            y: event.clientY
        });
    }, [isDragMode, nodes]);
    const handleNodeDrag = (0, react_1.useCallback)((event) => {
        if (!isDragging || !selectedNode)
            return;
        const dx = event.clientX - dragStart.x;
        const dy = event.clientY - dragStart.y;
        setNodes(prev => {
            const updatedNodes = prev.map(node => {
                if (node.id !== selectedNode)
                    return node;
                // Calculate new position
                const newX = node.x + dx / zoom;
                const newY = node.y + dy / zoom;
                const bounds = getBounds();
                // Constrain position within bounds
                // Add padding of 30 (node radius) to keep nodes fully visible
                const constrainedX = Math.max(bounds.minX + 30, Math.min(bounds.maxX - 30, newX));
                const constrainedY = Math.max(bounds.minY + 30, Math.min(bounds.maxY - 30, newY));
                return {
                    ...node,
                    x: constrainedX,
                    y: constrainedY
                };
            });
            return updatedNodes;
        });
        setDragStart({
            x: event.clientX,
            y: event.clientY
        });
    }, [isDragging, selectedNode, dragStart, zoom, getBounds]);
    const handleNodeDragEnd = (0, react_1.useCallback)(() => {
        setIsDragging(false);
        if (selectedNode !== null) {
            saveNodePositions();
        }
    }, [selectedNode, saveNodePositions]);
    const handleMapPanStart = (0, react_1.useCallback)((event) => {
        // Check if we clicked on a node
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect)
            return false;
        // Convert client coordinates to SVG coordinates
        const svgX = (event.clientX - rect.left) * viewBox.width / rect.width + viewBox.x;
        const svgY = (event.clientY - rect.top) * viewBox.height / rect.height + viewBox.y;
        const clickedNode = nodes.some(node => {
            const dx = svgX - node.x;
            const dy = svgY - node.y;
            return Math.sqrt(dx * dx + dy * dy) < 30;
        });
        // Allow panning if we're not clicking a node (regardless of drag mode)
        if (!clickedNode) {
            setIsPanning(true);
            setPanStart({
                x: event.clientX,
                y: event.clientY
            });
            startTracking({ x: event.clientX, y: event.clientY });
        }
    }, [nodes, viewBox, startTracking]);
    const handleMapPan = (0, react_1.useCallback)((event) => {
        if (!isPanning)
            return;
        const dx = (event.clientX - panStart.x) / zoom;
        const dy = (event.clientY - panStart.y) / zoom;
        handleInertiaScroll(dx, dy);
        updateTracking({ x: event.clientX, y: event.clientY });
        setPanStart({
            x: event.clientX,
            y: event.clientY
        });
    }, [isPanning, panStart, zoom, handleInertiaScroll, updateTracking]);
    const handleMapPanEnd = (0, react_1.useCallback)(() => {
        setIsPanning(false);
        stopTracking();
    }, [stopTracking]);
    const toggleNodeLock = (0, react_1.useCallback)((id) => {
        setNodes(prev => prev.map(node => node.id === id
            ? { ...node, locked: !node.locked }
            : node));
        saveNodePositions();
    }, [saveNodePositions]);
    const handleImageAdjustment = (0, react_1.useCallback)((key, value) => {
        setImageAdjustments(prev => {
            const newAdjustments = { ...prev, [key]: value };
            if (key === 'width' && prev.maintainAspectRatio && originalImageDimensions.current) {
                const ratio = originalImageDimensions.current.height / originalImageDimensions.current.width;
                newAdjustments.height = value * ratio;
            }
            else if (key === 'height' && prev.maintainAspectRatio && originalImageDimensions.current) {
                const ratio = originalImageDimensions.current.width / originalImageDimensions.current.height;
                newAdjustments.width = value * ratio;
            }
            return newAdjustments;
        });
        saveMapSettings();
    }, [saveMapSettings]);
    const handleBackgroundUpload = (0, react_1.useCallback)((event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    originalImageDimensions.current = {
                        width: img.width,
                        height: img.height
                    };
                    setImageAdjustments(prev => ({
                        ...prev,
                        width: img.width,
                        height: img.height
                    }));
                    setBackgroundImage(e.target?.result);
                    saveMapSettings();
                };
                img.src = e.target?.result;
            };
            reader.readAsDataURL(file);
        }
    }, [saveMapSettings]);
    const handleActionSelect = (0, react_1.useCallback)((actionIndex) => {
        if (!selectedNode)
            return;
        const selectedNodeData = nodes.find(n => n.id === selectedNode);
        if (!selectedNodeData)
            return;
        setSelectedAction(selectedAction === actionIndex ? null : actionIndex);
        const action = selectedNodeData.actions[actionIndex];
        if (!action)
            return;
        setLinks(prev => prev.map(link => ({
            ...link,
            isHighlighted: selectedAction !== actionIndex &&
                link.source === selectedNode &&
                link.target === parseInt(action['N.Par.'] || '0')
        })));
    }, [selectedNode, nodes, selectedAction]);
    return {
        state: {
            zoom,
            showGrid,
            selectedNode,
            selectedAction,
            nodes,
            links,
            viewBox,
            backgroundImage,
            isDragMode,
            isDragging,
            dragStart,
            useCurvedLines,
            isPanning,
            panStart,
            lastBackup,
            isAutoBackupEnabled,
            imageAdjustments,
            svgRef,
            fileInputRef,
            originalImageDimensions
        },
        actions: {
            setZoom,
            setShowGrid,
            setSelectedNode,
            setSelectedAction,
            setNodes,
            setLinks,
            setViewBox,
            setBackgroundImage,
            setIsDragMode,
            setIsDragging,
            setDragStart,
            setUseCurvedLines,
            setIsPanning,
            setPanStart,
            setLastBackup,
            setIsAutoBackupEnabled,
            setImageAdjustments,
            handleZoom,
            handleNodeDragStart,
            handleNodeDrag,
            handleNodeDragEnd,
            handleMapPanStart,
            handleMapPan,
            handleMapPanEnd,
            toggleNodeLock,
            handleImageAdjustment,
            handleBackgroundUpload,
            handleActionSelect,
            handleManualSave
        }
    };
};
exports.useStoryMap = useStoryMap;

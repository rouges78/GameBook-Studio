import { useState, useRef, useEffect, useCallback } from 'react';
import { Node, Link, ExtendedParagraph, ImageAdjustments, MapSettings } from '../types';

export const useStoryMap = (
  paragraphs: ExtendedParagraph[],
  mapSettings?: MapSettings,
  onSave?: (nodes: Node[]) => void,
  onUpdateParagraphs?: (paragraphs: ExtendedParagraph[]) => void,
  onUpdateMapSettings?: (settings: MapSettings) => void
) => {
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<number | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1000, height: 800 });
  const [backgroundImage, setBackgroundImage] = useState<string | null>(mapSettings?.backgroundImage || null);
  const [isDragMode, setIsDragMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [useCurvedLines, setUseCurvedLines] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const [isAutoBackupEnabled, setIsAutoBackupEnabled] = useState(true);
  
  const [imageAdjustments, setImageAdjustments] = useState<ImageAdjustments>(
    mapSettings?.imageAdjustments || {
      contrast: 100,
      transparency: 100,
      blackAndWhite: 0,
      sharpness: 100,
      brightness: 100,
      width: 1000,
      height: 800,
      maintainAspectRatio: true
    }
  );

  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalImageDimensions = useRef<{ width: number; height: number } | null>(null);
  const isInitialized = useRef(false);

  // Save map settings
  const saveMapSettings = useCallback(() => {
    if (!onUpdateMapSettings) return;

    onUpdateMapSettings({
      backgroundImage,
      imageAdjustments
    });
  }, [backgroundImage, imageAdjustments, onUpdateMapSettings]);

  // Update links based on current nodes
  const updateLinks = useCallback((currentNodes: Node[]) => {
    const newLinks: Link[] = currentNodes.flatMap(node =>
      node.actions
        .filter(a => a['N.Par.'])
        .map(a => ({
          source: node.id,
          target: parseInt(a['N.Par.'] as string),
          isPaused: false,
          isHighlighted: false
        }))
    );
    setLinks(newLinks);
  }, []);

  // Save node positions and update paragraphs
  const saveNodePositions = useCallback(() => {
    if (!onUpdateParagraphs) return;

    const updatedParagraphs = paragraphs.map(p => {
      const node = nodes.find(n => n.id === p.id);
      if (!node) return p;

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
  useEffect(() => {
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
          .map(a => a['N.Par.'] as string)
      }));

      setNodes(initialNodes);
      updateLinks(initialNodes);
      isInitialized.current = true;
    }
  }, [paragraphs, updateLinks]);

  // Handle manual save
  const handleManualSave = useCallback(() => {
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
  useEffect(() => {
    if (!isAutoBackupEnabled) return;

    const backupInterval = setInterval(() => {
      handleManualSave();
    }, 5 * 60 * 1000);

    return () => clearInterval(backupInterval);
  }, [isAutoBackupEnabled, handleManualSave]);

  const getBounds = useCallback(() => {
    const bounds = {
      minX: 0,
      minY: 0,
      maxX: imageAdjustments.width || viewBox.width,
      maxY: imageAdjustments.height || viewBox.height
    };
    return bounds;
  }, [imageAdjustments.width, imageAdjustments.height, viewBox.width, viewBox.height]);

  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => {
      const newZoom = prev + delta;
      if (newZoom >= 0.5 && newZoom <= 2) {
        const centerX = viewBox.x + viewBox.width / 2;
        const centerY = viewBox.y + viewBox.height / 2;
        
        const scale = newZoom / prev;
        const newWidth = viewBox.width / scale;
        const newHeight = viewBox.height / scale;
        
        setViewBox({
          x: centerX - newWidth / 2,
          y: centerY - newHeight / 2,
          width: newWidth,
          height: newHeight
        });
        return newZoom;
      }
      return prev;
    });
  }, [viewBox]);

  const handleNodeDragStart = useCallback((event: React.MouseEvent, id: number) => {
    if (!isDragMode || nodes.find(n => n.id === id)?.locked) return;
    
    setIsDragging(true);
    setSelectedNode(id);
    setDragStart({
      x: event.clientX,
      y: event.clientY
    });
  }, [isDragMode, nodes]);

  const handleNodeDrag = useCallback((event: React.MouseEvent) => {
    if (!isDragging || !selectedNode) return;

    const dx = event.clientX - dragStart.x;
    const dy = event.clientY - dragStart.y;

    setNodes(prev => {
      const updatedNodes = prev.map(node => {
        if (node.id !== selectedNode) return node;

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

  const handleNodeDragEnd = useCallback(() => {
    setIsDragging(false);
    if (selectedNode !== null) {
      saveNodePositions();
    }
  }, [selectedNode, saveNodePositions]);

  const handleMapPanStart = useCallback((event: React.MouseEvent) => {
    // Check if we clicked on a node
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return false;

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
    }
  }, [nodes, viewBox]);

  const handleMapPan = useCallback((event: React.MouseEvent) => {
    if (!isPanning) return;

    const dx = (event.clientX - panStart.x) / zoom;
    const dy = (event.clientY - panStart.y) / zoom;

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

    setPanStart({
      x: event.clientX,
      y: event.clientY
    });
  }, [isPanning, panStart, zoom, getBounds]);

  const handleMapPanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  const toggleNodeLock = useCallback((id: number) => {
    setNodes(prev =>
      prev.map(node =>
        node.id === id
          ? { ...node, locked: !node.locked }
          : node
      )
    );
    saveNodePositions();
  }, [saveNodePositions]);

  const handleImageAdjustment = useCallback((key: keyof ImageAdjustments, value: number | boolean) => {
    setImageAdjustments(prev => {
      const newAdjustments = { ...prev, [key]: value };
      
      if (key === 'width' && prev.maintainAspectRatio && originalImageDimensions.current) {
        const ratio = originalImageDimensions.current.height / originalImageDimensions.current.width;
        newAdjustments.height = (value as number) * ratio;
      } else if (key === 'height' && prev.maintainAspectRatio && originalImageDimensions.current) {
        const ratio = originalImageDimensions.current.width / originalImageDimensions.current.height;
        newAdjustments.width = (value as number) * ratio;
      }
      
      return newAdjustments;
    });
    saveMapSettings();
  }, [saveMapSettings]);

  const handleBackgroundUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
          setBackgroundImage(e.target?.result as string);
          saveMapSettings();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, [saveMapSettings]);

  const handleActionSelect = useCallback((actionIndex: number) => {
    if (!selectedNode) return;
    
    const selectedNodeData = nodes.find(n => n.id === selectedNode);
    if (!selectedNodeData) return;

    setSelectedAction(selectedAction === actionIndex ? null : actionIndex);

    const action = selectedNodeData.actions[actionIndex];
    if (!action) return;

    setLinks(prev =>
      prev.map(link => ({
        ...link,
        isHighlighted: selectedAction !== actionIndex && 
                      link.source === selectedNode && 
                      link.target === parseInt(action['N.Par.'] || '0')
      }))
    );
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

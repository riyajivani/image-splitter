import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Group, Text } from 'react-konva';
import { useStore } from '../store/useStore';

export const CanvasEditor: React.FC = () => {
  const { image, imageDimensions, guides, zoom, pan, setZoom, setPan, updateGuidePosition, removeGuide } = useStore();
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    setZoom(newScale);
    setPan({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleDragGuide = (e: any, id: string, type: 'horizontal' | 'vertical') => {
    let newPos = type === 'vertical' ? e.target.x() : e.target.y();
    
    // Keep inside bounds
    if (type === 'vertical') {
      if (newPos < 0) newPos = 0;
      if (newPos > imageDimensions.width) newPos = imageDimensions.width;
      e.target.x(newPos);
      e.target.y(0);
    } else {
      if (newPos < 0) newPos = 0;
      if (newPos > imageDimensions.height) newPos = imageDimensions.height;
      e.target.y(newPos);
      e.target.x(0);
    }
    updateGuidePosition(id, newPos);
  };

  if (!image) return (
    <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400 h-full">
      <p>Please upload an image to start splitting</p>
    </div>
  );

  return (
    <div ref={containerRef} className="flex-1 h-full w-full bg-gray-900 overflow-hidden outline-none" tabIndex={0}>
      <Stage
        width={containerSize.width}
        height={containerSize.height}
        onWheel={handleWheel}
        scaleX={zoom}
        scaleY={zoom}
        x={pan.x}
        y={pan.y}
        draggable
        onDragEnd={(e) => {
          // Update pan when stage is dragged, but not when children (guides) are dragged
          if (e.target === stageRef.current) {
            setPan({ x: e.target.x(), y: e.target.y() });
          }
        }}
        ref={stageRef}
      >
        <Layer>
          <Group>
            <KonvaImage image={image} width={imageDimensions.width} height={imageDimensions.height} />
            {guides.map(guide => {
              const isVertical = guide.type === 'vertical';
              const strokeWidth = 2 / zoom;
              return (
                <Group key={guide.id} 
                  x={isVertical ? guide.position : 0} 
                  y={!isVertical ? guide.position : 0}
                  draggable
                  onDragMove={(e) => handleDragGuide(e, guide.id, guide.type)}
                  onDblClick={() => removeGuide(guide.id)}
                  onMouseEnter={(e) => {
                    const container = e.target.getStage().container();
                    container.style.cursor = isVertical ? 'col-resize' : 'row-resize';
                  }}
                  onMouseLeave={(e) => {
                    const container = e.target.getStage().container();
                    container.style.cursor = 'default';
                  }}
                >
                  <Line
                    points={isVertical ? [0, 0, 0, imageDimensions.height] : [0, 0, imageDimensions.width, 0]}
                    stroke="#00ffff"
                    strokeWidth={strokeWidth}
                    hitStrokeWidth={15 / zoom}
                  />
                  <Text
                    text={`${Math.round(guide.position)}px`}
                    x={isVertical ? 5 / zoom : 5 / zoom}
                    y={isVertical ? 5 / zoom : -20 / zoom}
                    fill="#00ffff"
                    fontSize={12 / zoom}
                    shadowColor="black"
                    shadowBlur={2}
                  />
                </Group>
              );
            })}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};

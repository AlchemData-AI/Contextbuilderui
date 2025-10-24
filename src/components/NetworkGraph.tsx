import { useEffect, useRef, useState } from 'react';
import { Database, Link2 } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'current' | 'connected' | 'suggested';
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'one-way' | 'bidirectional';
  status: 'active' | 'suggested';
  label?: string;
}

interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  height?: number;
  interactive?: boolean;
}

export function NetworkGraph({ nodes, edges, height = 400, interactive = true }: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Calculate positions (circular layout)
    const centerX = rect.width / 2;
    const centerY = height / 2;
    const radius = Math.min(rect.width, height) / 3;

    const newPositions = new Map<string, { x: number; y: number }>();

    // Place current agent in center
    const currentNode = nodes.find((n) => n.type === 'current');
    if (currentNode) {
      newPositions.set(currentNode.id, { x: centerX, y: centerY });
    }

    // Place other nodes in a circle around center
    const otherNodes = nodes.filter((n) => n.type !== 'current');
    const angleStep = (2 * Math.PI) / otherNodes.length;

    otherNodes.forEach((node, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      newPositions.set(node.id, { x, y });
    });

    setPositions(newPositions);

    // Draw edges
    edges.forEach((edge) => {
      const sourcePos = newPositions.get(edge.source);
      const targetPos = newPositions.get(edge.target);

      if (!sourcePos || !targetPos) return;

      ctx.beginPath();
      ctx.strokeStyle = edge.status === 'suggested' ? '#F79009' : '#00B5B3';
      ctx.lineWidth = edge.status === 'suggested' ? 1.5 : 2;
      ctx.setLineDash(edge.status === 'suggested' ? [5, 5] : []);

      if (edge.type === 'bidirectional') {
        // Draw curved line for bidirectional
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        const offsetX = (targetPos.y - sourcePos.y) * 0.1;
        const offsetY = -(targetPos.x - sourcePos.x) * 0.1;

        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.quadraticCurveTo(midX + offsetX, midY + offsetY, targetPos.x, targetPos.y);
      } else {
        // Straight line for one-way
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
      }

      ctx.stroke();

      // Draw arrow
      const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);
      const arrowSize = 8;
      const offsetFromNode = 40; // Distance from node center

      const arrowX = targetPos.x - Math.cos(angle) * offsetFromNode;
      const arrowY = targetPos.y - Math.sin(angle) * offsetFromNode;

      ctx.beginPath();
      ctx.fillStyle = edge.status === 'suggested' ? '#F79009' : '#00B5B3';
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
        arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
        arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    });

    // Draw nodes
    nodes.forEach((node) => {
      const pos = newPositions.get(node.id);
      if (!pos) return;

      const isHovered = hoveredNode === node.id;
      const nodeRadius = node.type === 'current' ? 35 : 30;

      // Shadow for hover effect
      if (isHovered) {
        ctx.shadowColor = 'rgba(0, 181, 179, 0.3)';
        ctx.shadowBlur = 15;
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle =
        node.type === 'current'
          ? '#00B5B3'
          : node.type === 'connected'
          ? '#E0F7F7'
          : '#FFF9F0';
      ctx.fill();

      ctx.strokeStyle =
        node.type === 'current'
          ? '#009996'
          : node.type === 'connected'
          ? '#00B5B3'
          : '#F79009';
      ctx.lineWidth = node.type === 'current' ? 3 : 2;
      ctx.setLineDash([]);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Icon (simplified database icon)
      ctx.fillStyle = node.type === 'current' ? '#FFFFFF' : '#00B5B3';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🗄️', pos.x, pos.y - 2);

      // Label
      ctx.fillStyle = '#333333';
      ctx.font = node.type === 'current' ? '600 11px sans-serif' : '500 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Wrap text
      const maxWidth = 100;
      const words = node.label.split(' ');
      let line = '';
      let y = pos.y + nodeRadius + 8;

      words.forEach((word, index) => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && index > 0) {
          ctx.fillText(line.trim(), pos.x, y);
          line = word + ' ';
          y += 14;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line.trim(), pos.x, y);
    });
  }, [nodes, edges, height, hoveredNode]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found = false;
    positions.forEach((pos, nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      const nodeRadius = node?.type === 'current' ? 35 : 30;
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);

      if (distance <= nodeRadius) {
        setHoveredNode(nodeId);
        found = true;
      }
    });

    if (!found) {
      setHoveredNode(null);
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg border border-[#EEEEEE] p-3 shadow-sm">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#00B5B3] border-2 border-[#009996]" />
            <span className="text-[#666666]">Current Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#E0F7F7] border-2 border-[#00B5B3]" />
            <span className="text-[#666666]">Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#FFF9F0] border-2 border-[#F79009]" />
            <span className="text-[#666666]">Suggested</span>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-[#EEEEEE]">
            <div className="w-6 h-0.5 bg-[#00B5B3]" />
            <span className="text-[#666666]">Active Link</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-[#F79009] border-dashed" style={{ backgroundImage: 'linear-gradient(to right, #F79009 50%, transparent 50%)', backgroundSize: '6px 2px' }} />
            <span className="text-[#666666]">Suggested Link</span>
          </div>
        </div>
      </div>
    </div>
  );
}

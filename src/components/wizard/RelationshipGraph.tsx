import { useEffect, useRef, useState } from 'react';
import { Database } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number;
}

interface Link {
  source: string;
  target: string;
}

const nodes: Node[] = [
  { id: 'customers', name: 'customers', x: 0, y: 0, vx: 0, vy: 0, connections: 3 },
  { id: 'orders', name: 'orders', x: 0, y: 0, vx: 0, vy: 0, connections: 5 },
  { id: 'order_items', name: 'order_items', x: 0, y: 0, vx: 0, vy: 0, connections: 3 },
  { id: 'products', name: 'products', x: 0, y: 0, vx: 0, vy: 0, connections: 4 },
  { id: 'inventory', name: 'inventory', x: 0, y: 0, vx: 0, vy: 0, connections: 2 },
  { id: 'shipments', name: 'shipments', x: 0, y: 0, vx: 0, vy: 0, connections: 1 },
  { id: 'returns', name: 'returns', x: 0, y: 0, vx: 0, vy: 0, connections: 2 },
  { id: 'categories', name: 'categories', x: 0, y: 0, vx: 0, vy: 0, connections: 1 },
  { id: 'suppliers', name: 'suppliers', x: 0, y: 0, vx: 0, vy: 0, connections: 1 },
];

const links: Link[] = [
  { source: 'orders', target: 'customers' },
  { source: 'order_items', target: 'orders' },
  { source: 'order_items', target: 'products' },
  { source: 'shipments', target: 'orders' },
  { source: 'returns', target: 'orders' },
  { source: 'inventory', target: 'products' },
  { source: 'products', target: 'categories' },
  { source: 'products', target: 'suppliers' },
  { source: 'returns', target: 'products' },
];

export function RelationshipGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Initialize positions in a circle
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.35;
      node.x = width / 2 + Math.cos(angle) * radius;
      node.y = height / 2 + Math.sin(angle) * radius;
    });

    // Simple force-directed layout simulation
    const simulate = () => {
      // Apply forces
      const linkForce = 0.05;
      const repelForce = 100;
      const damping = 0.9;

      // Link force (attraction)
      links.forEach((link) => {
        const source = nodes.find((n) => n.id === link.source);
        const target = nodes.find((n) => n.id === link.target);
        if (!source || !target) return;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = (distance - 150) * linkForce;

        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      });

      // Repel force (all nodes push each other)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 1) continue;

          const force = repelForce / (distance * distance);
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }

      // Update positions
      nodes.forEach((node) => {
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;

        // Keep nodes in bounds
        const margin = 80;
        if (node.x < margin) {
          node.x = margin;
          node.vx = 0;
        }
        if (node.x > width - margin) {
          node.x = width - margin;
          node.vx = 0;
        }
        if (node.y < margin) {
          node.y = margin;
          node.vy = 0;
        }
        if (node.y > height - margin) {
          node.y = height - margin;
          node.vy = 0;
        }
      });

      // Draw
      ctx.clearRect(0, 0, width, height);

      // Draw links
      ctx.strokeStyle = '#DDDDDD';
      ctx.lineWidth = 2;
      links.forEach((link) => {
        const source = nodes.find((n) => n.id === link.source);
        const target = nodes.find((n) => n.id === link.target);
        if (!source || !target) return;

        const isHighlighted =
          selectedNode === source.id ||
          selectedNode === target.id ||
          hoveredNode === source.id ||
          hoveredNode === target.id;

        ctx.strokeStyle = isHighlighted ? '#00B5B3' : '#DDDDDD';
        ctx.lineWidth = isHighlighted ? 3 : 2;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((node) => {
        const isSelected = selectedNode === node.id;
        const isHovered = hoveredNode === node.id;
        const isConnected =
          selectedNode &&
          links.some(
            (l) =>
              (l.source === selectedNode && l.target === node.id) ||
              (l.target === selectedNode && l.source === node.id)
          );

        const radius = 30;
        const color = isSelected || isHovered ? '#00B5B3' : isConnected ? '#4CAF50' : '#F8F9FA';
        const borderColor = isSelected || isHovered ? '#00B5B3' : '#DDDDDD';

        // Shadow for hover/select
        if (isSelected || isHovered) {
          ctx.shadowColor = 'rgba(0, 181, 179, 0.3)';
          ctx.shadowBlur = 10;
        }

        // Node circle
        ctx.fillStyle = color;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Icon (simplified database icon)
        ctx.fillStyle = isSelected || isHovered ? '#FFFFFF' : '#00B5B3';
        ctx.fillRect(node.x - 8, node.y - 6, 16, 3);
        ctx.fillRect(node.x - 8, node.y - 1, 16, 3);
        ctx.fillRect(node.x - 8, node.y + 4, 16, 3);

        // Label
        ctx.fillStyle = '#333333';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(node.name, node.x, node.y + radius + 8);

        // Connection count badge
        if (isSelected || isHovered) {
          const badgeX = node.x + radius - 8;
          const badgeY = node.y - radius + 8;
          ctx.fillStyle = '#F44336';
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 10, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.connections.toString(), badgeX, badgeY);
        }
      });

      animationFrameRef.current = requestAnimationFrame(simulate);
    };

    // Run simulation for a bit then slow down
    let frames = 0;
    const wrappedSimulate = () => {
      simulate();
      frames++;
      if (frames < 100) {
        animationFrameRef.current = requestAnimationFrame(wrappedSimulate);
      }
    };

    wrappedSimulate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [selectedNode, hoveredNode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find((node) => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < 30;
    });

    setSelectedNode(clickedNode ? clickedNode.id : null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hoveredNode = nodes.find((node) => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < 30;
    });

    setHoveredNode(hoveredNode ? hoveredNode.id : null);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-[16px] font-semibold text-[#333333] mb-2">
          Interactive Table Relationships
        </h3>
        <p className="text-[13px] text-[#666666]">
          Click on a table to highlight its connections. Hover to see connection count.
        </p>
      </div>
      <div className="flex-1 bg-white border border-[#EEEEEE] rounded-lg overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          className="max-w-full max-h-full"
        />
      </div>
      {selectedNode && (
        <div className="mt-4 bg-[#E0F7F7] border border-[#00B5B3] rounded-lg p-4">
          <div className="text-[13px] font-medium text-[#333333] mb-1">
            Selected Table: <span className="text-[#00B5B3]">{selectedNode}</span>
          </div>
          <div className="text-[12px] text-[#666666]">
            Connected to:{' '}
            {links
              .filter((l) => l.source === selectedNode || l.target === selectedNode)
              .map((l) => (l.source === selectedNode ? l.target : l.source))
              .join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}

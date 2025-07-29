import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';
import { TreeNode } from '../types/tree';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 120;

export const getLayoutedElements = (
  nodes: TreeNode[],
  direction = 'TB'
): { nodes: Node[]; edges: Edge[] } => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  // Add nodes to the graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to the graph
  const edges: Edge[] = [];
  nodes.forEach((node) => {
    node.children.forEach((childId) => {
      const edgeId = `e${node.id}-${childId}`;
      dagreGraph.setEdge(node.id, childId);
      edges.push({
        id: edgeId,
        source: node.id,
        target: childId,
        type: 'smoothstep',
        animated: false,
        style: {
          strokeWidth: 2,
          stroke: 'hsl(var(--muted-foreground))'
        }
      });
    });
  });

  dagre.layout(dagreGraph);

  // Create positioned nodes
  const positionedNodes: Node[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    return {
      id: node.id,
      type: node.type,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      data: { ...node } as Record<string, unknown>,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
    };
  });

  return { nodes: positionedNodes, edges };
};
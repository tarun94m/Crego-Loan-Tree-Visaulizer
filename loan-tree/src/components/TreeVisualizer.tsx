import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from '@xyflow/react';
import { useTreeStore } from '../store/treeStore';
import { getLayoutedElements } from '../utils/layoutUtils';
import { AccountNode } from './nodes/AccountNode';
import { LoanNode } from './nodes/LoanNode';
import { CollateralNode } from './nodes/CollateralNode';
import { SidePanel } from './SidePanel';
import { Toolbar } from './Toolbar';

const nodeTypes: NodeTypes = {
  account: AccountNode,
  loan: LoanNode,
  collateral: CollateralNode,
};

export const TreeVisualizer: React.FC = () => {
  const { nodes: treeNodes } = useTreeStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Update React Flow nodes when tree changes
  useEffect(() => {
    const nodeArray = Object.values(treeNodes);
    
    if (nodeArray.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodeArray);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [treeNodes, setNodes, setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    // Node selection is handled in the BaseNode component
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      <Toolbar />
      
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.1,
            includeHiddenNodes: false,
          }}
          attributionPosition="bottom-left"
          className="bg-background"
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          deleteKeyCode={null} // Disable delete key
        >
          <Background 
            color="hsl(var(--muted-foreground))" 
            gap={20} 
            size={1}
          />
          <Controls 
            className="bg-card border border-border shadow-md"
            showInteractive={false}
          />
          <MiniMap 
            className="bg-card border border-border shadow-md"
            maskColor="hsl(var(--muted) / 0.6)"
            nodeColor={(node) => {
              const nodeType = node.type;
              switch (nodeType) {
                case 'account': return 'hsl(var(--node-account))';
                case 'loan': return 'hsl(var(--node-loan))';
                case 'collateral': return 'hsl(var(--node-collateral))';
                default: return 'hsl(var(--muted-foreground))';
              }
            }}
          />
        </ReactFlow>

        <SidePanel />

        {Object.keys(treeNodes).length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-20">🌳</div>
              <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
                Start Building Your Loan Tree
              </h2>
              <p className="text-muted-foreground max-w-md">
                Add an Account or Loan root node to begin creating your hierarchical loan structure.
                Click the buttons in the toolbar above to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
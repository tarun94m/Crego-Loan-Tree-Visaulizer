import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { TreeNode, NodeType, NODE_TYPE_CONFIGS } from '../types/tree';

interface TreeStore {
  nodes: Record<string, TreeNode>;
  selectedNodeId: string | null;
  isPanelOpen: boolean;
  
  // Actions
  addNode: (type: NodeType, parentId?: string, label?: string) => string;
  deleteNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  setPanelOpen: (open: boolean) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  getRootNodes: () => TreeNode[];
  getNodeChildren: (nodeId: string) => TreeNode[];
  getAvailableChildTypes: (nodeId: string) => NodeType[];
  exportTree: () => any;
  clearTree: () => void;
}

export const useTreeStore = create<TreeStore>((set, get) => ({
  nodes: {},
  selectedNodeId: null,
  isPanelOpen: false,

  addNode: (type: NodeType, parentId?: string, label?: string) => {
    const newId = nanoid();
    const config = NODE_TYPE_CONFIGS[type];
    
    set((state) => {
      const newNode: TreeNode = {
        id: newId,
        type,
        parentId,
        children: [],
        label: label || `${config.label} ${Object.keys(state.nodes).length + 1}`,
        description: config.description
      };

      const updatedNodes = { ...state.nodes };
      updatedNodes[newId] = newNode;

      // Update parent's children array if this node has a parent
      if (parentId && updatedNodes[parentId]) {
        updatedNodes[parentId] = {
          ...updatedNodes[parentId],
          children: [...updatedNodes[parentId].children, newId]
        };
      }

      return {
        nodes: updatedNodes,
        selectedNodeId: newId,
        isPanelOpen: true
      };
    });

    return newId;
  },

  deleteNode: (nodeId: string) => {
    set((state) => {
      const node = state.nodes[nodeId];
      if (!node) return state;

      const updatedNodes = { ...state.nodes };
      
      // Recursively delete all descendants
      const deleteNodeAndChildren = (id: string) => {
        const nodeToDelete = updatedNodes[id];
        if (!nodeToDelete) return;
        
        // Delete all children first
        nodeToDelete.children.forEach(childId => {
          deleteNodeAndChildren(childId);
        });
        
        // Remove from parent's children array
        if (nodeToDelete.parentId && updatedNodes[nodeToDelete.parentId]) {
          updatedNodes[nodeToDelete.parentId] = {
            ...updatedNodes[nodeToDelete.parentId],
            children: updatedNodes[nodeToDelete.parentId].children.filter(id => id !== id)
          };
        }
        
        delete updatedNodes[id];
      };

      // Remove from parent's children array
      if (node.parentId && updatedNodes[node.parentId]) {
        updatedNodes[node.parentId] = {
          ...updatedNodes[node.parentId],
          children: updatedNodes[node.parentId].children.filter(id => id !== nodeId)
        };
      }

      deleteNodeAndChildren(nodeId);

      return {
        nodes: updatedNodes,
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        isPanelOpen: state.selectedNodeId === nodeId ? false : state.isPanelOpen
      };
    });
  },

  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId, isPanelOpen: !!nodeId });
  },

  setPanelOpen: (open: boolean) => {
    set({ isPanelOpen: open });
  },

  updateNodeLabel: (nodeId: string, label: string) => {
    set((state) => ({
      nodes: {
        ...state.nodes,
        [nodeId]: {
          ...state.nodes[nodeId],
          label
        }
      }
    }));
  },

  getRootNodes: () => {
    const { nodes } = get();
    return Object.values(nodes).filter(node => !node.parentId);
  },

  getNodeChildren: (nodeId: string) => {
    const { nodes } = get();
    const node = nodes[nodeId];
    if (!node) return [];
    return node.children.map(childId => nodes[childId]).filter(Boolean);
  },

  getAvailableChildTypes: (nodeId: string) => {
    const { nodes } = get();
    const node = nodes[nodeId];
    if (!node) return [];
    return NODE_TYPE_CONFIGS[node.type].allowedChildren;
  },

  exportTree: () => {
    const { nodes, getRootNodes } = get();
    
    const buildTreeStructure = (nodeId: string): any => {
      const node = nodes[nodeId];
      if (!node) return null;
      
      return {
        id: node.id,
        type: node.type,
        label: node.label,
        description: node.description,
        children: node.children.map(childId => buildTreeStructure(childId)).filter(Boolean)
      };
    };

    return {
      tree: getRootNodes().map(root => buildTreeStructure(root.id)),
      metadata: {
        totalNodes: Object.keys(nodes).length,
        exportDate: new Date().toISOString()
      }
    };
  },

  clearTree: () => {
    set({
      nodes: {},
      selectedNodeId: null,
      isPanelOpen: false
    });
  }
}));
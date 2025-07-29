import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { TreeNode, NODE_TYPE_CONFIGS } from '../../types/tree';
import { useTreeStore } from '../../store/treeStore';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface BaseNodeProps {
  data: TreeNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({ data }) => {
  const { selectNode, selectedNodeId } = useTreeStore();
  const config = NODE_TYPE_CONFIGS[data.type];
  const isSelected = selectedNodeId === data.id;

  const handleClick = () => {
    selectNode(data.id);
  };

  return (
    <div className="relative">
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background" 
      />
      
      <Card 
        className={`
          w-48 h-28 p-4 cursor-pointer transition-all duration-200 overflow-hidden
          ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
          hover:shadow-lg hover:-translate-y-0.5
          ${data.type === 'account' ? 'bg-node-account-light border-node-account' : ''}
          ${data.type === 'loan' ? 'bg-node-loan-light border-node-loan' : ''}
          ${data.type === 'collateral' ? 'bg-node-collateral-light border-node-collateral' : ''}
        `}
        onClick={handleClick}
      >
        <div className="flex items-start justify-between h-full">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{config.icon}</span>
              <Badge 
                variant="secondary" 
                className={`text-xs text-white ${
                  data.type === 'account' ? 'bg-node-account' : 
                  data.type === 'loan' ? 'bg-node-loan' : 
                  'bg-node-collateral'
                }`}
              >
                {config.label}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm text-foreground truncate">
              {data.label}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              ID: {data.id.slice(0, 8)}...
            </p>
          </div>
        </div>
      </Card>

      {data.children.length > 0 && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background" 
        />
      )}
    </div>
  );
};
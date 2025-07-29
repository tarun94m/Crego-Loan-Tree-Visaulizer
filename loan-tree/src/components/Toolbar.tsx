import React from 'react';
import { Plus, RotateCcw, FileText } from 'lucide-react';
import { useTreeStore } from '../store/treeStore';
import { NODE_TYPE_CONFIGS, NodeType } from '../types/tree';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';

export const Toolbar: React.FC = () => {
  const { addNode, clearTree, nodes } = useTreeStore();
  const { toast } = useToast();

  const rootNodeTypes: NodeType[] = ['account', 'loan'];
  const nodeCount = Object.keys(nodes).length;

  const handleAddRootNode = (type: NodeType) => {
    addNode(type);
    toast({
      title: 'Root Node Added',
      description: `New ${NODE_TYPE_CONFIGS[type].label} root node created successfully.`,
    });
  };

  const handleClearTree = () => {
    if (nodeCount > 0) {
      clearTree();
      toast({
        title: 'Tree Cleared',
        description: 'All nodes have been removed from the tree.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-4 m-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Loan Tree Visualizer</h1>
            <Badge variant="outline" className="ml-2">
              {nodeCount} nodes
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Add Root Node:</span>
            {rootNodeTypes.map((type) => {
              const config = NODE_TYPE_CONFIGS[type];
              return (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleAddRootNode(type)}
                >
                  <Plus className="h-3 w-3" />
                  <span>{config.icon}</span>
                  {config.label}
                </Button>
              );
            })}
          </div>

          {nodeCount > 0 && (
            <>
              <div className="h-6 w-px bg-border" />
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={handleClearTree}
              >
                <RotateCcw className="h-3 w-3" />
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
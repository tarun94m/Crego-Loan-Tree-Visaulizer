import React, { useState } from 'react';
import { X, Plus, Trash2, Edit3, Download, FileText } from 'lucide-react';
import { useTreeStore } from '../store/treeStore';
import { NODE_TYPE_CONFIGS, NodeType } from '../types/tree';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';

export const SidePanel: React.FC = () => {
  const { 
    selectedNodeId, 
    nodes, 
    isPanelOpen, 
    setPanelOpen, 
    selectNode, 
    addNode, 
    deleteNode, 
    updateNodeLabel,
    getAvailableChildTypes,
    exportTree
  } = useTreeStore();
  
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');

  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null;
  const config = selectedNode ? NODE_TYPE_CONFIGS[selectedNode.type] : null;
  const availableChildTypes = selectedNodeId ? getAvailableChildTypes(selectedNodeId) : [];

  const handleClose = () => {
    setPanelOpen(false);
    selectNode(null);
    setIsEditing(false);
  };

  const handleAddChild = (childType: NodeType) => {
    if (selectedNodeId) {
      const newNodeId = addNode(childType, selectedNodeId);
      toast({
        title: 'Node Added',
        description: `New ${NODE_TYPE_CONFIGS[childType].label} node created successfully.`,
      });
    }
  };

  const handleDelete = () => {
    if (selectedNodeId && selectedNode) {
      deleteNode(selectedNodeId);
      toast({
        title: 'Node Deleted',
        description: `${config?.label} "${selectedNode.label}" and all its children have been deleted.`,
        variant: 'destructive',
      });
    }
  };

  const handleEditStart = () => {
    if (selectedNode) {
      setEditLabel(selectedNode.label);
      setIsEditing(true);
    }
  };

  const handleEditSave = () => {
    if (selectedNodeId && editLabel.trim()) {
      updateNodeLabel(selectedNodeId, editLabel.trim());
      setIsEditing(false);
      toast({
        title: 'Label Updated',
        description: 'Node label has been successfully updated.',
      });
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditLabel('');
  };

  const handleExport = () => {
    const treeData = exportTree();
    const blob = new Blob([JSON.stringify(treeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-tree-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Complete',
      description: 'Tree structure has been exported as JSON file.',
    });
  };

  if (!isPanelOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-background border-l border-border shadow-2xl z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Node Details</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {selectedNode && config ? (
          <>
            {/* Node Information */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div className="flex-1">
                    <CardTitle className="text-base">{config.label}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.description}
                    </p>
                  </div>
                  <Badge className={`text-white ${
                    selectedNode.type === 'account' ? 'bg-node-account' : 
                    selectedNode.type === 'loan' ? 'bg-node-loan' : 
                    'bg-node-collateral'
                  }`}>
                    {config.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="node-id" className="text-xs font-medium text-muted-foreground">
                    Node ID
                  </Label>
                  <Input
                    id="node-id"
                    value={selectedNode.id}
                    readOnly
                    className="mt-1 font-mono text-sm bg-muted/50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="node-label" className="text-xs font-medium text-muted-foreground">
                    Label
                  </Label>
                  {isEditing ? (
                    <div className="mt-1 space-y-2">
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave();
                          if (e.key === 'Escape') handleEditCancel();
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleEditSave} className="h-8">
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleEditCancel} className="h-8">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <Input
                        value={selectedNode.label}
                        readOnly
                        className="bg-muted/50"
                      />
                      <Button size="sm" variant="outline" onClick={handleEditStart}>
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Children Count
                  </Label>
                  <p className="mt-1 text-sm">{selectedNode.children.length}</p>
                </div>

                {selectedNode.parentId && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Parent ID
                    </Label>
                    <p className="mt-1 text-sm font-mono">{selectedNode.parentId}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Child Nodes */}
            {availableChildTypes.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Child Node
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {availableChildTypes.map((childType) => {
                    const childConfig = NODE_TYPE_CONFIGS[childType];
                    return (
                      <Button
                        key={childType}
                        variant="outline"
                        className="w-full justify-start gap-3 h-auto p-4"
                        onClick={() => handleAddChild(childType)}
                      >
                        <span className="text-lg">{childConfig.icon}</span>
                        <div className="text-left">
                          <div className="font-medium">{childConfig.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {childConfig.description}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Node & Children
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a node to view details</p>
          </div>
        )}

        <Separator />

        {/* Global Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tree Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export Tree as JSON
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
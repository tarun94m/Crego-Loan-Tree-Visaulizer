import React from 'react';
import { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { TreeNode } from '../../types/tree';

export const CollateralNode: React.FC<NodeProps> = ({ data }) => {
  return <BaseNode data={data as unknown as TreeNode} />;
};
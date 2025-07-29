export type NodeType = 'account' | 'loan' | 'collateral';

export interface TreeNode {
  id: string;
  type: NodeType;
  parentId?: string;
  children: string[];
  label: string;
  description?: string;
}

export interface NodeTypeConfig {
  type: NodeType;
  label: string;
  description: string;
  allowedChildren: NodeType[];
  canBeRoot: boolean;
  icon: string;
  color: string;
  lightColor: string;
}

export const NODE_TYPE_CONFIGS: Record<NodeType, NodeTypeConfig> = {
  account: {
    type: 'account',
    label: 'Account',
    description: "Represents a customer's account",
    allowedChildren: ['loan', 'collateral'],
    canBeRoot: true,
    icon: '👤',
    color: 'node-account',
    lightColor: 'node-account-light'
  },
  loan: {
    type: 'loan',
    label: 'Loan',
    description: 'A loan issued to an account',
    allowedChildren: ['collateral'],
    canBeRoot: true,
    icon: '💳',
    color: 'node-loan',
    lightColor: 'node-loan-light'
  },
  collateral: {
    type: 'collateral',
    label: 'Collateral',
    description: 'Asset pledged against a loan',
    allowedChildren: [],
    canBeRoot: false,
    icon: '🏠',
    color: 'node-collateral',
    lightColor: 'node-collateral-light'
  }
};
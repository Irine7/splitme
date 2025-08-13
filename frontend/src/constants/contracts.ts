export const CONTRACTS = {
  EXPENSE_TOKEN: '0x9444126e1331845278197CEBEC6f2C6Ab1B9B469' as const, // Deployed on Morph Holesky Testnet
  SPLIT_ME: '0xDb8Fda1b6fb96530b3FbFD2bf1F8F0721Cea036C' as const, // Deployed on Morph Holesky Testnet
};

export const SPLIT_ME_ABI = [
  // Core functions
  {
    name: 'createGroup',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'amount', type: 'uint256' },
      { name: 'creatorName', type: 'string' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'updateGroupCategory',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'groupId', type: 'uint256' },
      { name: 'newCategory', type: 'string' }
    ],
    outputs: []
  },
  {
    name: 'updateGroupAmount',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'groupId', type: 'uint256' },
      { name: 'newAmount', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'addMember',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'groupId', type: 'uint256' },
      { name: 'member', type: 'address' },
      { name: 'memberName', type: 'string' }
    ],
    outputs: []
  },
  {
    name: 'createExpense',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'groupId', type: 'uint256' },
      { name: 'description', type: 'string' },
      { name: 'amount', type: 'uint256' },
      { name: 'participants', type: 'address[]' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'settleExpense',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'expenseId', type: 'uint256' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'settleAllDebts',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'groupId', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  
  // View functions
  {
    name: 'getGroup',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'groupId', type: 'uint256' }
    ],
    outputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'string' },
      { name: '', type: 'address' },
      { name: '', type: 'address[]' },
      { name: '', type: 'bool' },
      { name: '', type: 'uint256' },
      { name: '', type: 'string' },
      { name: '', type: 'uint256' }
    ]
  },
  {
    name: 'getExpense',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'expenseId', type: 'uint256' }
    ],
    outputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' },
      { name: '', type: 'string' },
      { name: '', type: 'uint256' },
      { name: '', type: 'address' },
      { name: '', type: 'address[]' },
      { name: '', type: 'bool' },
      { name: '', type: 'uint256' }
    ]
  },
  {
    name: 'getUserGroups',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' }
    ],
    outputs: [
      { name: '', type: 'uint256[]' }
    ]
  },
  {
    name: 'getUserBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'groupId', type: 'uint256' }
    ],
    outputs: [
      { name: '', type: 'int256' }
    ]
  },
  {
    name: 'getGroupBalances',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'groupId', type: 'uint256' }
    ],
    outputs: [
      { name: '', type: 'address[]' },
      { name: '', type: 'int256[]' }
    ]
  },
  
  // Events
  {
    name: 'GroupCreated',
    type: 'event',
    inputs: [
      { name: 'groupId', type: 'uint256', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'creator', type: 'address', indexed: false }
    ]
  },
  {
    name: 'GroupCategoryUpdated',
    type: 'event',
    inputs: [
      { name: 'groupId', type: 'uint256', indexed: true },
      { name: 'category', type: 'string', indexed: false }
    ]
  },
  {
    name: 'GroupAmountUpdated',
    type: 'event',
    inputs: [
      { name: 'groupId', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false }
    ]
  },
  {
    name: 'ExpenseCreated',
    type: 'event',
    inputs: [
      { name: 'expenseId', type: 'uint256', indexed: true },
      { name: 'groupId', type: 'uint256', indexed: true },
      { name: 'description', type: 'string', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'paidBy', type: 'address', indexed: false }
    ]
  },
  {
    name: 'ExpenseSettled',
    type: 'event',
    inputs: [
      { name: 'expenseId', type: 'uint256', indexed: true },
      { name: 'settler', type: 'address', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false }
    ]
  }
] as const;

export const EXPENSE_TOKEN_ABI = [
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  'function faucet() external',
] as const;
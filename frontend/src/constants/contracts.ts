export const CONTRACTS = {
  EXPENSE_TOKEN: '0x...' as const, // Will be populated after deployment
  SPLIT_ME: '0x...' as const, // Will be populated after deployment
};

export const SPLIT_ME_ABI = [
  // Core functions
  'function createGroup(string calldata name, string calldata category) external returns (uint256)',
  'function updateGroupCategory(uint256 groupId, string calldata newCategory) external',
  'function addMember(uint256 groupId, address member) external',
  'function createExpense(uint256 groupId, string calldata description, uint256 amount, address[] calldata participants) external returns (uint256)',
  'function settleExpense(uint256 expenseId, uint256 amount) external',
  'function settleAllDebts(uint256 groupId) external',
  'function withdraw() external',
  
  // View functions
  'function getGroup(uint256 groupId) external view returns (uint256, string, address, address[], bool, uint256, string)',
  'function getExpense(uint256 expenseId) external view returns (uint256, uint256, string, uint256, address, address[], bool, uint256)',
  'function getUserGroups(address user) external view returns (uint256[])',
  'function getUserBalance(address user, uint256 groupId) external view returns (int256)',
  'function getGroupBalances(uint256 groupId) external view returns (address[], int256[])',
  
  // Events
  'event GroupCreated(uint256 indexed groupId, string name, address creator)',
  'event GroupCategoryUpdated(uint256 indexed groupId, string category)',
  'event ExpenseCreated(uint256 indexed expenseId, uint256 indexed groupId, string description, uint256 amount, address paidBy)',
  'event ExpenseSettled(uint256 indexed expenseId, address settler, uint256 amount)',
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
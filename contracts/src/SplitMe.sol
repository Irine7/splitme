// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SplitMe is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public usdcToken;
    
    struct Group {
        uint256 id;
        string name;
        address creator;
        address[] members;
        bool isActive;
        uint256 createdAt;
        string category; // Категория группы (food, transport, entertainment, etc.)
        uint256 totalAmount; // Общая сумма сплита
        mapping(address => string) memberNames; // Имена участников
    }

    struct Expense {
        uint256 id;
        uint256 groupId;
        string description;
        uint256 amount;
        address paidBy;
        address[] participants;
        mapping(address => bool) settled;
        bool isActive;
        uint256 createdAt;
    }

    struct Settlement {
        uint256 id;
        uint256 groupId;
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        bytes32 expenseReference;
    }

    // State variables
    uint256 public groupCounter;
    uint256 public expenseCounter;
    uint256 public settlementCounter;

    // Mappings
    mapping(uint256 => Group) public groups;
    mapping(uint256 => Expense) public expenses;
    mapping(uint256 => Settlement) public settlements;
    mapping(address => uint256[]) public userGroups;
    mapping(address => mapping(uint256 => int256)) public userBalances; // groupId => balance
    mapping(address => uint256) public withdrawableBalances;
    mapping(uint256 => mapping(address => bool)) public groupMembership; // groupId => member => isMember

    // Events
    event GroupCreated(uint256 indexed groupId, string name, address creator);
    event MemberAdded(uint256 indexed groupId, address member);
    event ExpenseCreated(uint256 indexed expenseId, uint256 indexed groupId, string description, uint256 amount, address paidBy);
    event ExpenseSettled(uint256 indexed expenseId, address settler, uint256 amount);
    event SettlementProcessed(uint256 indexed settlementId, address from, address to, uint256 amount);
    event BalanceUpdated(uint256 indexed groupId, address user, int256 newBalance);
    event GroupCategoryUpdated(uint256 indexed groupId, string category);
    event GroupAmountUpdated(uint256 indexed groupId, uint256 amount);

    modifier onlyGroupMember(uint256 groupId) {
        require(_isGroupMember(groupId, msg.sender), "Not a group member");
        _;
    }

    modifier validGroup(uint256 groupId) {
        require(groupId > 0 && groupId <= groupCounter, "Invalid group ID");
        require(groups[groupId].isActive, "Group is not active");
        _;
    }

    constructor(address initialOwner, address _usdcToken) Ownable(initialOwner) {
        usdcToken = IERC20(_usdcToken);
    }

    function createGroup(string calldata name, string calldata category, uint256 amount, string calldata creatorName) external whenNotPaused returns (uint256) {
        require(bytes(name).length > 0, "Group name cannot be empty");
        
        groupCounter++;
        
        Group storage newGroup = groups[groupCounter];
        newGroup.id = groupCounter;
        newGroup.name = name;
        newGroup.creator = msg.sender;
        newGroup.members.push(msg.sender);
        newGroup.isActive = true;
        newGroup.createdAt = block.timestamp;
        newGroup.category = category; // Сохраняем категорию группы
        newGroup.totalAmount = amount; // Сохраняем общую сумму сплита
        newGroup.memberNames[msg.sender] = creatorName; // Сохраняем имя создателя
        
        userGroups[msg.sender].push(groupCounter);
        groupMembership[groupCounter][msg.sender] = true; // Добавляем запись о членстве в маппинг
        
        emit GroupCreated(groupCounter, name, msg.sender);
        return groupCounter;
    }

    function updateGroupCategory(uint256 groupId, string calldata newCategory) 
        external 
        validGroup(groupId) 
        whenNotPaused 
    {
        require(msg.sender == groups[groupId].creator, "Only group creator can update category");
        groups[groupId].category = newCategory;
        emit GroupCategoryUpdated(groupId, newCategory);
    }

    function updateGroupAmount(uint256 groupId, uint256 newAmount) 
        external 
        validGroup(groupId) 
        whenNotPaused 
    {
        require(msg.sender == groups[groupId].creator, "Only group creator can update amount");
        groups[groupId].totalAmount = newAmount;
        emit GroupAmountUpdated(groupId, newAmount);
    }

    function addMember(uint256 groupId, address member, string calldata memberName) 
        external 
        validGroup(groupId) 
        whenNotPaused 
    {
        require(msg.sender == groups[groupId].creator, "Only group creator can add members");
        require(member != address(0), "Invalid member address");
        require(!_isGroupMember(groupId, member), "Already a member");

        groups[groupId].members.push(member);
        userGroups[member].push(groupId);
        groupMembership[groupId][member] = true; // Добавляем запись о членстве в маппинг
        groups[groupId].memberNames[member] = memberName; // Сохраняем имя нового участника
        
        emit MemberAdded(groupId, member);
    }

    function createExpense(
        uint256 groupId,
        string calldata description,
        uint256 amount,
        address[] calldata participants
    ) external validGroup(groupId) onlyGroupMember(groupId) whenNotPaused returns (uint256) {
        require(bytes(description).length > 0, "Description cannot be empty");
        require(amount > 0, "Amount must be positive");
        require(participants.length > 0, "Must have participants");
        require(participants.length <= groups[groupId].members.length, "Too many participants");

        // Validate all participants are group members
        for (uint256 i = 0; i < participants.length; i++) {
            require(_isGroupMember(groupId, participants[i]), "Participant not in group");
        }

        expenseCounter++;
        
        Expense storage newExpense = expenses[expenseCounter];
        newExpense.id = expenseCounter;
        newExpense.groupId = groupId;
        newExpense.description = description;
        newExpense.amount = amount;
        newExpense.paidBy = msg.sender;
        newExpense.participants = participants;
        newExpense.isActive = true;
        newExpense.createdAt = block.timestamp;

        // Update balances
        uint256 splitAmount = amount / participants.length;
        uint256 remainder = amount % participants.length;

        // Payer gets credited for the full amount
        userBalances[msg.sender][groupId] += int256(amount);

        // Each participant owes their split
        for (uint256 i = 0; i < participants.length; i++) {
            uint256 participantShare = splitAmount;
            if (i < remainder) {
                participantShare += 1; // Distribute remainder
            }
            userBalances[participants[i]][groupId] -= int256(participantShare);
            emit BalanceUpdated(groupId, participants[i], userBalances[participants[i]][groupId]);
        }

        emit ExpenseCreated(expenseCounter, groupId, description, amount, msg.sender);
        emit BalanceUpdated(groupId, msg.sender, userBalances[msg.sender][groupId]);
        
        return expenseCounter;
    }

    function settleExpense(uint256 expenseId, uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(expenseId > 0 && expenseId <= expenseCounter, "Invalid expense ID");
        require(amount > 0, "Amount must be positive");
        
        Expense storage expense = expenses[expenseId];
        require(expense.isActive, "Expense not active");
        require(!expense.settled[msg.sender], "Already settled");
        
        uint256 groupId = expense.groupId;
        require(_isGroupMember(groupId, msg.sender), "Not a group member");

        // Calculate how much this user owes for this expense
        uint256 splitAmount = expense.amount / expense.participants.length;
        uint256 remainder = expense.amount % expense.participants.length;
        
        uint256 userShare = splitAmount;
        // Find if user gets remainder
        for (uint256 i = 0; i < expense.participants.length && i < remainder; i++) {
            if (expense.participants[i] == msg.sender) {
                userShare += 1;
                break;
            }
        }

        require(amount >= userShare, "Insufficient settlement amount");

        // Transfer tokens
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Mark as settled
        expense.settled[msg.sender] = true;
        
        // Update balances
        userBalances[msg.sender][groupId] += int256(amount);
        withdrawableBalances[expense.paidBy] += amount;

        // Record settlement
        settlementCounter++;
        settlements[settlementCounter] = Settlement({
            id: settlementCounter,
            groupId: groupId,
            from: msg.sender,
            to: expense.paidBy,
            amount: amount,
            timestamp: block.timestamp,
            expenseReference: keccak256(abi.encodePacked(expenseId))
        });

        emit ExpenseSettled(expenseId, msg.sender, amount);
        emit SettlementProcessed(settlementCounter, msg.sender, expense.paidBy, amount);
        emit BalanceUpdated(groupId, msg.sender, userBalances[msg.sender][groupId]);
    }

    function settleAllDebts(uint256 groupId) 
        external 
        validGroup(groupId) 
        onlyGroupMember(groupId) 
        nonReentrant 
        whenNotPaused 
    {
        int256 balance = userBalances[msg.sender][groupId];
        require(balance < 0, "No debts to settle");
        
        uint256 debtAmount = uint256(-balance);
        require(debtAmount > 0, "No outstanding debt");

        // Transfer tokens to contract
        usdcToken.safeTransferFrom(msg.sender, address(this), debtAmount);

        // Update user balance to zero
        userBalances[msg.sender][groupId] = 0;

        // Distribute to creditors proportionally
        _distributeToCreditors(groupId, debtAmount);

        emit BalanceUpdated(groupId, msg.sender, 0);
    }

    function withdraw() external nonReentrant {
        uint256 amount = withdrawableBalances[msg.sender];
        require(amount > 0, "No funds to withdraw");

        withdrawableBalances[msg.sender] = 0;
        usdcToken.safeTransfer(msg.sender, amount);
    }

    // View functions
    function getGroup(uint256 groupId) external view returns (
        uint256 id,
        string memory name,
        address creator,
        address[] memory members,
        bool isActive,
        uint256 createdAt,
        string memory category,
        uint256 totalAmount
    ) {
        Group storage group = groups[groupId];
        return (
            group.id,
            group.name,
            group.creator,
            group.members,
            group.isActive,
            group.createdAt,
            group.category,
            group.totalAmount
        );
    }
    
    function getMemberName(uint256 groupId, address member) external view returns (string memory) {
        require(_isGroupMember(groupId, member), "Not a group member");
        return groups[groupId].memberNames[member];
    }

    function getExpense(uint256 expenseId) external view returns (
        uint256 id,
        uint256 groupId,
        string memory description,
        uint256 amount,
        address paidBy,
        address[] memory participants,
        bool isActive,
        uint256 createdAt
    ) {
        Expense storage expense = expenses[expenseId];
        return (
            expense.id,
            expense.groupId,
            expense.description,
            expense.amount,
            expense.paidBy,
            expense.participants,
            expense.isActive,
            expense.createdAt
        );
    }

    function getUserGroups(address user) external view returns (uint256[] memory) {
        return userGroups[user];
    }

    function getUserBalance(address user, uint256 groupId) external view returns (int256) {
        return userBalances[user][groupId];
    }

    function getGroupBalances(uint256 groupId) external view returns (
        address[] memory members,
        int256[] memory balances
    ) {
        Group storage group = groups[groupId];
        members = new address[](group.members.length);
        balances = new int256[](group.members.length);
        
        for (uint256 i = 0; i < group.members.length; i++) {
            members[i] = group.members[i];
            balances[i] = userBalances[group.members[i]][groupId];
        }
    }

    // Internal functions
    function _isGroupMember(uint256 groupId, address user) internal view returns (bool) {
        // Используем маппинг для быстрой проверки членства вместо перебора массива
        return groupMembership[groupId][user];
    }

    function _distributeToCreditors(uint256 groupId, uint256 totalAmount) internal {
        Group storage group = groups[groupId];
        uint256 totalCredits = 0;
        
        // Calculate total credits
        for (uint256 i = 0; i < group.members.length; i++) {
            int256 balance = userBalances[group.members[i]][groupId];
            if (balance > 0) {
                totalCredits += uint256(balance);
            }
        }

        if (totalCredits == 0) return;

        // Distribute proportionally
        for (uint256 i = 0; i < group.members.length; i++) {
            address member = group.members[i];
            int256 balance = userBalances[member][groupId];
            if (balance > 0) {
                uint256 creditShare = (uint256(balance) * totalAmount) / totalCredits;
                withdrawableBalances[member] += creditShare;
            }
        }
    }

    // Admin functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function updateUSDCToken(address newToken) external onlyOwner {
        require(newToken != address(0), "Invalid token address");
        usdcToken = IERC20(newToken);
    }
}
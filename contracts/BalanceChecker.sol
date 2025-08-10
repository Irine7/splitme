// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title BalanceChecker
 * @dev Простой контракт для проверки баланса подключенного аккаунта
 */
contract BalanceChecker {
    // Адрес владельца контракта
    address public owner;
    
    // События
    event BalanceChecked(address account, uint256 balance);
    
    /**
     * @dev Конструктор устанавливает владельца контракта
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Проверяет баланс указанного аккаунта
     * @param account адрес аккаунта для проверки
     * @return balance баланс указанного аккаунта в wei
     */
    function checkBalance(address account) public returns (uint256 balance) {
        balance = account.balance;
        emit BalanceChecked(account, balance);
        return balance;
    }
    
    /**
     * @dev Проверяет баланс аккаунта отправителя транзакции
     * @return balance баланс отправителя в wei
     */
    function checkMyBalance() public returns (uint256) {
        return checkBalance(msg.sender);
    }
    
    /**
     * @dev Проверяет баланс контракта
     * @return balance баланс контракта в wei
     */
    function checkContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}

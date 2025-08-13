# SplitMe - Expense Sharing Application

SplitMe is a decentralized blockchain-based web application for conveniently sharing expenses between friends, colleagues, or family members. The application allows you to create groups (splits), add participants, and track who owes money to whom.

![SplitMe App](https://via.placeholder.com/800x400?text=SplitMe+App)

## Features

- **Decentralized Data Storage**: All group and expense data is stored on the blockchain
- **Expense Categories**: Convenient categorization of expenses (food, transport, entertainment, etc.)
- **Participant Management**: Adding and removing participants in groups
- **Expense History**: View history of all expenses
- **Debt Calculation**: Automatic calculation of who owes what and how much
- **Debt Settlement**: Marking debts as settled between participants
- **Dark Theme**: Support for light and dark interface themes

## Tech Stack

### Smart Contracts
- Solidity
- Hardhat
- Ethers.js

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Wagmi (for blockchain interaction)
- Zustand (for state management)

## Installation and Setup

### Prerequisites

- Node.js (version 20.x or higher)
- pnpm (version 10.x or higher)
- MetaMask or other Ethereum wallet

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/splitme.git
   cd splitme
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   Create a `.env` file in the project root with the following variables:
   ```
   MORPH_HOLESKY_URL=https://rpc-holesky.morphl2.io
   PRIVATE_KEY=your_private_key
   ```

### Launching Smart Contracts

1. Compile contracts:
   ```bash
   npx hardhat compile
   ```

2. Deploy contracts to the test network:
   ```bash
   npx hardhat run scripts/deploy.js --network morphHolesky
   ```

3. After deployment, update the contract addresses in the file `frontend/src/constants/contracts.ts`

### Launching the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   pnpm install
   ```

3. Launch the application in development mode:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Использование приложения

### Подключение кошелька

1. Нажмите кнопку "Подключить кошелёк" в верхнем правом углу
2. Выберите ваш кошелек (MetaMask, WalletConnect и т.д.)
3. Подтвердите подключение в вашем кошельке

### Создание нового сплита

1. На главной странице нажмите кнопку "Создать сплит"
2. Введите название сплита
3. Выберите категорию расхода
4. Добавьте участников, указав их Ethereum-адреса
5. Введите общую сумму расхода
6. Нажмите "Создать сплит" для создания группы

### Просмотр сплитов

1. Перейдите на вкладку "Мои сплиты" для просмотра ваших групп
2. Нажмите на любой сплит для просмотра подробной информации
3. В деталях сплита вы увидите всех участников и суммы их долгов

### История расходов

1. Перейдите на вкладку "История" для просмотра истории всех расходов
2. Нажмите на любой расход для просмотра подробной информации
3. Используйте фильтры для поиска конкретных расходов

## Структура проекта

```
splitme/
├── contracts/              # Смарт-контракты
│   ├── SplitMe.sol         # Основной контракт приложения
│   ├── ExpenseToken.sol    # Токен для расчетов
│   └── scripts/            # Скрипты для деплоя
├── frontend/               # Фронтенд приложения
│   ├── src/
│   │   ├── app/            # Страницы приложения (Next.js)
│   │   ├── components/     # React-компоненты
│   │   ├── constants/      # Константы (адреса контрактов и т.д.)
│   │   ├── hooks/          # Пользовательские хуки
│   │   ├── stores/         # Хранилища состояния (Zustand)
│   │   └── utils/          # Вспомогательные функции
│   └── public/             # Статические файлы
└── hardhat.config.js       # Конфигурация Hardhat
```

## Развернутые контракты

Текущие адреса контрактов в сети Morph Holesky Testnet:

- ExpenseToken: `0x9444126e1331845278197CEBEC6f2C6Ab1B9B469`
- SplitMe: `0xDb8Fda1b6fb96530b3FbFD2bf1F8F0721Cea036C`

## Разработка

### Добавление новых функций

1. Создайте новую ветку для вашей функции:
   ```bash
   git checkout -b feature/ваша-новая-функция
   ```

2. Внесите изменения в код

3. Протестируйте изменения:
   ```bash
   # Для смарт-контрактов
   npx hardhat test
   
   # Для фронтенда
   cd frontend && pnpm dev
   ```

4. Создайте pull request в основную ветку

### Тестирование

Для тестирования смарт-контрактов:
```bash
npx hardhat test
```

## Лицензия

MIT

## Авторы

- Ваше имя - [GitHub](https://github.com/yourusername)

## Благодарности

- [Morph Network](https://www.morphl2.io/) - за предоставление тестовой сети
- [shadcn/ui](https://ui.shadcn.com/) - за компоненты пользовательского интерфейса
- [Wagmi](https://wagmi.sh/) - за инструменты взаимодействия с блокчейном

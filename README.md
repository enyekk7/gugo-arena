# GUGO Arena

A React-based gaming application with Abstract Global Wallet integration.

## Features

- **Abstract Global Wallet Integration**: Secure login using Abstract Global Wallet
- **Game Interface**: Interactive gaming experience
- **Shop System**: Browse and purchase game items
- **Skin Customization**: Customize your character with different skins
- **Profile Management**: View player stats and manage account
- **Bottom Navigation**: Easy navigation between different sections

## Project Structure

```
src/
├── components/
│   ├── Login.js          # Login component with Abstract Wallet
│   ├── Game.js           # Main game interface
│   ├── Shop.js           # Shop for purchasing items
│   ├── Skin.js           # Character skin customization
│   ├── Profile.js        # Player profile and stats
│   ├── BottomNav.js      # Bottom navigation component
│   └── *.css             # Styling for each component
├── App.js                # Main application component
├── index.js              # Application entry point
└── *.css                 # Global styling
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gugo-arena
```

2. Install dependencies:
```bash
npm install
```

3. Setup Environment Variables:
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your MongoDB credentials
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

4. Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

## Usage

1. **Login**: Click "Login dengan Abstract Wallet" to connect your Abstract Global Wallet
2. **Navigation**: Use the bottom navigation to switch between different sections:
   - 🎮 **Play**: Access the main game interface
   - 🛒 **Shop**: Browse and purchase game items
   - 🎨 **Skin**: Customize your character appearance
   - 👤 **Profile**: View your stats and manage account

## Technologies Used

- **React**: Frontend framework
- **@abstract-foundation/agw-react**: Abstract Global Wallet integration
- **CSS3**: Styling and animations
- **Phaser**: Game development framework (available for future game implementation)

## Development

The application uses a component-based architecture with:

- **State Management**: React hooks for local state
- **Routing**: Custom navigation system with state-based routing
- **Wallet Integration**: Abstract Global Wallet for secure authentication
- **Responsive Design**: Mobile-first approach with bottom navigation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

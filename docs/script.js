import UpgradeSystem from './upgrades.js';
import { TokenActions } from './tokenActions.js';
import { FarmActions } from './farmActions.js';
import { PlotSystem } from './plots.js';

class CropFarmingGame {
    constructor() {
        console.log("Initializing CropFarmingGame");
        this.playerID = 'Not Connected';
        this.harvestBalance = 0;
        this.usdcBalance = 0;
        this.crops = [];
        this.cropIcons = {
            'Bitcoin': '🪙',
            'Ethereum': '💎',
            'Dogecoin': '🐶'
        };
        this.cropTypes = [
            { name: "Bitcoin", baseGrowthTime: 300, baseReward: 50, basePlantCost: 10 },
            { name: "Ethereum", baseGrowthTime: 180, baseReward: 30, basePlantCost: 5 },
            { name: "Dogecoin", baseGrowthTime: 60, baseReward: 10, basePlantCost: 1 },
        ];
        this.marketPrices = {};
        this.contractAddress = '0x5A5959A318FbD06e536A91f37874f0920232439D';
        this.harvestTokenAddress = '0x051565d89b0490d4d87378F3Fe5Ca95D5aD18067';
        this.usdcTokenAddress = '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8';
        this.marketUpdateInterval = 300000;
        this.marketCountdown = 300;
        this.lastMarketUpdate = Date.now();
        this.weatherIcons = {
            0: '☀️', 1: '🌧️', 2: '🏜️', 3: '❄️'
        };
        this.weatherEffects = {
            0: 'Growth speed +20%',
            1: 'Yield +20%',
            2: 'Growth speed -20%',
            3: 'Yield -20%'
        };
        this.currentWeather = 0;
        this.weatherCheckInterval = 30;
        this.cropUpdateInterval = null;

        // Initialize token balances
        this.tokenBalances = {
            harvest: 0,
            usdc: 0
        };

        console.log("Initializing systems...");
        
        // Initialize systems in the correct order
        try {
            this.upgradeSystem = new UpgradeSystem(this);
            console.log("UpgradeSystem initialized");
            
            this.tokenActions = new TokenActions(this);
            console.log("TokenActions initialized:", this.tokenActions);
            
            this.farmActions = new FarmActions(this);
            console.log("FarmActions initialized");
            
            this.plotSystem = new PlotSystem(this);
            console.log("PlotSystem initialized");
        } catch (error) {
            console.error("Error during system initialization:", error);
        }

        // Initialize game features
        this.initializeMarketPrices();
        this.initializeUI();
        this.startMarketFluctuations();
        console.log("CropFarmingGame initialization complete");
    }
    // Contract ABI
        this.contractABI = [
            {
                "inputs": [],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "farmer",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint8",
                        "name": "cropType",
                        "type": "uint8"
                    }
                ],
                "name": "CropPlanted",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "farmer",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "CropsHarvested",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "previousOwner",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "newOwner",
                        "type": "address"
                    }
                ],
                "name": "OwnershipTransferred",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "farmer",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "plotId",
                        "type": "uint256"
                    }
                ],
                "name": "PlotPurchased",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "getCurrentWeather",
                "outputs": [
                    {
                        "internalType": "enum CryptoFarming.Weather",
                        "name": "",
                        "type": "uint8"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_farmer",
                        "type": "address"
                    }
                ],
                "name": "getFarmStatus",
                "outputs": [
                    {
                        "components": [
                            {
                                "internalType": "uint8",
                                "name": "cropType",
                                "type": "uint8"
                            },
                            {
                                "internalType": "uint40",
                                "name": "plantTime",
                                "type": "uint40"
                            },
                            {
                                "internalType": "uint40",
                                "name": "maturityTime",
                                "type": "uint40"
                            },
                            {
                                "internalType": "uint168",
                                "name": "baseReward",
                                "type": "uint168"
                            }
                        ],
                        "internalType": "struct CryptoFarming.Crop[]",
                        "name": "",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "yieldBoostMultiplier",
                        "type": "uint256"
                    }
                ],
                "name": "harvestCrops",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint8",
                        "name": "_cropType",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "growthSpeedMultiplier",
                        "type": "uint256"
                    }
                ],
                "name": "plantCrop",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "purchasePlot",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];

        // ERC20 ABI
        this.erc20ABI = [
            {
                "constant": true,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {"name": "_spender", "type": "address"},
                    {"name": "_value", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {"name": "_to", "type": "address"},
                    {"name": "_value", "type": "uint256"}
                ],
                "name": "transfer",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            }
        ];
    async connectWallet() {
        console.log("Attempting to connect wallet");
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log("Accounts received:", accounts);
                
                this.web3 = new Web3(window.ethereum);
                this.accounts = accounts;

                const networkId = await this.web3.eth.net.getId();
                console.log("Network ID:", networkId);
                const sepoliaTestnetId = 11155111;
                if (networkId !== sepoliaTestnetId) {
                    alert('Please connect to the Sepolia testnet in MetaMask');
                    return;
                }

                try {
                    this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
                    console.log("Contract initialized:", this.contract);
                    
                    // Update UI first
                    this.playerID = this.accounts[0];
                    this.updateWalletUI();
                    
                    // Update game state
                    await this.updateWeather();
                    await this.plotSystem.initializePlots();
                    this.plotSystem.startCropUpdates();

                    // Check if tokenActions is properly initialized
                    console.log("Checking TokenActions:", this.tokenActions);
                    if (!this.tokenActions) {
                        console.log("TokenActions not found, reinitializing...");
                        this.tokenActions = new TokenActions(this);
                    }

                    // Initialize token balances with additional error checking
                    try {
                        console.log("Attempting to update token balances...");
                        if (this.tokenActions && typeof this.tokenActions.updateTokenBalances === 'function') {
                            await this.tokenActions.updateTokenBalances();
                            console.log("Token balances updated successfully");
                        } else {
                            console.error("updateTokenBalances is not available:", this.tokenActions);
                        }
                    } catch (tokenError) {
                        console.error("Error updating token balances:", tokenError);
                    }

                    // Set up intervals with error checking
                    this.setupIntervals();
                    
                    console.log("Wallet connected successfully");
                } catch (contractError) {
                    console.error("Error initializing contract:", contractError);
                    alert("Failed to initialize contract. Please check if you're connected to the correct network and the contract address is correct.");
                    return;
                }
            } catch (error) {
                console.error("Detailed wallet connection error:", error);
                alert(`Failed to connect wallet: ${error.message}. Please check the console for more details and try again.`);
            }
        } else {
            console.error("Ethereum wallet not found");
            alert("Please install MetaMask to use this dApp!");
        }
    }

    setupIntervals() {
        console.log("Setting up intervals...");
        try {
            this.farmStatusInterval = setInterval(() => this.updateFarmStatus(), 30000);
            this.weatherInterval = setInterval(() => this.updateWeather(), this.weatherCheckInterval * 1000);
            
            if (this.tokenActions && typeof this.tokenActions.updateTokenBalances === 'function') {
                this.tokenBalanceInterval = setInterval(() => {
                    try {
                        this.tokenActions.updateTokenBalances();
                    } catch (error) {
                        console.error("Error in token balance interval:", error);
                    }
                }, 30000);
            }
            console.log("Intervals set up successfully");
        } catch (error) {
            console.error("Error setting up intervals:", error);
        }
    }

    disconnectWallet() {
        console.log("Disconnecting wallet");
        this.web3 = null;
        this.contract = null;
        this.accounts = null;
        this.playerID = 'Not Connected';
        this.balance = 0;
        this.updateWalletUI();
        document.getElementById('disconnect-wallet-btn').style.display = 'none';
        
        // Clear all intervals
        if (this.farmStatusInterval) clearInterval(this.farmStatusInterval);
        if (this.weatherInterval) clearInterval(this.weatherInterval);
        if (this.tokenBalanceInterval) clearInterval(this.tokenBalanceInterval);
        if (this.cropUpdateInterval) clearInterval(this.cropUpdateInterval);
        
        // Reset plot system
        if (this.plotSystem) {
            this.plotSystem.resetPlots();
        }
        
        console.log("Wallet disconnected");
        alert('Wallet disconnected successfully.');
    }

    updateWalletUI() {
        console.log("Updating wallet UI");
        const playerIdSpan = document.getElementById('player-id');
        const playerBalanceSpan = document.getElementById('player-balance');
        const playerInfo = document.getElementById('player-info');
        
        if (!playerIdSpan || !playerBalanceSpan || !playerInfo) {
            console.error("Required UI elements not found");
            return;
        }

        if (this.accounts && this.accounts[0]) {
            playerIdSpan.innerHTML = `<i class="fas fa-user"></i> ${this.playerID.substring(0, 6)}...${this.playerID.substring(38)}`;
            playerBalanceSpan.innerHTML = `<i class="fas fa-coins"></i> ${this.balance} HARV`;
            playerInfo.classList.add('connected');
            document.getElementById('disconnect-wallet-btn').style.display = 'inline-block';
        } else {
            playerIdSpan.innerHTML = `<button id="connect-wallet-btn">Connect Wallet</button>`;
            playerBalanceSpan.innerHTML = `<i class="fas fa-coins"></i> 0 HARV`;
            playerInfo.classList.remove('connected');
            document.getElementById('disconnect-wallet-btn').style.display = 'none';
            const connectBtn = document.getElementById('connect-wallet-btn');
            if (connectBtn) {
                connectBtn.addEventListener('click', () => this.connectWallet());
            }
        }
    }

    async updateWeather() {
        console.log("Updating weather");
        if (this.contract && this.accounts) {
            try {
                const weather = await this.contract.methods.getCurrentWeather().call();
                console.log("Weather data received:", weather);
                this.currentWeather = parseInt(weather);
                this.updateWeatherUI();
                await this.updateCropTypes();
            } catch (error) {
                console.error("Error updating weather:", error);
            }
        }
    }

    updateWeatherUI() {
        console.log("Updating weather UI");
        const weatherContainer = document.getElementById('weather-container');
        if (weatherContainer) {
            weatherContainer.innerHTML = `
                <h3>Current Weather: ${this.weatherIcons[this.currentWeather]}</h3>
                <p>Effect: ${this.weatherEffects[this.currentWeather]}</p>
            `;
        } else {
            console.error("Weather container not found");
        }
    }

    async updateFarmStatus() {
        console.log("Updating farm status");
        if (this.contract && this.accounts) {
            try {
                const farmStatus = await this.contract.methods.getFarmStatus(this.accounts[0]).call();
                console.log("Raw farm status:", farmStatus);

                this.crops = farmStatus[0];
                this.balance = parseInt(farmStatus[1]);
                this.updateWalletUI();
                
                // Update plot system with new farm status
                if (this.plotSystem) {
                    await this.plotSystem.updatePlots(farmStatus);
                }

                if (this.upgradeSystem) {
                    this.upgradeSystem.updateUpgradeUI('growthSpeed');
                    this.upgradeSystem.updateUpgradeUI('yieldBoost');
                }

                console.log("Farm status updated successfully");
            } catch (error) {
                console.error("Failed to update farm status:", error);
            }
        } else {
            console.log("Wallet not connected, skipping farm status update");
        }
    }
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    formatTokenAmount(amount) {
        if (amount === "N/A") return amount;
        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat)) return "0.0000";
        if (amountFloat < 0.0001) return "<0.0001";
        return amountFloat.toFixed(4);
    }

    initializeMarketPrices() {
        console.log("Initializing market prices");
        this.cropTypes.forEach(crop => {
            this.marketPrices[crop.name] = {
                currentPrice: crop.baseReward,
                trend: Math.random() > 0.5 ? 'up' : 'down'
            };
        });
        console.log("Market prices initialized:", this.marketPrices);
    }

    startMarketFluctuations() {
        console.log("Starting market fluctuations");
        this.updateMarketPrices();
        this.updateMarketCountdown();

        setInterval(() => {
            const now = Date.now();
            const elapsedTime = now - this.lastMarketUpdate;

            if (elapsedTime >= this.marketUpdateInterval) {
                this.updateMarketPrices();
                this.marketCountdown = 300;
                this.lastMarketUpdate = now;
            } else {
                this.marketCountdown = Math.max(0, 300 - Math.floor(elapsedTime / 1000));
            }

            this.updateMarketCountdown();
        }, 1000);
    }

    updateMarketCountdown() {
        const countdownElement = document.getElementById('market-countdown');
        if (countdownElement) {
            countdownElement.textContent = `Next update in: ${this.marketCountdown}s`;
        } else {
            console.error("Market countdown element not found");
        }
    }

    async updateMarketPrices() {
        console.log("Updating market prices");
        if (this.contract && this.accounts) {
            for (const crop of this.cropTypes) {
                try {
                    const newPrice = await this.contract.methods.marketPrices(this.cropTypes.indexOf(crop)).call();
                    console.log(`Market price for ${crop.name}:`, newPrice);
                    this.marketPrices[crop.name].currentPrice = parseInt(newPrice);
                    this.marketPrices[crop.name].trend = newPrice > this.marketPrices[crop.name].currentPrice ? 'up' : 'down';
                } catch (error) {
                    console.log(`Using fallback price for ${crop.name}`);
                    this.updateFallbackPrice(crop);
                }
            }
        } else {
            this.cropTypes.forEach(crop => this.updateFallbackPrice(crop));
        }

        this.updateMarketUI();
        await this.updateCropTypes();
    }

    updateFallbackPrice(crop) {
        const changePercent = Math.random() * 0.2;
        const changeAmount = crop.baseReward * changePercent;
        const market = this.marketPrices[crop.name];

        if (market.trend === 'up') {
            market.currentPrice += changeAmount;
            if (Math.random() > 0.7) market.trend = 'down';
        } else {
            market.currentPrice -= changeAmount;
            if (Math.random() > 0.7) market.trend = 'up';
        }

        market.currentPrice = Math.max(crop.baseReward * 0.5, Math.min(crop.baseReward * 1.5, market.currentPrice));
        console.log(`Fallback market price for ${crop.name}:`, market.currentPrice);
    }

    updateMarketUI() {
        console.log("Updating market UI");
        const marketContainer = document.getElementById('market-prices-scroll');
        if (!marketContainer) {
            console.error("Market prices container not found");
            return;
        }
        marketContainer.innerHTML = '';
        Object.entries(this.marketPrices).forEach(([cropName, market]) => {
            const priceSpan = document.createElement('span');
            const trend = market.trend === 'up' ? '📈' : '📉';
            priceSpan.innerHTML = `${this.cropIcons[cropName]} ${cropName}: ${market.currentPrice.toFixed(2)} HARV ${trend}`;
            marketContainer.appendChild(priceSpan);
        });
    }

    async getEstimatedReward(cropType, baseReward) {
        console.log(`Calculating estimated reward for ${cropType} with base reward ${baseReward}`);
        const yieldBoostMultiplier = this.upgradeSystem ? this.upgradeSystem.getYieldBoostMultiplier() : 100;
        console.log(`Yield Boost Multiplier: ${yieldBoostMultiplier}`);
        
        let marketPrice = this.marketPrices[cropType].currentPrice;
        console.log(`Market Price for ${cropType}: ${marketPrice}`);

        let weather = this.currentWeather;
        console.log(`Current Weather: ${weather}`);
        
        let weatherMultiplier = 100;
        if (weather == 1) weatherMultiplier = 120; // Rainy
        if (weather == 3) weatherMultiplier = 80;  // CryptoWinter
        console.log(`Weather Multiplier: ${weatherMultiplier}`);

        const scalingFactor = 1e15;
        console.log(`Scaling Factor: ${scalingFactor}`);

        const priceAdjustedReward = (baseReward * marketPrice) / scalingFactor;
        console.log(`Price Adjusted Reward: ${priceAdjustedReward}`);

        const estimatedReward = (priceAdjustedReward * weatherMultiplier * yieldBoostMultiplier) / 10000;
        console.log(`Estimated Reward: ${estimatedReward}`);
        
        return estimatedReward.toString();
    }

    async updateCropTypes() {
        console.log("Updating crop types");
        const cropSelect = document.getElementById('crop-select');
        if (!cropSelect) {
            console.error("Crop select element not found");
            return;
        }
        cropSelect.innerHTML = '';
        for (const crop of this.cropTypes) {
            const option = document.createElement('option');
            option.value = crop.name;
            let estimatedReward;
            try {
                estimatedReward = await this.getEstimatedReward(crop.name, crop.baseReward);
                console.log(`Estimated reward for ${crop.name}: ${estimatedReward}`);
            } catch (error) {
                console.error(`Error calculating estimated reward for ${crop.name}:`, error);
                estimatedReward = "N/A";
            }
            option.textContent = `${crop.name} (Cost: ${crop.basePlantCost} HARV, Estimated: ${this.formatTokenAmount(estimatedReward)} HARV)`;
            cropSelect.appendChild(option);
        }
    }

    initializeUI() {
        console.log("Initializing UI");
        
        // Initialize wallet buttons
        const connectWalletBtn = document.getElementById('connect-wallet-btn');
        const disconnectWalletBtn = document.getElementById('disconnect-wallet-btn');

        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', () => this.connectWallet());
            console.log("Connect wallet button initialized");
        }
        
        if (disconnectWalletBtn) {
            disconnectWalletBtn.addEventListener('click', () => this.disconnectWallet());
            console.log("Disconnect wallet button initialized");
        }

        // Initialize token select
        const tokenSelect = document.getElementById('token-select');
        if (tokenSelect) {
            tokenSelect.addEventListener('change', () => {
                if (this.tokenActions) {
                    this.tokenActions.updateSelectedTokenBalance();
                    console.log("Token selection changed");
                }
            });
        }

        this.updateCropTypes();
        this.updateMarketUI();
        this.updateWeatherUI();

        console.log("UI initialization complete");
    }
}

// Initialize the game
console.log("Starting game initialization");
const game = new CropFarmingGame();

// Start market fluctuations
game.startMarketFluctuations();

// Add event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', () => {
            console.log('Connect wallet button clicked');
            if (typeof window.ethereum !== 'undefined') {
                console.log('MetaMask is installed!');
                game.connectWallet();
            } else {
                console.log('MetaMask is not installed');
                alert('Please install MetaMask to use this dApp!');
            }
        });
    } else {
        console.error('Connect wallet button not found in DOM');
    }

    // Initialize UI elements that depend on the DOM being loaded
    game.initializeUI();
});

// Export the game instance
export default game;

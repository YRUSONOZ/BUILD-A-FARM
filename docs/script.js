import UpgradeSystem from './upgrades.js';
import { TokenActions } from './tokenActions.js';
import { FarmActions } from './farmActions.js';

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
        this.contractABI = [
            // ... (keep the existing ABI)
        ];
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
        this.upgradeSystem = new UpgradeSystem(this);
        this.tokenBalances = {
            harvest: 0,
            usdc: 0
        };

        this.erc20ABI = [
            // ... (keep the existing ERC20 ABI)
        ];

        this.tokenActions = new TokenActions(this);
        this.farmActions = new FarmActions(this);

        this.initializeMarketPrices();
        this.initializeUI();
        this.startMarketFluctuations();
        console.log("CropFarmingGame initialized");
    }

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
                    
                    try {
                        const result = await this.contract.methods.getFarmStatus(this.accounts[0]).call();
                        console.log("getFarmStatus result:", result);
                    } catch (methodError) {
                        console.error("Error calling getFarmStatus:", methodError);
                        alert("Error interacting with the contract. Please check if you're connected to the correct network and the contract address is correct.");
                        return;
                    }
                } catch (contractError) {
                    console.error("Error initializing contract:", contractError);
                    alert("Failed to initialize contract. Please check if you're connected to the correct network and the contract address is correct.");
                    return;
                }

                this.playerID = this.accounts[0];
                this.updateWalletUI();
                await this.updateFarmStatus();
                this.updateWeather();
                await this.tokenActions.updateTokenBalances();
                this.tokenActions.updateSelectedTokenBalance();

                this.farmStatusInterval = setInterval(() => this.updateFarmStatus(), 30000);
                this.weatherInterval = setInterval(() => this.updateWeather(), this.weatherCheckInterval * 1000);
                this.tokenBalanceInterval = setInterval(() => this.tokenActions.updateTokenBalances(), 30000);
                
                console.log("Wallet connected successfully");
            } catch (error) {
                console.error("Detailed wallet connection error:", error);
                alert(`Failed to connect wallet: ${error.message}. Please check the console for more details and try again.`);
            }
        } else {
            console.error("Ethereum wallet not found");
            alert("Please install MetaMask to use this dApp!");
        }
    }

    disconnectWallet() {
        // ... (keep the existing disconnectWallet method)
    }

    updateWalletUI() {
        // ... (keep the existing updateWalletUI method)
    }

    async updateWeather() {
        // ... (keep the existing updateWeather method)
    }

    updateWeatherUI() {
        // ... (keep the existing updateWeatherUI method)
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
                if (this.upgradeSystem) {
                    this.upgradeSystem.updateUpgradeUI('growthSpeed');
                    this.upgradeSystem.updateUpgradeUI('yieldBoost');
                }

                await this.farmActions.updateCropList();

                if (this.cropUpdateInterval) {
                    clearInterval(this.cropUpdateInterval);
                }
                this.cropUpdateInterval = setInterval(() => this.farmActions.updateCropList(), 5000);

                console.log("Farm status updated");
            } catch (error) {
                console.error("Failed to update farm status:", error);
            }
        } else {
            console.log("Wallet not connected, skipping farm status update");
        }
    }

    formatTime(seconds) {
        // ... (keep the existing formatTime method)
    }

    initializeMarketPrices() {
        // ... (keep the existing initializeMarketPrices method)
    }

    startMarketFluctuations() {
        // ... (keep the existing startMarketFluctuations method)
    }

    updateMarketCountdown() {
        // ... (keep the existing updateMarketCountdown method)
    }

    async updateMarketPrices() {
        // ... (keep the existing updateMarketPrices method)
    }

    updateMarketUI() {
        // ... (keep the existing updateMarketUI method)
    }

    async getEstimatedReward(cropType, baseReward) {
        // ... (keep the existing getEstimatedReward method)
    }

    async updateCropTypes() {
        // ... (keep the existing updateCropTypes method)
    }

    addStakedTokenToList(cropList, tokenName, amount, tokenAddress, rewards) {
        // ... (keep the existing addStakedTokenToList method)
    }

    formatTokenAmount(amount) {
        // ... (keep the existing formatTokenAmount method)
    }

    async getStakingAPY(tokenAddress) {
        // ... (keep the existing getStakingAPY method)
    }

    initializeUI() {
        console.log("Initializing UI");
        const connectWalletBtn = document.getElementById('connect-wallet-btn');
        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', () => this.connectWallet());
        } else {
            console.error("Connect wallet button not found");
        }
        const disconnectWalletBtn = document.getElementById('disconnect-wallet-btn');
        if (disconnectWalletBtn) {
            disconnectWalletBtn.addEventListener('click', () => this.disconnectWallet());
        } else {
            console.error("Disconnect wallet button not found");
        }
        const plantBtn = document.getElementById('plant-btn');
        if (plantBtn) {
            plantBtn.addEventListener('click', () => this.farmActions.plantCrop());
        } else {
            console.error("Plant button not found");
        }
        const harvestBtn = document.getElementById('harvest-btn');
        if (harvestBtn) {
            harvestBtn.addEventListener('click', () => this.farmActions.harvestCrops());
        } else {
            console.error("Harvest button not found");
        }
        const stakeBtn = document.getElementById('stake-btn');
        const unstakeBtn = document.getElementById('unstake-btn');
        const tokenSelect = document.getElementById('token-select');
        if (stakeBtn && unstakeBtn && tokenSelect) {
            stakeBtn.addEventListener('click', () => {
                const tokenType = tokenSelect.value;
                const amount = document.getElementById('token-amount').value;
                this.tokenActions.stakeTokens(tokenType, amount);
            });
            unstakeBtn.addEventListener('click', () => {
                const tokenType = tokenSelect.value;
                const amount = document.getElementById('token-amount').value;
                const tokenAddress = tokenType === 'usdc' ? this.usdcTokenAddress : this.harvestTokenAddress;
                this.tokenActions.unstakeTokens(tokenAddress, this.web3.utils.toWei(amount, tokenType === 'usdc' ? 'mwei' : 'ether'));
            });
            tokenSelect.addEventListener('change', () => this.tokenActions.updateSelectedTokenBalance());
        } else {
            console.error("Stake/Unstake buttons or token select not found");
        }
        this.updateCropTypes();
        this.updateMarketUI();
        this.updateWeatherUI();

        console.log("UI initialized");
    }
}

// Initialize the game
console.log("Starting game initialization");
const game = new CropFarmingGame();
console.log("Game initialized");

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
        console.error('Connect wallet button not found');
    }

    // Initialize UI elements that depend on the DOM being loaded
    game.initializeUI();
});

// Export the game instance if needed
export default game;

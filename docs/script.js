import UpgradeSystem from './upgrades.js';

class CropFarmingGame {
    constructor() {
        console.log("Initializing CropFarmingGame");
        this.playerID = 'Not Connected';
        this.harvestBalance = 0;
        this.crops = [];
        this.stakedAmount = 0;
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
        this.contractAddress = '0x0c952604D3fcEEC8D9108987C5be4b15E6E6Ab3c';
        this.contractABI = [
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    }
                ],
                "name": "claimReward",
                "outputs": [],
                "stateMutability": "nonpayable",
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
                        "internalType": "address",
                        "name": "_harvestToken",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "_bitcoinToken",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "_ethereumToken",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "_usdcToken",
                        "type": "address"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    }
                ],
                "name": "OwnableInvalidOwner",
                "type": "error"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "OwnableUnauthorizedAccount",
                "type": "error"
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
                        "indexed": false,
                        "internalType": "uint8",
                        "name": "cropType",
                        "type": "uint8"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "newPrice",
                        "type": "uint256"
                    }
                ],
                "name": "MarketPriceUpdated",
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
                "name": "renounceOwnership",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "user",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "RewardClaimed",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "stake",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "user",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "Staked",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "newOwner",
                        "type": "address"
                    }
                ],
                "name": "transferOwnership",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "unstake",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "user",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "Unstaked",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint8",
                        "name": "cropType",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "newPrice",
                        "type": "uint256"
                    }
                ],
                "name": "updateMarketPrice",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "updateWeather",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "enum CryptoFarming.Weather",
                        "name": "newWeather",
                        "type": "uint8"
                    }
                ],
                "name": "WeatherChanged",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "BASE_MATURITY_DURATION",
                "outputs": [
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
                "inputs": [],
                "name": "bitcoinToken",
                "outputs": [
                    {
                        "internalType": "contract IERC20",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "user",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    }
                ],
                "name": "calculateReward",
                "outputs": [
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
                        "internalType": "uint8",
                        "name": "",
                        "type": "uint8"
                    }
                ],
                "name": "cropBaseRewards",
                "outputs": [
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
                "inputs": [],
                "name": "currentWeather",
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
                "inputs": [],
                "name": "ethereumToken",
                "outputs": [
                    {
                        "internalType": "contract IERC20",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "farms",
                "outputs": [
                    {
                        "internalType": "uint40",
                        "name": "lastHarvestTime",
                        "type": "uint40"
                    },
                    {
                        "internalType": "uint216",
                        "name": "harvestTokenBalance",
                        "type": "uint216"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
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
                        "internalType": "uint8",
                        "name": "_cropType",
                        "type": "uint8"
                    }
                ],
                "name": "getPlantingCost",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "pure",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "harvestToken",
                "outputs": [
                    {
                        "internalType": "contract IERC20",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "lastWeatherChange",
                "outputs": [
                    {
                        "internalType": "uint40",
                        "name": "",
                        "type": "uint40"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint8",
                        "name": "",
                        "type": "uint8"
                    }
                ],
                "name": "marketPrices",
                "outputs": [
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
                "inputs": [],
                "name": "owner",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "REWARD_RATE",
                "outputs": [
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
                "inputs": [],
                "name": "SCALING_FACTOR",
                "outputs": [
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
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "stakes",
                "outputs": [
                    {
                        "internalType": "uint248",
                        "name": "amount",
                        "type": "uint248"
                    },
                    {
                        "internalType": "uint40",
                        "name": "lastRewardTime",
                        "type": "uint40"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "STAKING_FEE",
                "outputs": [
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
                "inputs": [],
                "name": "TREASURY",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "usdcToken",
                "outputs": [
                    {
                        "internalType": "contract IERC20",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "WEATHER_DURATION",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        this.harvestTokenAddress = '0x051565d89b0490d4d87378F3Fe5Ca95D5aD18067';
        this.marketUpdateInterval = 300000; // 5 minutes in milliseconds
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
                "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
                "name": "approve",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            }
        ];

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
                    console.log("Contract methods:", Object.keys(this.contract.methods));
                    // Test calling a method
                    try {
                        const result = await this.contract.methods.getFarmStatus(this.accounts[0]).call();
                        console.log("getFarmStatus result:", result);
                    } catch (methodError) {
                        console.error("Error calling getFarmStatus:", methodError);
                    }
                } catch (contractError) {
                    console.error("Error initializing contract:", contractError);
                    alert("Failed to initialize contract. Please check the console for more details.");
                    return;
                }

                this.playerID = this.accounts[0];
                this.updateWalletUI();
                await this.updateFarmStatus();
                this.updateWeather();
                await this.updateHarvestTokenBalance();

                this.farmStatusInterval = setInterval(() => this.updateFarmStatus(), 30000);
                this.weatherInterval = setInterval(() => this.updateWeather(), this.weatherCheckInterval * 1000);
                console.log("Wallet connected successfully");
            } catch (error) {
                console.error("Detailed wallet connection error:", error);
                alert("Failed to connect wallet. Please check the console for more details and try again.");
            }
        } else {
            console.error("Ethereum wallet not found");
            alert("Please install MetaMask to use this dApp!");
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
        clearInterval(this.farmStatusInterval);
        clearInterval(this.weatherInterval);
        if (this.cropUpdateInterval) {
            clearInterval(this.cropUpdateInterval);
        }
        console.log("Wallet disconnected");
        alert('Wallet disconnected successfully.');
    }

    updateWalletUI() {
        console.log("Updating wallet UI");
        const playerIdSpan = document.getElementById('player-id');
        const playerBalanceSpan = document.getElementById('player-balance');
        const playerInfo = document.getElementById('player-info');
        if (this.accounts && this.accounts[0]) {
            playerIdSpan.innerHTML = `<i class="fas fa-user"></i> ${this.playerID.substring(0, 6)}...${this.playerID.substring(38)}`;
            playerBalanceSpan.innerHTML = `<i class="fas fa-coins"></i> ${this.balance} tokens`;
            playerInfo.classList.add('connected');
            document.getElementById('disconnect-wallet-btn').style.display = 'inline-block';
        } else {
            playerIdSpan.innerHTML = `<button id="connect-wallet-btn">Connect Wallet</button>`;
            playerBalanceSpan.innerHTML = `<i class="fas fa-coins"></i> 0 tokens`;
            playerInfo.classList.remove('connected');
            document.getElementById('disconnect-wallet-btn').style.display = 'none';
            document.getElementById('connect-wallet-btn').addEventListener('click', () => this.connectWallet());
        }
    }

    async updateHarvestTokenBalance() {
        if (!this.web3 || !this.accounts) {
            console.log("Web3 or accounts not available");
            return;
        }

        try {
            const harvestTokenContract = new this.web3.eth.Contract(this.erc20ABI, this.harvestTokenAddress);
            const balance = await harvestTokenContract.methods.balanceOf(this.accounts[0]).call();
            const balanceInEther = this.web3.utils.fromWei(balance, 'ether');
            console.log("Harvest Token Balance:", balanceInEther);

            // Update the UI
            const harvestTokenBalanceElement = document.getElementById('harvest-token-balance');
            if (harvestTokenBalanceElement) {
                harvestTokenBalanceElement.textContent = balanceInEther;
            } else {
                console.error("Harvest token balance element not found");
            }
        } catch (error) {
            console.error("Error fetching Harvest token balance:", error);
        }
    }

    async getStakedAmount() {
        if (!this.contract || !this.accounts) {
            console.log("Web3 or accounts not available");
            return 0;
        }

        try {
            const stakedAmount = await this.contract.methods.stakes(this.accounts[0], this.harvestTokenAddress).call();
            return this.web3.utils.fromWei(stakedAmount.amount, 'ether');
        } catch (error) {
            console.error("Error fetching staked amount:", error);
            return 0;
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
        } else {
            console.log("Contract or accounts not available, using fallback weather");
            this.currentWeather = Math.floor(Math.random() * 4);
            this.updateWeatherUI();
            await this.updateCropTypes();
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

    async plantCrop() {
        console.log("Attempting to plant crop");
        if (!this.contract || !this.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        const cropType = document.getElementById('crop-select').value;
        try {
            const growthSpeedMultiplier = this.upgradeSystem.getGrowthSpeedMultiplier();
            console.log("Growth Speed Multiplier:", growthSpeedMultiplier);
            
            const result = await this.contract.methods.plantCrop(cropType, growthSpeedMultiplier).send({ from: this.accounts[0] });
            
            if (result.status) {
                console.log(`${cropType} planted successfully!`);
                alert(`${cropType} planted successfully! Transaction hash: ${result.transactionHash}`);
                await this.updateFarmStatus();
            } else {
                console.error("Failed to plant crop");
                alert("Failed to plant crop. Please try again.");
            }
        } catch (error) {
            console.error("Error planting crop:", error);
            alert(`Failed to plant crop: ${error.message}`);
        }
    }

    async harvestCrops() {
        console.log("Attempting to harvest all crops");
        if (!this.contract || !this.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const yieldBoostMultiplier = this.upgradeSystem.getYieldBoostMultiplier();
            const result = await this.contract.methods.harvestCrops(yieldBoostMultiplier).send({ from: this.accounts[0] });
            
            if (result.status) {
                console.log("All crops harvested successfully!");
                alert("All crops harvested successfully!");
                await this.updateFarmStatus();
            } else {
                console.error("Failed to harvest crops");
                alert("Failed to harvest crops. Please try again.");
            }
        } catch (error) {
            console.error("Error harvesting crops:", error);
            alert(`Failed to harvest crops: ${error.message}`);
        }
    }

    async harvestSingleCrop(index) {
        console.log(`Attempting to harvest crop at index ${index}`);
        if (!this.contract || !this.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const yieldBoostMultiplier = this.upgradeSystem.getYieldBoostMultiplier();
            const result = await this.contract.methods.harvestSingleCrop(index, yieldBoostMultiplier).send({ from: this.accounts[0] });
            
            if (result.status) {
                console.log("Crop harvested successfully!");
                alert("Crop harvested successfully!");
                await this.updateFarmStatus();
            } else {
                console.error("Failed to harvest crop");
                alert("Failed to harvest crop. Please try again.");
            }
        } catch (error) {
            console.error("Error harvesting crop:", error);
            alert(`Failed to harvest crop: ${error.message}`);
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
                this.stakedAmount = await this.getStakedAmount();
                this.updateWalletUI();
                if (this.upgradeSystem) {
                    this.upgradeSystem.updateUpgradeUI('growthSpeed');
                    this.upgradeSystem.updateUpgradeUI('yieldBoost');
                }

                await this.updateCropList();

                if (this.cropUpdateInterval) {
                    clearInterval(this.cropUpdateInterval);
                }
                this.cropUpdateInterval = setInterval(() => this.updateCropList(), 5000);

                console.log("Farm status updated");
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
                    const newPrice = await this.contract.methods.getMarketPrice(crop.name).call();
                    console.log(`Market price for ${crop.name}:`, newPrice);
                    this.marketPrices[crop.name].currentPrice = parseInt(newPrice);
                    this.marketPrices[crop.name].trend = newPrice > this.marketPrices[crop.name].currentPrice ? 'up' : 'down';
                } catch (error) {
                    console.error(`Failed to update market price for ${crop.name}:`, error);
                }
            }
        } else {
            console.log("Contract or accounts not available, using fallback market prices");
            this.cropTypes.forEach(crop => {
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
            });
        }

        this.updateMarketUI();
        await this.updateCropTypes();
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
            priceSpan.innerHTML = `${this.cropIcons[cropName]} ${cropName}: ${market.currentPrice.toFixed(2)} tokens ${trend}`;
            marketContainer.appendChild(priceSpan);
        });
    }

    async getEstimatedReward(cropType, baseReward) {
        console.log(`Calculating estimated reward for ${cropType} with base reward ${baseReward}`);
        const yieldBoostMultiplier = this.upgradeSystem.getYieldBoostMultiplier();
        console.log(`Yield Boost Multiplier: ${yieldBoostMultiplier}`);
        
        let marketPrice;
        try {
            marketPrice = await this.contract.methods.getMarketPrice(cropType).call();
            console.log(`Market Price for ${cropType}: ${marketPrice}`);
        } catch (error) {
            console.error(`Error getting market price for ${cropType}:`, error);
            marketPrice = this.marketPrices[cropType].currentPrice;
            console.log(`Using fallback market price: ${marketPrice}`);
        }

        let weather;
        try {
            weather = await this.contract.methods.getCurrentWeather().call();
            console.log(`Current Weather: ${weather}`);
        } catch (error) {
            console.error("Error getting current weather:", error);
            weather = this.currentWeather;
            console.log(`Using fallback weather: ${weather}`);
        }
        
        let weatherMultiplier = 100;
        if (weather == 1) weatherMultiplier = 120; // Rainy
        if (weather == 3) weatherMultiplier = 80; // CryptoWinter
        console.log(`Weather Multiplier: ${weatherMultiplier}`);

        let scalingFactor;
        try {
            scalingFactor = await this.contract.methods.SCALING_FACTOR().call();
            console.log(`Scaling Factor: ${scalingFactor}`);
        } catch (error) {
            console.error("Error getting SCALING_FACTOR:", error);
            scalingFactor = '1000000000000000'; // Fallback value, adjust if needed
            console.log(`Using fallback Scaling Factor: ${scalingFactor}`);
        }

        // Use regular JavaScript numbers for calculations
        const priceAdjustedReward = (baseReward * Number(marketPrice)) / Number(scalingFactor);
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
            option.textContent = `${crop.name} (Cost: ${crop.basePlantCost} tokens, Estimated Value: ${this.formatTokenAmount(estimatedReward)} tokens)`;
            cropSelect.appendChild(option);
        }
        console.log("Crop select options updated:", cropSelect.innerHTML);
    }

    async updateCropList() {
        console.log("Updating crop list");
        const cropList = document.getElementById('crop-list');
        if (!cropList) {
            console.error("Crop list element not found");
            return;
        }
        cropList.innerHTML = '';

        // Add staked tokens to the list
        if (this.stakedAmount > 0) {
            const li = document.createElement('li');
            li.innerHTML = `
                <span><span class="crop-icon">🏦</span>Staked Harvest Tokens</span>
                <span>${this.stakedAmount} tokens</span>
                <button class="unstake-btn">Unstake</button>
            `;
            li.querySelector('.unstake-btn').addEventListener('click', () => this.unstakeHarvestTokens(this.stakedAmount));
            cropList.appendChild(li);
        }

        if (this.crops.length === 0 && this.stakedAmount === 0) {
            cropList.innerHTML = '<li>No crops planted or tokens staked yet.</li>';
        } else {
            for (let index = 0; index < this.crops.length; index++) {
                const crop = this.crops[index];
                const li = document.createElement('li');
                const currentTime = Math.floor(Date.now() / 1000);
                const timeToMaturity = Math.max(0, parseInt(crop.maturityTime) - currentTime);

                let estimatedReward;
                try {
                    estimatedReward = await this.getEstimatedReward(crop.cropType, crop.baseReward);
                    console.log(`Estimated reward for ${crop.cropType}: ${estimatedReward}`);
                } catch (error) {
                    console.error(`Error calculating estimated reward for ${crop.cropType}:`, error);
                    estimatedReward = "N/A";
                }

                if (timeToMaturity > 0) {
                    li.innerHTML = `
                        <span><span class="crop-icon">${this.cropIcons[crop.cropType]}</span>${crop.cropType}</span>
                        <span>Matures in ${this.formatTime(timeToMaturity)}</span>
                        <span>Estimated Value: ${this.formatTokenAmount(estimatedReward)} tokens</span>
                    `;
                } else {
                    li.innerHTML = `
                        <span><span class="crop-icon">${this.cropIcons[crop.cropType]}</span>${crop.cropType}</span>
                        <button class="harvest-single-btn" data-index="${index}">Harvest (Estimated Value: ${this.formatTokenAmount(estimatedReward)} tokens)</button>
                    `;
                    li.style.backgroundColor = '#c8e6c9';
                }
                cropList.appendChild(li);
            }

            document.querySelectorAll('.harvest-single-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const index = event.target.getAttribute('data-index');
                    this.harvestSingleCrop(index);
                });
            });
        }
    }

    formatTokenAmount(amount) {
        if (amount === "N/A") return amount;
        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat)) return "0.0000";
        if (amountFloat < 0.0001) return "<0.0001";
        return amountFloat.toFixed(4); // Display up to 4 decimal places
    }

    async stakeHarvestTokens(amount) {
        console.log("Attempting to stake Harvest tokens");
        if (!this.contract || !this.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const amountInWei = this.web3.utils.toWei(amount.toString(), 'ether');
            const harvestTokenContract = new this.web3.eth.Contract(this.erc20ABI, this.harvestTokenAddress);
            
            // First, approve the contract to spend tokens
            await harvestTokenContract.methods.approve(this.contractAddress, amountInWei).send({ from: this.accounts[0] });
            console.log("Approval successful");

            // Then, stake the tokens
            const result = await this.contract.methods.stake(this.harvestTokenAddress, amountInWei).send({ from: this.accounts[0] });
            
            if (result.status) {
                console.log(`${amount} Harvest tokens staked successfully!`);
                alert(`${amount} Harvest tokens staked successfully! Transaction hash: ${result.transactionHash}`);
                await this.updateFarmStatus();
                await this.updateHarvestTokenBalance();
            } else {
                console.error("Failed to stake Harvest tokens");
                alert("Failed to stake Harvest tokens. Please try again.");
            }
        } catch (error) {
            console.error("Error staking Harvest tokens:", error);
            alert(`Failed to stake Harvest tokens: ${error.message}`);
        }
    }

    async unstakeHarvestTokens(amount) {
        console.log("Attempting to unstake Harvest tokens");
        if (!this.contract || !this.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const amountInWei = this.web3.utils.toWei(amount.toString(), 'ether');
            
            const result = await this.contract.methods.unstake(this.harvestTokenAddress, amountInWei).send({ from: this.accounts[0] });
            
            if (result.status) {
                console.log(`${amount} Harvest tokens unstaked successfully!`);
                alert(`${amount} Harvest tokens unstaked successfully! Transaction hash: ${result.transactionHash}`);
                await this.updateFarmStatus();
                await this.updateHarvestTokenBalance();
            } else {
                console.error("Failed to unstake Harvest tokens");
                alert("Failed to unstake Harvest tokens. Please try again.");
            }
        } catch (error) {
            console.error("Error unstaking Harvest tokens:", error);
            alert(`Failed to unstake Harvest tokens: ${error.message}`);
        }
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
            plantBtn.addEventListener('click', () => this.plantCrop());
        } else {
            console.error("Plant button not found");
        }
        const harvestBtn = document.getElementById('harvest-btn');
        if (harvestBtn) {
            harvestBtn.addEventListener('click', () => this.harvestCrops());
        } else {
            console.error("Harvest button not found");
        }
        const stakeBtn = document.getElementById('stake-btn');
        if (stakeBtn) {
            stakeBtn.addEventListener('click', () => {
                const amount = document.getElementById('token-amount').value;
                this.stakeHarvestTokens(amount);
            });
        } else {
            console.error("Stake button not found");
        }
        const unstakeBtn = document.getElementById('unstake-btn');
        if (unstakeBtn) {
            unstakeBtn.addEventListener('click', () => {
                const amount = document.getElementById('token-amount').value;
                this.unstakeHarvestTokens(amount);
            });
        } else {
            console.error("Unstake button not found");
        }
        this.updateCropTypes();
        this.updateMarketUI();
        this.updateWeatherUI();

        // Update Harvest token balance every 30 seconds
        setInterval(() => this.updateHarvestTokenBalance(), 30000);

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

    // Initialize other UI elements
    const stakeBtn = document.getElementById('stake-btn');
    if (stakeBtn) {
        stakeBtn.addEventListener('click', () => {
            const amount = document.getElementById('token-amount').value;
            game.stakeHarvestTokens(amount);
        });
    } else {
        console.error('Stake button not found');
    }

    const unstakeBtn = document.getElementById('unstake-btn');
    if (unstakeBtn) {
        unstakeBtn.addEventListener('click', () => {
            const amount = document.getElementById('token-amount').value;
            game.unstakeHarvestTokens(amount);
        });
    } else {
        console.error('Unstake button not found');
    }
});

// Export the game instance if needed
export default game;

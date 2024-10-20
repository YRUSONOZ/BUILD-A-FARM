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
                "name": "RewardClaimed",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "newRate",
                        "type": "uint256"
                    }
                ],
                "name": "RewardRateUpdated",
                "type": "event"
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
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "tokenName",
                        "type": "string"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "newAddress",
                        "type": "address"
                    }
                ],
                "name": "TokenAddressUpdated",
                "type": "event"
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
                "name": "REWARD_RATE_PRECISION",
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
                "inputs": [],
                "name": "SECONDS_PER_DAY",
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
                "name": "accumulatedRewards",
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
                "name": "calculateRewards",
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
                        "name": "token",
                        "type": "address"
                    }
                ],
                "name": "claimRewards",
                "outputs": [],
                "stateMutability": "nonpayable",
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
                "name": "getClaimableRewards",
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
                "inputs": [],
                "name": "rewardRate",
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
                        "name": "_bitcoinToken",
                        "type": "address"
                    }
                ],
                "name": "setBitcoinTokenAddress",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_ethereumToken",
                        "type": "address"
                    }
                ],
                "name": "setEthereumTokenAddress",
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
                    }
                ],
                "name": "setHarvestTokenAddress",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_usdcToken",
                        "type": "address"
                    }
                ],
                "name": "setUsdcTokenAddress",
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
                "name": "stake",
                "outputs": [],
                "stateMutability": "nonpayable",
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
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "newRate",
                        "type": "uint256"
                    }
                ],
                "name": "updateRewardRate",
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
            }
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
                "constant": true,
                "inputs": [],
                "name": "totalSupply",
                "outputs": [{"name": "", "type": "uint256"}],
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
            },
            {
                "constant": false,
                "inputs": [
                    {"name": "_from", "type": "address"},
                    {"name": "_to", "type": "address"},
                    {"name": "_value", "type": "uint256"}
                ],
                "name": "transferFrom",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            }
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
                    console.log("Contract address:", this.contractAddress);
                    
                    // Instead of calling getFarmStatus, let's check if the contract has been properly initialized
                    if (!this.contract.methods) {
                        throw new Error("Contract methods not found");
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
        clearInterval(this.tokenBalanceInterval);
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
                    const newPrice = await this.contract.methods.marketPrices(this.cropTypes.indexOf(crop)).call();
                    console.log(`Market price for ${crop.name}:`, newPrice);
                    this.marketPrices[crop.name].currentPrice = parseInt(newPrice);
                    this.marketPrices[crop.name].trend = newPrice > this.marketPrices[crop.name].currentPrice ? 'up' : 'down';
                } catch (error) {
                    console.error(`Failed to update market price for ${crop.name}:`, error);
                    // Use fallback price if contract call fails
                    this.marketPrices[crop.name].currentPrice = crop.baseReward;
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
        
        let marketPrice = this.marketPrices[cropType].currentPrice;
        console.log(`Market Price for ${cropType}: ${marketPrice}`);

        let weather = this.currentWeather;
        console.log(`Current Weather: ${weather}`);
        
        let weatherMultiplier = 100;
        if (weather == 1) weatherMultiplier = 120; // Rainy
        if (weather == 3) weatherMultiplier = 80; // CryptoWinter
        console.log(`Weather Multiplier: ${weatherMultiplier}`);

        const scalingFactor = 1e15; // Use a constant scaling factor
        console.log(`Scaling Factor: ${scalingFactor}`);

        // Use regular JavaScript numbers for calculations
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
            option.textContent = `${crop.name} (Cost: ${crop.basePlantCost} tokens, Estimated Value: ${this.formatTokenAmount(estimatedReward)} tokens)`;
            cropSelect.appendChild(option);
        }
        console.log("Crop select options updated:", cropSelect.innerHTML);
    }

    addStakedTokenToList(cropList, tokenName, amount, tokenAddress, rewards) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><span class="crop-icon">🏦</span>Staked ${tokenName}</span>
            <span>${this.formatTokenAmount(this.web3.utils.fromWei(amount, tokenName === 'USDC' ? 'mwei' : 'ether'))} ${tokenName}</span>
            <span>Rewards: ${this.formatTokenAmount(this.web3.utils.fromWei(rewards, tokenName === 'USDC' ? 'mwei' : 'ether'))} ${tokenName}</span>
            <button class="unstake-btn" data-token="${tokenAddress}">Unstake</button>
            <button class="claim-btn" data-token="${tokenAddress}">Claim Rewards</button>
        `;
        li.querySelector('.unstake-btn').addEventListener('click', () => this.tokenActions.unstakeTokens(tokenAddress, amount));
        li.querySelector('.claim-btn').addEventListener('click', () => this.tokenActions.claimRewards(tokenAddress));
        cropList.appendChild(li);
    }

    formatTokenAmount(amount) {
        if (amount === "N/A") return amount;
        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat)) return "0.0000";
        if (amountFloat < 0.0001) return "<0.0001";
        return amountFloat.toFixed(4); // Display up to 4 decimal places
    }

    async getStakingAPY(tokenAddress) {
        if (!this.contract || !this.accounts) return "N/A";
        try {
            const rewardRate = await this.contract.methods.rewardRate().call();
            const apy = (Number(rewardRate) * 365 * 100) / 10000; // Assuming rewardRate is daily and uses REWARD_RATE_PRECISION
            return apy.toFixed(2);
        } catch (error) {
            console.error("Error fetching staking APY:", error);
            return "N/A";
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

import UpgradeSystem from './upgrades.js';

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
        this.usdcTokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC token address on Ethereum mainnet
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

        this.initializeMarketPrices();
        this.initializeUI();
        this.startMarketFluctuations();
        console.log("CropFarmingGame initialized");
    }

    async connectWallet() {
        console.log("Attempting to connect wallet");
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log("Accounts received:", accounts);
                
                // Initialize Web3
                this.web3 = new Web3(window.ethereum);
                this.accounts = accounts;

                // Check network
                const networkId = await this.web3.eth.net.getId();
                console.log("Network ID:", networkId);
                const sepoliaTestnetId = 11155111;
                if (networkId !== sepoliaTestnetId) {
                    alert('Please connect to the Sepolia testnet in MetaMask');
                    return;
                }

                // Initialize contract
                try {
                    this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
                    console.log("Contract initialized:", this.contract);
                    
                    // Test contract method
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

                // Set up the game state
                this.playerID = this.accounts[0];
                this.updateWalletUI();
                await this.updateTokenBalances(); // Add this line
                await this.updateFarmStatus();
                this.updateWeather();
                this.updateSelectedTokenBalance();

                // Set up intervals for updates
                this.farmStatusInterval = setInterval(() => this.updateFarmStatus(), 30000);
                this.weatherInterval = setInterval(() => this.updateWeather(), this.weatherCheckInterval * 1000);
                this.tokenBalanceInterval = setInterval(() => this.updateTokenBalances(), 30000);
                
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

    async updateTokenBalances() {
        if (!this.web3 || !this.accounts) {
            console.log("Web3 or accounts not available");
            return;
        }

        try {
            const harvestTokenContract = new this.web3.eth.Contract(this.erc20ABI, this.harvestTokenAddress);
            const usdcTokenContract = new this.web3.eth.Contract(this.erc20ABI, this.usdcTokenAddress);

            const harvestBalance = await harvestTokenContract.methods.balanceOf(this.accounts[0]).call();
            const usdcBalance = await usdcTokenContract.methods.balanceOf(this.accounts[0]).call();

            this.tokenBalances.harvest = this.web3.utils.fromWei(harvestBalance, 'ether');
            this.tokenBalances.usdc = this.web3.utils.fromWei(usdcBalance, 'mwei'); // USDC has 6 decimals

            console.log("Token balances updated:", this.tokenBalances);
            this.updateSelectedTokenBalance();
        } catch (error) {
            console.error("Error updating token balances:", error);
        }
    }

    updateSelectedTokenBalance() {
        console.log("Updating selected token balance");
        const tokenSelect = document.getElementById('token-select');
        const balanceElement = document.getElementById('selected-token-balance');
        const stakedBalanceElement = document.getElementById('staked-token-balance');
        const apyElement = document.getElementById('token-staking-apy');

        if (!tokenSelect || !balanceElement) {
            console.error("Token select or balance element not found");
            return;
        }

        const selectedToken = tokenSelect.value;
        console.log("Selected token:", selectedToken);

        // Update the label to "Wallet Balance"
        const balanceLabel = document.querySelector('label[for="selected-token-balance"]');
        if (balanceLabel) {
            balanceLabel.textContent = 'Wallet Balance:';
        } else {
            console.error("Balance label element not found");
        }

        // Display the wallet balance for the selected token
        const walletBalance = this.tokenBalances[selectedToken];
        console.log(`Wallet balance for ${selectedToken}:`, walletBalance);
        balanceElement.textContent = this.formatTokenAmount(walletBalance);

        // Update staked balance and APY
        if (this.contract && this.accounts) {
            const tokenAddress = selectedToken === 'usdc' ? this.usdcTokenAddress : this.harvestTokenAddress;
            this.contract.methods.stakes(this.accounts[0], tokenAddress).call()
                .then(stake => {
                    const stakedAmount = this.web3.utils.fromWei(stake.amount, selectedToken === 'usdc' ? 'mwei' : 'ether');
                    if (stakedBalanceElement) {
                        stakedBalanceElement.textContent = this.formatTokenAmount(stakedAmount);
                    } else {
                        console.error("Staked balance element not found");
                    }
                    return this.getStakingAPY(tokenAddress);
                })
                .then(apy => {
                    if (apyElement) {
                        apyElement.textContent = `${apy}%`;
                    } else {
                        console.error("APY element not found");
                    }
                })
                .catch(error => {
                    console.error("Error updating staked balance and APY:", error);
                });
        } else {
            console.log("Contract or accounts not available, skipping staked balance and APY update");
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

    async updateCropList() {
        console.log("Updating crop list");
        const cropList = document.getElementById('crop-list');
        if (!cropList) {
            console.error("Crop list element not found");
            return;
        }
        cropList.innerHTML = '';

        // Add staked tokens to the list
        if (this.contract && this.accounts) {
            try {
                const stakedHarvest = await this.contract.methods.stakes(this.accounts[0], this.harvestTokenAddress).call();
                const stakedUSDC = await this.contract.methods.stakes(this.accounts[0], this.usdcTokenAddress).call();

                if (parseInt(stakedHarvest.amount) > 0) {
                    const harvestRewards = await this.contract.methods.getClaimableRewards(this.accounts[0], this.harvestTokenAddress).call();
                    this.addStakedTokenToList(cropList, 'Harvest Token', stakedHarvest.amount, this.harvestTokenAddress, harvestRewards);
                }

                if (parseInt(stakedUSDC.amount) > 0) {
                    const usdcRewards = await this.contract.methods.getClaimableRewards(this.accounts[0], this.usdcTokenAddress).call();
                    this.addStakedTokenToList(cropList, 'USDC', stakedUSDC.amount, this.usdcTokenAddress, usdcRewards);
                }
            } catch (error) {
                console.error("Error fetching staked amounts and rewards:", error);
            }
        }

        if (this.crops.length === 0 && cropList.children.length === 0) {
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

    addStakedTokenToList(cropList, tokenName, amount, tokenAddress, rewards) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><span class="crop-icon">🏦</span>Staked ${tokenName}</span>
            <span>${this.formatTokenAmount(this.web3.utils.fromWei(amount, tokenName === 'USDC' ? 'mwei' : 'ether'))} ${tokenName}</span>
            <span>Rewards: ${this.formatTokenAmount(this.web3.utils.fromWei(rewards, tokenName === 'USDC' ? 'mwei' : 'ether'))} ${tokenName}</span>
            <button class="unstake-btn" data-token="${tokenAddress}">Unstake</button>
            <button class="claim-btn" data-token="${tokenAddress}">Claim Rewards</button>
        `;
        li.querySelector('.unstake-btn').addEventListener('click', () => this.unstakeTokens(tokenAddress, amount));
        li.querySelector('.claim-btn').addEventListener('click', () => this.claimRewards(tokenAddress));
        cropList.appendChild(li);
    }

    formatTokenAmount(amount) {
        if (amount === "N/A") return amount;
        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat)) return "0.0000";
        if (amountFloat < 0.0001) return "<0.0001";
        return amountFloat.toFixed(4); // Display up to 4 decimal places
    }

    async stakeTokens(tokenType, amount) {
        console.log(`Attempting to stake ${tokenType} tokens`);
        if (!this.contract || !this.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const tokenAddress = tokenType === 'usdc' ? this.usdcTokenAddress : this.harvestTokenAddress;
            const decimals = tokenType === 'usdc' ? 6 : 18;
            const amountInSmallestUnit = this.web3.utils.toWei(amount.toString(), tokenType === 'usdc' ? 'mwei' : 'ether');
            const tokenContract = new this.web3.eth.Contract(this.erc20ABI, tokenAddress);
            
            console.log("Approving token transfer...");
            const approvalResult = await tokenContract.methods.approve(this.contractAddress, amountInSmallestUnit).send({ from: this.accounts[0] });
            console.log("Approval result:", approvalResult);

            if (approvalResult.status) {
                console.log("Approval successful, now staking...");
                const result = await this.contract.methods.stake(tokenAddress, amountInSmallestUnit).send({ from: this.accounts[0] });
                
                if (result.status) {
                    console.log(`${amount} ${tokenType.toUpperCase()} tokens staked successfully!`);
                    alert(`${amount} ${tokenType.toUpperCase()} tokens staked successfully! Transaction hash: ${result.transactionHash}`);
                    await this.updateFarmStatus();
                    await this.updateTokenBalances();
                } else {
                    console.error(`Failed to stake ${tokenType.toUpperCase()} tokens`);
                    alert(`Failed to stake ${tokenType.toUpperCase()} tokens. Please try again.`);
                }
            } else {
                console.error("Failed to approve token transfer");
                alert("Failed to approve token transfer. Please try again.");
            }
        } catch (error) {
            console.error(`Error staking ${tokenType.toUpperCase()} tokens:`, error);
            alert(`Failed to stake ${tokenType.toUpperCase()} tokens: ${error.message}`);
        }
    }

    async unstakeTokens(tokenAddress, amount) {
        console.log(`Attempting to unstake tokens from address ${tokenAddress}`);
        if (!this.contract || !this.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const result = await this.contract.methods.unstake(tokenAddress, amount).send({ from: this.accounts[0] });
            
            if (result.status) {
                const tokenType = tokenAddress === this.usdcTokenAddress ? 'USDC' : 'Harvest Token';
                const unstakedAmount = this.web3.utils.fromWei(amount, tokenType === 'USDC' ? 'mwei' : 'ether');
                console.log(`${unstakedAmount} ${tokenType} unstaked successfully!`);
                alert(`${unstakedAmount} ${tokenType} unstaked successfully! Transaction hash: ${result.transactionHash}`);
                await this.updateFarmStatus();
                await this.updateTokenBalances();
            } else {
                console.error("Failed to unstake tokens");
                alert("Failed to unstake tokens. Please try again.");
            }
        } catch (error) {
            console.error("Error unstaking tokens:", error);
            alert(`Failed to unstake tokens: ${error.message}`);
        }
    }

    async claimRewards(tokenAddress) {
        console.log(`Attempting to claim rewards for token address ${tokenAddress}`);
        if (!this.contract || !this.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const result = await this.contract.methods.claimRewards(tokenAddress).send({ from: this.accounts[0] });
            
            if (result.status) {
                console.log("Rewards claimed successfully!");
                alert("Rewards claimed successfully!");
                await this.updateFarmStatus();
                await this.updateTokenBalances();
            } else {
                console.error("Failed to claim rewards");
                alert("Failed to claim rewards. Please try again.");
            }
        } catch (error) {
            console.error("Error claiming rewards:", error);
            alert(`Failed to claim rewards: ${error.message}`);
        }
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
        const unstakeBtn = document.getElementById('unstake-btn');
        const tokenSelect = document.getElementById('token-select');
        if (stakeBtn && unstakeBtn && tokenSelect) {
            stakeBtn.addEventListener('click', () => {
                const tokenType = tokenSelect.value;
                const amount = document.getElementById('token-amount').value;
                this.stakeTokens(tokenType, amount);
            });
            unstakeBtn.addEventListener('click', () => {
                const tokenType = tokenSelect.value;
                const amount = document.getElementById('token-amount').value;
                const tokenAddress = tokenType === 'usdc' ? this.usdcTokenAddress : this.harvestTokenAddress;
                this.unstakeTokens(tokenAddress, this.web3.utils.toWei(amount, tokenType === 'usdc' ? 'mwei' : 'ether'));
            });
            tokenSelect.addEventListener('change', () => this.updateSelectedTokenBalance());
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

    // Set up event listeners for token selection and balance updates
    const tokenSelect = document.getElementById('token-select');
    if (tokenSelect) {
        tokenSelect.addEventListener('change', () => {
            game.updateSelectedTokenBalance();
        });
    }

    // Set up periodic updates
    setInterval(() => {
        if (game.accounts && game.accounts.length > 0) {
            game.updateTokenBalances();
            game.updateFarmStatus();
        }
    }, 30000); // Update every 30 seconds
});

// Export the game instance if needed
export default game;

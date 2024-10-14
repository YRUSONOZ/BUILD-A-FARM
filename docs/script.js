class UpgradeSystem {
    constructor(game) {
        this.game = game;
        this.upgrades = {
            growthSpeed: {
                name: "Growth Accelerator",
                levels: [
                    { cost: 100, effect: 100 },
                    { cost: 250, effect: 90 },
                    { cost: 500, effect: 80 },
                    { cost: 1000, effect: 70 },
                    { cost: 2000, effect: 60 }
                ],
                description: "Reduces crop growth time",
                currentLevel: 0
            },
            yieldBoost: {
                name: "Yield Enhancer",
                levels: [
                    { cost: 100, effect: 100 },
                    { cost: 250, effect: 110 },
                    { cost: 500, effect: 120 },
                    { cost: 1000, effect: 130 },
                    { cost: 2000, effect: 140 }
                ],
                description: "Increases harvest yield",
                currentLevel: 0
            }
        };
        this.initializeUpgradeUI();
    }

    initializeUpgradeUI() {
        const upgradeContainer = document.getElementById('upgrade-container');
        if (!upgradeContainer) {
            console.error("Upgrade container not found");
            return;
        }

        Object.entries(this.upgrades).forEach(([key, upgrade]) => {
            const upgradeElement = document.createElement('div');
            upgradeElement.className = 'upgrade-item';
            upgradeElement.innerHTML = `
                <h3>${upgrade.name}</h3>
                <p>${upgrade.description}</p>
                <p>Current Level: <span id="${key}-level">0</span></p>
                <p>Next Upgrade Cost: <span id="${key}-cost">${upgrade.levels[0].cost}</span> tokens</p>
                <button id="${key}-upgrade-btn">Upgrade</button>
            `;
            upgradeContainer.appendChild(upgradeElement);

            document.getElementById(`${key}-upgrade-btn`).addEventListener('click', () => this.purchaseUpgrade(key));
        });
    }

    purchaseUpgrade(upgradeKey) {
        const upgrade = this.upgrades[upgradeKey];
        const nextLevel = upgrade.currentLevel + 1;

        if (nextLevel >= upgrade.levels.length) {
            alert("Max level reached for this upgrade!");
            return;
        }

        const cost = upgrade.levels[nextLevel].cost;

        if (this.game.balance < cost) {
            alert("Not enough tokens to purchase this upgrade!");
            return;
        }

        this.game.balance -= cost;
        upgrade.currentLevel = nextLevel;

        this.updateUpgradeUI(upgradeKey);
        this.game.updateWalletUI();

        alert(`${upgrade.name} upgraded to level ${nextLevel}!`);
    }

    updateUpgradeUI(upgradeKey) {
        const upgrade = this.upgrades[upgradeKey];
        const levelElement = document.getElementById(`${upgradeKey}-level`);
        const costElement = document.getElementById(`${upgradeKey}-cost`);
        if (levelElement && costElement) {
            levelElement.textContent = upgrade.currentLevel;
            const nextLevel = upgrade.currentLevel + 1;
            if (nextLevel < upgrade.levels.length) {
                costElement.textContent = upgrade.levels[nextLevel].cost;
            } else {
                costElement.textContent = "MAX";
                document.getElementById(`${upgradeKey}-upgrade-btn`).disabled = true;
            }
        }
    }

    getGrowthSpeedMultiplier() {
        return this.upgrades.growthSpeed.levels[this.upgrades.growthSpeed.currentLevel].effect;
    }

    getYieldBoostMultiplier() {
        return this.upgrades.yieldBoost.levels[this.upgrades.yieldBoost.currentLevel].effect;
    }
}

class CropFarmingGame {
    constructor() {
        console.log("Initializing CropFarmingGame");
        this.playerID = 'Not Connected';
        this.balance = 0;
        this.crops = [];
        this.cropIcons = {
            'Bitcoin': '🪙',
            'Ethereum': '💎',
            'Dogecoin': '🐶'
        };
        this.cropTypes = [
            { name: "Bitcoin", baseGrowthTime: 300, baseReward: 50, basePlantCost: 10 },
            { name: "Ethereum", baseGrowthTime: 180, baseReward: 30, basePlantCost: 5 },
            { name: "Dogecoin", baseGrowthTime: 60, baseReward: 10, basePlantCost: 1 }
        ];
        this.marketPrices = {};
        this.contractAddress = '0xEB7F27A122E1d42f73d038C9eeA3796cCC1c9A46';
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
				"internalType": "string",
				"name": "cropType",
				"type": "string"
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
				"internalType": "uint256",
				"name": "_index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "yieldBoostMultiplier",
				"type": "uint256"
			}
		],
		"name": "harvestSingleCrop",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "cropType",
				"type": "string"
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
		"inputs": [
			{
				"internalType": "string",
				"name": "_cropType",
				"type": "string"
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
				"internalType": "string",
				"name": "cropType",
				"type": "string"
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
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
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
				"internalType": "uint256",
				"name": "lastHarvestTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tokenBalance",
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
						"internalType": "string",
						"name": "cropType",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "plantTime",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "maturityTime",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "baseReward",
						"type": "uint256"
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
				"internalType": "string",
				"name": "cropType",
				"type": "string"
			}
		],
		"name": "getMarketPrice",
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
				"name": "_farmer",
				"type": "address"
			}
		],
		"name": "getTokenBalance",
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
		"name": "lastWeatherChange",
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
		"name": "MARKET_UPDATE_INTERVAL",
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
				"internalType": "string",
				"name": "",
				"type": "string"
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
        this.initializeMarketPrices();
        this.initializeUI();
        this.startMarketFluctuations();
        console.log("CropFarmingGame initialized");
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
        this.updateCropTypes();
        this.updateMarketUI();
        this.updateWeatherUI();
        console.log("UI initialized");
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
                    this.marketPrices[crop.name].currentPrice = parseInt(newPrice);
                    this.marketPrices[crop.name].trend = newPrice > this.marketPrices[crop.name].currentPrice ? 'up' : 'down';
                } catch (error) {
                    console.error(`Failed to update market price for ${crop.name}:`, error);
                }
            }
        } else {
            // Fallback to local price updates if not connected to the contract
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

        // Use BigNumber for precise calculations
        const BN = this.web3.utils.BN;
        const baseRewardBN = new BN(baseReward);
        const marketPriceBN = new BN(marketPrice);
        const scalingFactorBN = new BN(scalingFactor);
        const weatherMultiplierBN = new BN(weatherMultiplier);
        const yieldBoostMultiplierBN = new BN(yieldBoostMultiplier);
        const tenThousandBN = new BN(10000);

        // Calculate priceAdjustedReward: (baseReward * marketPrice) / scalingFactor
        const priceAdjustedReward = baseRewardBN.mul(marketPriceBN).div(scalingFactorBN);
        console.log(`Price Adjusted Reward: ${priceAdjustedReward.toString()}`);

        // Calculate estimatedReward: (priceAdjustedReward * weatherMultiplier * yieldBoostMultiplier) / 10000
        const estimatedReward = priceAdjustedReward.mul(weatherMultiplierBN).mul(yieldBoostMultiplierBN).div(tenThousandBN);
        console.log(`Estimated Reward: ${estimatedReward.toString()}`);
        
        // Convert to a more readable format
        const estimatedRewardEth = this.web3.utils.fromWei(estimatedReward.toString(), 'ether');
        console.log(`Estimated Reward in Ether: ${estimatedRewardEth}`);
        
        return estimatedRewardEth;
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
    }

    async updateCropList() {
        console.log("Updating crop list");
        const cropList = document.getElementById('crop-list');
        if (!cropList) {
            console.error("Crop list element not found");
            return;
        }
        cropList.innerHTML = '';
        if (this.crops.length === 0) {
            cropList.innerHTML = '<li>No crops planted yet.</li>';
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
        return amountFloat.toFixed(4); // Display up to 4 decimal places
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

    async updateWeather() {
        console.log("Updating weather");
        if (this.contract && this.accounts) {
            try {
                const weather = await this.contract.methods.getCurrentWeather().call();
                this.currentWeather = parseInt(weather);
                this.updateWeatherUI();
                await this.updateCropTypes();
            } catch (error) {
                console.error("Error updating weather:", error);
            }
        } else {
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
}

// Initialize the game
console.log("Starting game initialization");
const game = new CropFarmingGame();
console.log("Game initialized");

// Start market fluctuations
game.startMarketFluctuations();

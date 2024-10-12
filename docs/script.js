import UpgradeSystem from './upgrades.js';

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
        this.contractAddress = '0xf19b95A8b666E1fe91448f7e4184df14D36BA05C';
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
                        "indexed": false,
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
                        "indexed": false,
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
        this.marketUpdateInterval = 30000;
        this.marketCountdown = 30;
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
                this.marketCountdown = 30;
                this.lastMarketUpdate = now;
            } else {
                this.marketCountdown = Math.max(0, 30 - Math.floor(elapsedTime / 1000));
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

    updateMarketPrices() {
        console.log("Updating market prices");
        this.cropTypes.forEach(crop => {
            const market = this.marketPrices[crop.name];
            const changePercent = Math.random() * 0.2;
            const changeAmount = crop.baseReward * changePercent;

            if (market.trend === 'up') {
                market.currentPrice += changeAmount;
                if (Math.random() > 0.7) market.trend = 'down';
            } else {
                market.currentPrice -= changeAmount;
                if (Math.random() > 0.7) market.trend = 'up';
            }

            market.currentPrice = Math.max(crop.baseReward * 0.5, Math.min(crop.baseReward * 1.5, market.currentPrice));
        });

        this.updateMarketUI();
        this.updateCropTypes();
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

    updateCropTypes() {
        console.log("Updating crop types");
        const cropSelect = document.getElementById('crop-select');
        if (!cropSelect) {
            console.error("Crop select element not found");
            return;
        }
        cropSelect.innerHTML = '';
        this.cropTypes.forEach((crop) => {
            const option = document.createElement('option');
            option.value = crop.name;
            const currentPrice = this.marketPrices[crop.name].currentPrice;
            option.textContent = `${crop.name} (Cost: ${crop.basePlantCost} tokens, Current Value: ${currentPrice.toFixed(2)} tokens)`;
            cropSelect.appendChild(option);
        });
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
                    console.log("Contract ABI:", JSON.stringify(this.contractABI));
                    console.log("Contract Address:", this.contractAddress);
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
            } catch (error) {
                console.error("Error updating weather:", error);
            }
        } else {
            this.currentWeather = Math.floor(Math.random() * 4);
            this.updateWeatherUI();
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
            console.log("Contract:", this.contract);
            console.log("Contract methods:", this.contract.methods);
            const growthSpeedMultiplier = this.upgradeSystem.getGrowthSpeedMultiplier();
            console.log("Growth Speed Multiplier:", growthSpeedMultiplier);
            
            if (!this.contract.methods.plantCrop) {
                console.error("plantCrop method not found in contract");
                alert("Contract method 'plantCrop' not found. Please check your contract ABI.");
                return;
            }
            const result = await this.contract.methods.plantCrop(cropType, growthSpeedMultiplier).send({ from: this.accounts[0] });
            
            if (result.status) {
                const currentValue = this.marketPrices[cropType].currentPrice;
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
            if (!this.contract.methods.harvestCrops) {
                console.error("harvestCrops method not found in contract");
                alert("Contract method 'harvestCrops' not found. Please check your contract ABI.");
                return;
            }
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
            if (!this.contract.methods.harvestSingleCrop) {
                console.error("harvestSingleCrop method not found in contract");
                alert("Contract method 'harvestSingleCrop' not found. Please check your contract ABI.");
                return;
            }
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
                if (!this.contract.methods.getFarmStatus) {
                    console.error("getFarmStatus method not found in contract");
                    alert("Contract method 'getFarmStatus' not found. Please check your contract ABI.");
                    return;
                }
                const farmStatus = await this.contract.methods.getFarmStatus(this.accounts[0]).call();
                console.log("Raw farm status:", farmStatus);

                let crops, balance;
                if (Array.isArray(farmStatus) && farmStatus.length === 2) {
                    [crops, balance] = farmStatus;
                } else if (farmStatus.hasOwnProperty('0') && farmStatus.hasOwnProperty('1')) {
                    crops = farmStatus['0'];
                    balance = farmStatus['1'];
                } else {
                    console.error("Unexpected farm status format:", farmStatus);
                    crops = [];
                    balance = 0;
                }

                this.crops = crops;
                this.balance = parseInt(balance);
                this.updateWalletUI();
                this.upgradeSystem.updateUpgradeUI();

                await this.updateCropList();

                if (this.cropUpdateInterval) {
                    clearInterval(this.cropUpdateInterval);
                }
                this.cropUpdateInterval = setInterval(() => this.updateCropList(), 1000);

                console.log("Farm status updated");
            } catch (error) {
                console.error("Failed to update farm status:", error);
            }
        } else {
            console.log("Wallet not connected, skipping farm status update");
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

                let currentValue;
                if (timeToMaturity <= 0) {
                    try {
                        const yieldBoostMultiplier = this.upgradeSystem.getYieldBoostMultiplier();
                        currentValue = await this.contract.methods.calculateHarvestReward(index, yieldBoostMultiplier).call();
                    } catch (error) {
                        console.error("Error calculating harvest reward:", error);
                        currentValue = 0;
                    }
                } else {
                    currentValue = this.marketPrices[crop.cropType].currentPrice;
                }

                if (timeToMaturity > 0) {
                    li.innerHTML = `
                        <span><span class="crop-icon">${this.cropIcons[crop.cropType]}</span>${crop.cropType}</span>
                        <span>Matures in ${this.formatTime(timeToMaturity)}</span>
                    `;
                } else {
                    li.innerHTML = `
                        <span><span class="crop-icon">${this.cropIcons[crop.cropType]}</span>${crop.cropType}</span>
                        <button class="harvest-single-btn" data-index="${index}">Harvest (Current Value: ${currentValue} tokens)</button>
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

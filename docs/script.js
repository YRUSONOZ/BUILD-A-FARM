class CropFarmingGame {
    constructor() {
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
        this.maturityTimers = [];
        this.contractAddress = '0x057048fa519b97a552f11297511c0A3f71d0d4e8';
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
                "inputs": [],
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
        this.marketUpdateInterval = 30000; // 30 seconds in milliseconds
        this.marketCountdown = 30;
        this.lastMarketUpdate = Date.now();
        this.weatherIcons = {
            0: '☀️', // Sunny
            1: '🌧️', // Rainy
            2: '🏜️', // Drought
            3: '❄️'  // CryptoWinter
        };
        this.weatherEffects = {
            0: 'Growth speed +20%',
            1: 'Yield +20%',
            2: 'Growth speed -20%',
            3: 'Yield -20%'
        };
        this.currentWeather = 0;
        this.weatherCheckInterval = 30; // seconds
        this.initializeMarketPrices();
        this.initializeUI();
        this.startMarketFluctuations();
    }

    // Initialize UI elements
    initializeUI() {
        const connectWalletBtn = document.getElementById('connect-wallet-btn');
        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', () => this.connectWallet());
        } else {
            console.error("Connect wallet button not found");
        }
        document.getElementById('disconnect-wallet-btn').addEventListener('click', () => this.disconnectWallet());
        document.getElementById('plant-btn').addEventListener('click', () => this.plantCrop());
        document.getElementById('harvest-btn').addEventListener('click', () => this.harvestCrops());
        this.updateCropTypes();
        this.updateMarketUI();
        this.updateWeatherUI();
    }

    // Initialize crop prices
    initializeMarketPrices() {
        this.cropTypes.forEach(crop => {
            this.marketPrices[crop.name] = {
                currentPrice: crop.baseReward,
                trend: Math.random() > 0.5 ? 'up' : 'down'
            };
        });
    }

    // Start market fluctuations
    startMarketFluctuations() {
        this.updateMarketPrices();
        this.updateMarketCountdown();

        // Use setInterval for consistent 1-second updates
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
        }
    }

    // Update market prices periodically
    updateMarketPrices() {
        this.cropTypes.forEach(crop => {
            const market = this.marketPrices[crop.name];
            const changePercent = Math.random() * 0.2; // Max 20% change
            const changeAmount = crop.baseReward * changePercent;

            if (market.trend === 'up') {
                market.currentPrice += changeAmount;
                if (Math.random() > 0.7) market.trend = 'down'; // 30% chance to change trend
            } else {
                market.currentPrice -= changeAmount;
                if (Math.random() > 0.7) market.trend = 'up'; // 30% chance to change trend
            }

            // Ensure price doesn't go below 50% or above 150% of base price
            market.currentPrice = Math.max(crop.baseReward * 0.5, Math.min(crop.baseReward * 1.5, market.currentPrice));
        });

        this.updateMarketUI();
        this.updateCropTypes();
    }

    // Update the market prices in the UI
    updateMarketUI() {
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

    // Update crop types in the dropdown
    updateCropTypes() {
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

    // Connect wallet using MetaMask
    async connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.web3 = new Web3(window.ethereum);
                this.accounts = accounts;

                const networkId = await this.web3.eth.net.getId();
                const sepoliaTestnetId = 11155111; // Ensure this is the right network
                if (networkId !== sepoliaTestnetId) {
                    alert('Please connect to the Sepolia testnet in MetaMask');
                    return;
                }

                // Initialize contract
                this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
                console.log('Contract initialized:', this.contract); // This should show contract methods

                this.playerID = this.accounts[0];
                this.updateWalletUI();
                await this.updateFarmStatus();
                await this.updateWeather();

                // Set up intervals for automatic updates
                this.farmStatusInterval = setInterval(() => this.updateFarmStatus(), 30000); // Update every 30 seconds
                this.weatherInterval = setInterval(() => this.updateWeather(), this.weatherCheckInterval * 1000);
            } catch (error) {
                console.error("Failed to connect wallet:", error);
                alert("Failed to connect wallet. Check the console for details.");
            }
        } else {
            alert("Please install MetaMask to use this dApp!");
        }
    }

    // Disconnect wallet
    disconnectWallet() {
        this.web3 = null;
        this.contract = null;
        this.accounts = null;
        this.playerID = 'Not Connected';
        this.balance = 0;
        this.updateWalletUI();
        document.getElementById('disconnect-wallet-btn').style.display = 'none';
        clearInterval(this.farmStatusInterval);
        clearInterval(this.weatherInterval);
        alert('Wallet disconnected successfully.');
    }

    // Update the wallet UI
    updateWalletUI() {
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

    // Fetch weather from the contract
    async updateWeather() {
        if (!this.contract || !this.accounts) {
            console.error("Wallet or contract not initialized");
            return;
        }

        try {
            const currentWeather = await this.contract.methods.getCurrentWeather().call();
            this.currentWeather = parseInt(currentWeather); // Convert to integer if needed
            this.updateWeatherUI();
        } catch (error) {
            console.error("Failed to fetch current weather:", error);
        }
    }

    // Update the weather UI
    updateWeatherUI() {
        const weatherContainer = document.getElementById('weather-container');
        if (weatherContainer) {
            weatherContainer.innerHTML = `
                <h3>Current Weather: ${this.weatherIcons[this.currentWeather]}</h3>
                <p>Effect: ${this.weatherEffects[this.currentWeather]}</p>
            `;
        }
    }

    // Update the farm status by fetching data from the contract
    async updateFarmStatus() {
        if (!this.contract || !this.accounts) {
            console.error("Wallet or contract not initialized");
            return;
        }

        try {
            const farmStatus = await this.contract.methods.getFarmStatus(this.accounts[0]).call();
            const [crops, balance] = farmStatus;  // farmStatus is an array, so destructure it

            this.crops = crops;
            this.balance = balance;

            this.updateWalletUI();
            this.updateFarmUI(); // A method to update the farm display in UI

        } catch (error) {
            console.error("Failed to update farm status:", error);
        }
    }

    // Update the farm UI with the crops and their maturity timers
    updateFarmUI() {
        const cropList = document.getElementById('crop-list');
        cropList.innerHTML = '';

        if (this.maturityTimers) {
            this.maturityTimers.forEach(clearInterval);  // Clear any existing intervals
        }
        this.maturityTimers = [];

        if (this.crops.length === 0) {
            cropList.innerHTML = '<li>No crops planted yet.</li>';
        } else {
            this.crops.forEach((crop, index) => {
                const li = document.createElement('li');
                li.id = `crop-${index}`;

                const currentTime = Math.floor(Date.now() / 1000);
                const timeToMaturity = Math.max(0, parseInt(crop.maturityTime) - currentTime);
                const currentValue = this.marketPrices[crop.cropType].currentPrice;

                if (timeToMaturity > 0) {
                    li.innerHTML = `
                        <span><span class="crop-icon">${this.cropIcons[crop.cropType]}</span>${crop.cropType}</span>
                        <span class="maturity-timer">Matures in ${timeToMaturity}s</span>
                    `;
                } else {
                    li.innerHTML = `
                        <span><span class="crop-icon">${this.cropIcons[crop.cropType]}</span>${crop.cropType}</span>
                        <button class="harvest-single-btn" data-index="${index}">Harvest (Current Value: ${currentValue.toFixed(2)} tokens)</button>
                    `;
                    li.style.backgroundColor = '#c8e6c9';
                }

                cropList.appendChild(li);

                // Real-time countdown
                const maturitySpan = li.querySelector('.maturity-timer');
                const interval = setInterval(() => {
                    const now = Math.floor(Date.now() / 1000);
                    const timeLeft = Math.max(0, parseInt(crop.maturityTime) - now);
                    if (timeLeft > 0) {
                        maturitySpan.textContent = `Matures in ${timeLeft}s`;
                    } else {
                        maturitySpan.textContent = 'Ready for harvest!';
                        clearInterval(interval);
                        li.style.backgroundColor = '#c8e6c9';
                    }
                }, 1000);
                this.maturityTimers.push(interval);
            });

            // Add event listeners to the new harvest buttons
            document.querySelectorAll('.harvest-single-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const index = event.target.getAttribute('data-index');
                    this.harvestSingleCrop(index);
                });
            });
        }
    }

    // Plant a crop by calling the contract's plantCrop function
    async plantCrop() {
        if (!this.contract || !this.accounts) {
            alert("Please connect your wallet first!");
            return;
        }

        console.log("Contract methods:", this.contract.methods);  // Debugging line

        const cropType = document.getElementById('crop-select').value;
        try {
            const result = await this.contract.methods.plantCrop(cropType).send({ from: this.accounts[0] });
            if (result.status) {
                alert(`${cropType} planted successfully! Transaction hash: ${result.transactionHash}`);
                await this.updateFarmStatus();
            } else {
                alert("Failed to plant crop. Please try again.");
            }
        } catch (error) {
            console.error("Error planting crop:", error);
            alert(`Failed to plant crop: ${error.message}`);
        }
    }

    // Harvest all crops
    async harvestCrops() {
        if (!this.contract || !this.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const result = await this.contract.methods.harvestCrops().send({ from: this.accounts[0] });
            if (result.status) {
                alert("All crops harvested successfully!");
                await this.updateFarmStatus();
            } else {
                alert("Failed to harvest crops. Please try again.");
            }
        } catch (error) {
            console.error("Error harvesting crops:", error);
            alert(`Failed to harvest crops: ${error.message}`);
        }
    }

    // Harvest a single crop
    async harvestSingleCrop(index) {
        if (!this.contract || !this.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const result = await this.contract.methods.harvestSingleCrop(index).send({ from: this.accounts[0] });
            if (result.status) {
                alert("Crop harvested successfully!");
                await this.updateFarmStatus();
            } else {
                alert("Failed to harvest crop. Please try again.");
            }
        } catch (error) {
            console.error("Error harvesting crop:", error);
            alert(`Failed to harvest crop: ${error.message}`);
        }
    }
}

// Initialize the game
const game = new CropFarmingGame();

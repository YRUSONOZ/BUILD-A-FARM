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
        this.contractAddress = '0x057048fa519b97a552f11297511c0A3f71d0d4e8';
        this.contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"farmer","type":"address"},{"indexed":false,"internalType":"string","name":"cropType","type":"string"}],"name":"CropPlanted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"farmer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"CropsHarvested","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"enum CryptoFarming.Weather","name":"newWeather","type":"uint8"}],"name":"WeatherChanged","type":"event"},{"inputs":[],"name":"BASE_MATURITY_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WEATHER_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentWeather","outputs":[{"internalType":"enum CryptoFarming.Weather","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"farms","outputs":[{"internalType":"uint256","name":"lastHarvestTime","type":"uint256"},{"internalType":"uint256","name":"tokenBalance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentWeather","outputs":[{"internalType":"enum CryptoFarming.Weather","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_farmer","type":"address"}],"name":"getFarmStatus","outputs":[{"components":[{"internalType":"string","name":"cropType","type":"string"},{"internalType":"uint256","name":"plantTime","type":"uint256"},{"internalType":"uint256","name":"maturityTime","type":"uint256"}],"internalType":"struct CryptoFarming.Crop[]","name":"","type":"tuple[]"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_farmer","type":"address"}],"name":"getTokenBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"harvestCrops","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"harvestSingleCrop","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"lastWeatherChange","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_cropType","type":"string"}],"name":"plantCrop","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"updateWeather","outputs":[],"stateMutability":"nonpayable","type":"function"}];
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
        this.cropUpdateInterval = null;
        this.initializeMarketPrices();
        this.initializeUI();
        this.startMarketFluctuations();
    }

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

    initializeMarketPrices() {
        this.cropTypes.forEach(crop => {
            this.marketPrices[crop.name] = {
                currentPrice: crop.baseReward,
                trend: Math.random() > 0.5 ? 'up' : 'down'
            };
        });
    }

    startMarketFluctuations() {
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
        }
    }

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
        console.log("Crop types updated:", this.cropTypes);
    }

    async connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                console.log("Requesting account access...");
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log("Accounts received:", accounts);

                this.web3 = new Web3(window.ethereum);
                this.accounts = accounts;

                console.log("Checking network...");
                const networkId = await this.web3.eth.net.getId();
                console.log("Network ID:", networkId);

                // Sepolia testnet network ID
                const sepoliaTestnetId = 11155111; 
                if (networkId !== sepoliaTestnetId) {
                    alert('Please connect to the Sepolia testnet in MetaMask');
                    return;
                }

                console.log("Initializing contract...");
                console.log("Contract Address:", this.contractAddress);

                try {
                    this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
                    console.log("Contract initialized successfully");
                    console.log("Contract methods:", Object.keys(this.contract.methods));
                } catch (contractError) {
                    console.error("Error initializing contract:", contractError);
                    alert("Failed to initialize contract. Please check the console for more details.");
                    return;
                }

                this.playerID = this.accounts[0];

                console.log("Updating UI...");
                this.updateWalletUI();
                console.log("Connected to Sepolia testnet");

                this.updateFarmStatus();
                this.updateWeather();

                // Set up intervals for automatic updates
                this.farmStatusInterval = setInterval(() => this.updateFarmStatus(), 30000); // Update every 30 seconds
                this.weatherInterval = setInterval(() => this.updateWeather(), this.weatherCheckInterval * 1000);
            } catch (error) {
                console.error("Detailed error:", error);
                alert("Failed to connect wallet. Please check the console for more details and try again.");
            }
        } else {
            console.error("Ethereum wallet not found");
            alert("Please install MetaMask to use this dApp!");
        }
    }

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
        if (this.cropUpdateInterval) {
            clearInterval(this.cropUpdateInterval);
        }
        alert('Wallet disconnected successfully.');
    }

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

    async updateWeather() {
        // Generate random weather
        this.currentWeather = Math.floor(Math.random() * 4);
        this.updateWeatherUI();
    }

    updateWeatherUI() {
        const weatherContainer = document.getElementById('weather-container');
        weatherContainer.innerHTML = `
            <h3>Current Weather: ${this.weatherIcons[this.currentWeather]}</h3>
            <p>Effect: ${this.weatherEffects[this.currentWeather]}</p>
        `;
    }

    async plantCrop() {
        if (!this.contract || !this.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        const cropType = document.getElementById('crop-select').value;
        try {
            console.log("Attempting to plant crop:", cropType);

            const result = await this.contract.methods.plantCrop(cropType).send({ from: this.accounts[0] });
            console.log("Transaction result:", result);

            if (result.status) {
                console.log(`${cropType} planted successfully!`);
                const currentValue = this.marketPrices[cropType].currentPrice;
                alert(`${cropType} planted successfully! Transaction hash: ${result.transactionHash}`);
                await this.updateFarmStatus();
            } else {
                console.error("Transaction failed");
                alert("Failed to plant crop. Please try again.");
            }
        } catch (error) {
            console.error("Error planting crop:", error);
            alert(`Failed to plant crop: ${error.message}`);
        }
    }

    async harvestCrops() {
        if (!this.contract || !this.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            console.log("Harvesting all crops...");
            const result = await this.contract.methods.harvestCrops().send({ from: this.accounts[0] });
            console.log("Harvest transaction result:", result);

            if (result.status) {
                console.log("All crops harvested successfully!");
                alert("All crops harvested successfully!");
                await this.updateFarmStatus();
            } else {
                console.error("Harvest transaction failed");
                alert("Failed to harvest crops. Please try again.");
            }
        } catch (error) {
            console.error("Error harvesting crops:", error);
            alert(`Failed to harvest crops: ${error.message}`);
        }
    }

    async harvestSingleCrop(index) {
        if (!this.contract || !this.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            console.log(`Harvesting crop at index ${index}...`);
            const result = await this.contract.methods.harvestSingleCrop(index).send({ from: this.accounts[0] });
            console.log("Harvest transaction result:", result);

            if (result.status) {
                console.log("Crop harvested successfully!");
                alert("Crop harvested successfully!");
                await this.updateFarmStatus();
            } else {
                console.error("Harvest transaction failed");
                alert("Failed to harvest crop. Please try again.");
            }
        } catch (error) {
            console.error("Error harvesting crop:", error);
            alert(`Failed to harvest crop: ${error.message}`);
        }
    }

    async updateFarmStatus() {
        if (this.contract && this.accounts) {
            try {
                console.log("Updating farm status...");
                const farmStatus = await this.contract.methods.getFarmStatus(this.accounts[0]).call();
                console.log("Raw farm status:", JSON.stringify(farmStatus, null, 2));

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

                console.log("Parsed farm status:", { crops, balance });
                console.log("Number of crops:", crops.length);
                crops.forEach((crop, index) => {
                    console.log(`Crop ${index}:`, JSON.stringify(crop, null, 2));
                });

                this.crops = crops;
                this.balance = balance;
                this.updateWalletUI();

                this.updateCropList();

                // Clear existing interval and start a new one
                if (this.cropUpdateInterval) {
                    clearInterval(this.cropUpdateInterval);
                }
                this.cropUpdateInterval = setInterval(() => this.updateCropList(), 1000);

                console.log("Farm status updated in UI");
            } catch (error) {
                console.error("Failed to update farm status:", error);
            }
        } else {
            console.log("Wallet not connected, skipping farm status update");
        }
    }

    updateCropList() {
        const cropList = document.getElementById('crop-list');
        cropList.innerHTML = '';
        if (this.crops.length === 0) {
            console.log("No crops found.");
            cropList.innerHTML = '<li>No crops planted yet.</li>';
        } else {
            this.crops.forEach((crop, index) => {
                const li = document.createElement('li');
                const currentTime = Math.floor(Date.now() / 1000);
                const timeToMaturity = Math.max(0, parseInt(crop.maturityTime) - currentTime);
                console.log(`Current time: ${currentTime}, Maturity time: ${crop.maturityTime}, Time to maturity: ${timeToMaturity}`);

                const currentValue = this.marketPrices[crop.cropType].currentPrice;

                if (timeToMaturity > 0) {
                    li.innerHTML = `
                        <span><span class="crop-icon">${this.cropIcons[crop.cropType]}</span>${crop.cropType}</span>
                        <span>Matures in ${this.formatTime(timeToMaturity)}</span>
                    `;
                } else {
                    li.innerHTML = `
                        <span><span class="crop-icon">${this.cropIcons[crop.cropType]}</span>${crop.cropType}</span>
                        <button class="harvest-single-btn" data-index="${index}">Harvest (Current Value: ${currentValue.toFixed(2)} tokens)</button>
                    `;
                    li.style.backgroundColor = '#c8e6c9';
                }
                cropList.appendChild(li);
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

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    async checkFarmStatus() {
        if (!this.contract || !this.accounts) {
            console.log("Wallet not connected");
            return;
        }
        try {
            const farmData = await this.contract.methods.farms(this.accounts[0]).call();
            console.log("Raw farm data:", farmData);
            const tokenBalance = await this.contract.methods.getTokenBalance(this.accounts[0]).call();
            console.log("Token balance:", tokenBalance);
            const maturityDuration = await this.contract.methods.BASE_MATURITY_DURATION().call();
            console.log("Maturity duration:", maturityDuration);
        } catch (error) {
            console.error("Error checking farm status:", error);
        }
    }

    async checkTransactionStatus(txHash) {
        if (!this.web3) {
            console.error("Web3 not initialized");
            return;
        }
        try {
            const tx = await this.web3.eth.getTransaction(txHash);
            console.log("Transaction details:", tx);
            if (tx && tx.blockNumber) {
                const receipt = await this.web3.eth.getTransactionReceipt(txHash);
                console.log("Transaction receipt:", receipt);
                alert(`Transaction mined in block ${tx.blockNumber}. Status: ${receipt.status ? 'Success' : 'Failed'}`);
            } else {
                alert("Transaction is pending or not found on the network.");
            }
        } catch (error) {
            console.error("Error checking transaction status:", error);
            alert("Failed to check transaction status: " + error.message);
        }
    }
}

// Initialize the game
const game = new CropFarmingGame();

// Start market fluctuations
game.startMarketFluctuations();

export class PlotSystem {
    constructor(game) {
        this.game = game;
        this.plots = [];
        
        // Basic plot configuration
        this.plotConfig = {
            baseCost: 100,          // Cost in HARV tokens
            maxCrops: 4,            // Maximum crops per plot
            baseGrowthTime: {
                Bitcoin: 300,       // 5 minutes
                Ethereum: 180,      // 3 minutes
                Dogecoin: 60        // 1 minute
            },
            baseRewards: {
                Bitcoin: 50,
                Ethereum: 30,
                Dogecoin: 10
            }
        };
    }

    async initializePlots() {
        if (!this.game.contract || !this.game.accounts) {
            console.log("Wallet not connected");
            return;
        }

        try {
            // Fetch user's plots from the contract
            const farmStatus = await this.game.contract.methods.getFarmStatus(this.game.accounts[0]).call();
            this.plots = this.parsePlots(farmStatus);
            this.updatePlotsUI();
        } catch (error) {
            console.error("Error initializing plots:", error);
        }
    }

    async purchasePlot() {
        if (!this.game.contract || !this.game.accounts) {
            alert("Please connect your wallet first!");
            return;
        }

        try {
            // Purchase plot using HARV tokens
            const result = await this.game.contract.methods.purchasePlot().send({
                from: this.game.accounts[0]
            });

            if (result.status) {
                console.log("Plot purchased successfully!");
                await this.initializePlots();
                return true;
            }
        } catch (error) {
            console.error("Error purchasing plot:", error);
            alert(`Failed to purchase plot: ${error.message}`);
            return false;
        }
    }

    async plantCrop(plotId, cropType) {
        if (!this.game.contract || !this.game.accounts) {
            alert("Please connect your wallet first!");
            return;
        }

        try {
            const growthSpeedMultiplier = this.game.upgradeSystem.getGrowthSpeedMultiplier();
            const result = await this.game.contract.methods.plantCrop(
                cropType,
                growthSpeedMultiplier
            ).send({ from: this.game.accounts[0] });

            if (result.status) {
                console.log(`${cropType} planted successfully!`);
                await this.initializePlots();
                return true;
            }
        } catch (error) {
            console.error("Error planting crop:", error);
            alert(`Failed to plant crop: ${error.message}`);
            return false;
        }
    }

    async harvestPlot(plotId) {
        if (!this.game.contract || !this.game.accounts) {
            alert("Please connect your wallet first!");
            return;
        }

        try {
            const yieldBoostMultiplier = this.game.upgradeSystem.getYieldBoostMultiplier();
            const result = await this.game.contract.methods.harvestCrops(
                yieldBoostMultiplier
            ).send({ from: this.game.accounts[0] });

            if (result.status) {
                console.log("Crops harvested successfully!");
                await this.initializePlots();
                return true;
            }
        } catch (error) {
            console.error("Error harvesting crops:", error);
            alert(`Failed to harvest crops: ${error.message}`);
            return false;
        }
    }

    parsePlots(farmStatus) {
        // Convert farm status into plot data
        const plots = [];
        const crops = farmStatus[0];
        const balance = farmStatus[1];

        // Group crops into plots based on maximum crops per plot
        for (let i = 0; i < crops.length; i += this.plotConfig.maxCrops) {
            const plotCrops = crops.slice(i, i + this.plotConfig.maxCrops);
            plots.push({
                id: Math.floor(i / this.plotConfig.maxCrops),
                crops: plotCrops.map(crop => ({
                    type: crop.cropType,
                    plantTime: parseInt(crop.plantTime),
                    maturityTime: parseInt(crop.maturityTime),
                    baseReward: parseInt(crop.baseReward)
                }))
            });
        }

        return plots;
    }

    updatePlotsUI() {
        const plotsContainer = document.getElementById('plots-container');
        if (!plotsContainer) {
            console.error("Plots container not found");
            return;
        }

        plotsContainer.innerHTML = '';
        
        // Create plot elements
        this.plots.forEach((plot, index) => {
            const plotElement = this.createPlotElement(plot);
            plotsContainer.appendChild(plotElement);
        });

        // Add "New Plot" button if player can afford it
        if (this.game.balance >= this.plotConfig.baseCost) {
            const newPlotButton = document.createElement('div');
            newPlotButton.className = 'new-plot-button';
            newPlotButton.innerHTML = `
                <button onclick="game.plotSystem.purchasePlot()">
                    Purchase New Plot (${this.plotConfig.baseCost} HARV)
                </button>
            `;
            plotsContainer.appendChild(newPlotButton);
        }
    }

    createPlotElement(plot) {
        const plotDiv = document.createElement('div');
        plotDiv.className = 'plot';
        
        // Calculate available slots
        const availableSlots = this.plotConfig.maxCrops - plot.crops.length;
        
        plotDiv.innerHTML = `
            <div class="plot-header">
                <h3>Plot ${plot.id + 1}</h3>
                <span>${plot.crops.length}/${this.plotConfig.maxCrops} Crops</span>
            </div>
            <div class="crops-container">
                ${this.renderCrops(plot.crops)}
            </div>
            <div class="plot-actions">
                ${availableSlots > 0 ? `
                    <select id="crop-select-${plot.id}">
                        <option value="Bitcoin">Bitcoin</option>
                        <option value="Ethereum">Ethereum</option>
                        <option value="Dogecoin">Dogecoin</option>
                    </select>
                    <button onclick="game.plotSystem.plantCrop(${plot.id}, document.getElementById('crop-select-${plot.id}').value)">
                        Plant
                    </button>
                ` : ''}
                ${plot.crops.some(crop => Date.now() / 1000 >= crop.maturityTime) ? `
                    <button onclick="game.plotSystem.harvestPlot(${plot.id})">
                        Harvest Ready Crops
                    </button>
                ` : ''}
            </div>
        `;

        return plotDiv;
    }

    renderCrops(crops) {
        return crops.map(crop => {
            const currentTime = Math.floor(Date.now() / 1000);
            const isReady = currentTime >= crop.maturityTime;
            const timeRemaining = isReady ? 0 : crop.maturityTime - currentTime;

            return `
                <div class="crop ${isReady ? 'ready' : ''}">
                    <span class="crop-icon">${this.game.cropIcons[crop.type]}</span>
                    <span class="crop-status">
                        ${isReady ? 'Ready to harvest!' : `Ready in ${this.game.formatTime(timeRemaining)}`}
                    </span>
                    <span class="crop-reward">
                        Reward: ${crop.baseReward} HARV
                    </span>
                </div>
            `;
        }).join('');
    }

    // Update crops every second
    startCropUpdates() {
        setInterval(() => {
            if (this.plots.length > 0) {
                this.updatePlotsUI();
            }
        }, 1000);
    }
}

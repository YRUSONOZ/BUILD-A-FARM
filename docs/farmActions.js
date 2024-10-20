export class FarmActions {
    constructor(game) {
        this.game = game;
    }

    async plantCrop() {
        console.log("Attempting to plant crop");
        if (!this.game.contract || !this.game.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        const cropType = document.getElementById('crop-select').value;
        try {
            const growthSpeedMultiplier = this.game.upgradeSystem.getGrowthSpeedMultiplier();
            console.log("Growth Speed Multiplier:", growthSpeedMultiplier);
            
            const result = await this.game.contract.methods.plantCrop(cropType, growthSpeedMultiplier).send({ from: this.game.accounts[0] });
            
            if (result.status) {
                console.log(`${cropType} planted successfully!`);
                alert(`${cropType} planted successfully! Transaction hash: ${result.transactionHash}`);
                await this.game.updateFarmStatus();
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
        if (!this.game.contract || !this.game.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const yieldBoostMultiplier = this.game.upgradeSystem.getYieldBoostMultiplier();
            const result = await this.game.contract.methods.harvestCrops(yieldBoostMultiplier).send({ from: this.game.accounts[0] });
            
            if (result.status) {
                console.log("All crops harvested successfully!");
                alert("All crops harvested successfully!");
                await this.game.updateFarmStatus();
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
        if (!this.game.contract || !this.game.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const yieldBoostMultiplier = this.game.upgradeSystem.getYieldBoostMultiplier();
            const result = await this.game.contract.methods.harvestSingleCrop(index, yieldBoostMultiplier).send({ from: this.game.accounts[0] });
            
            if (result.status) {
                console.log("Crop harvested successfully!");
                alert("Crop harvested successfully!");
                await this.game.updateFarmStatus();
            } else {
                console.error("Failed to harvest crop");
                alert("Failed to harvest crop. Please try again.");
            }
        } catch (error) {
            console.error("Error harvesting crop:", error);
            alert(`Failed to harvest crop: ${error.message}`);
        }
    }

    async updateCropList() {
        console.log("Updating crop list");
        const cropList = document.getElementById('crop-list');
        if (!cropList) {
            console.error("Crop list element not found");
            return;
        }

        // Clear existing content
        cropList.innerHTML = '';

        const stakedTokens = [];

        // Add staked tokens to the list
        if (this.game.contract && this.game.accounts) {
            try {
                const stakedHarvest = await this.game.contract.methods.stakes(this.game.accounts[0], this.game.harvestTokenAddress).call();
                const stakedUSDC = await this.game.contract.methods.stakes(this.game.accounts[0], this.game.usdcTokenAddress).call();

                if (parseInt(stakedHarvest.amount) > 0) {
                    const harvestRewards = await this.game.contract.methods.getClaimableRewards(this.game.accounts[0], this.game.harvestTokenAddress).call();
                    stakedTokens.push({name: 'Harvest Token', amount: stakedHarvest.amount, address: this.game.harvestTokenAddress, rewards: harvestRewards});
                }

                if (parseInt(stakedUSDC.amount) > 0) {
                    const usdcRewards = await this.game.contract.methods.getClaimableRewards(this.game.accounts[0], this.game.usdcTokenAddress).call();
                    stakedTokens.push({name: 'USDC', amount: stakedUSDC.amount, address: this.game.usdcTokenAddress, rewards: usdcRewards});
                }
            } catch (error) {
                console.error("Error fetching staked amounts and rewards:", error);
            }
        }

        // Add staked tokens to the list
        for (const token of stakedTokens) {
            this.game.addStakedTokenToList(cropList, token.name, token.amount, token.address, token.rewards);
        }

        if (this.game.crops.length === 0 && stakedTokens.length === 0) {
            cropList.innerHTML = '<li>No crops planted or tokens staked yet.</li>';
        } else {
            for (let index = 0; index < this.game.crops.length; index++) {
                const crop = this.game.crops[index];
                const li = document.createElement('li');
                const currentTime = Math.floor(Date.now() / 1000);
                const timeToMaturity = Math.max(0, parseInt(crop.maturityTime) - currentTime);

                let estimatedReward;
                try {
                    estimatedReward = await this.game.getEstimatedReward(crop.cropType, crop.baseReward);
                    console.log(`Estimated reward for ${crop.cropType}: ${estimatedReward}`);
                } catch (error) {
                    console.error(`Error calculating estimated reward for ${crop.cropType}:`, error);
                    estimatedReward = "N/A";
                }

                if (timeToMaturity > 0) {
                    li.innerHTML = `
                        <span><span class="crop-icon">${this.game.cropIcons[crop.cropType]}</span>${crop.cropType}</span>
                        <span>Matures in ${this.game.formatTime(timeToMaturity)}</span>
                        <span>Estimated Value: ${this.game.formatTokenAmount(estimatedReward)} tokens</span>
                    `;
                } else {
                    li.innerHTML = `
                        <span><span class="crop-icon">${this.game.cropIcons[crop.cropType]}</span>${crop.cropType}</span>
                        <button class="harvest-single-btn" data-index="${index}">Harvest (Estimated Value: ${this.game.formatTokenAmount(estimatedReward)} tokens)</button>
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
}

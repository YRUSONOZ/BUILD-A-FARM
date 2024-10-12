class UpgradeSystem {
    constructor(game) {
        this.game = game;
        this.upgrades = {
            growthSpeed: {
                name: "Growth Accelerator",
                levels: [
                    { cost: 100, effect: 100 },  // 1.00x speed
                    { cost: 250, effect: 90 },   // 0.90x speed (10% faster)
                    { cost: 500, effect: 80 },   // 0.80x speed (20% faster)
                    { cost: 1000, effect: 70 },  // 0.70x speed (30% faster)
                    { cost: 2000, effect: 60 }   // 0.60x speed (40% faster)
                ],
                description: "Reduces crop growth time",
                currentLevel: 0
            },
            yieldBoost: {
                name: "Yield Enhancer",
                levels: [
                    { cost: 100, effect: 100 },  // 1.00x yield
                    { cost: 250, effect: 110 },  // 1.10x yield (10% more)
                    { cost: 500, effect: 120 },  // 1.20x yield (20% more)
                    { cost: 1000, effect: 130 }, // 1.30x yield (30% more)
                    { cost: 2000, effect: 140 }  // 1.40x yield (40% more)
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

    async purchaseUpgrade(upgradeKey) {
        const upgrade = this.upgrades[upgradeKey];
        const nextLevel = upgrade.currentLevel + 1;

        if (nextLevel >= upgrade.levels.length) {
            alert("Max level reached for this upgrade!");
            return;
        }

        const cost = upgrade.levels[nextLevel].cost;

        // Fetch the latest balance from the contract
        const latestBalance = await this.game.contract.methods.getTokenBalance(this.game.accounts[0]).call();
        this.game.balance = parseInt(latestBalance);

        if (this.game.balance < cost) {
            alert("Not enough tokens to purchase this upgrade!");
            return;
        }

        try {
            // Call the contract method to purchase the upgrade
            const result = await this.game.contract.methods.purchaseUpgrade(upgradeKey, nextLevel).send({ from: this.game.accounts[0] });
            
            if (result.status) {
                upgrade.currentLevel = nextLevel;
                this.updateUpgradeUI(upgradeKey);
                await this.game.updateFarmStatus();
                alert(`${upgrade.name} upgraded to level ${nextLevel}!`);
            } else {
                alert("Failed to purchase upgrade. Please try again.");
            }
        } catch (error) {
            console.error("Error purchasing upgrade:", error);
            alert(`Failed to purchase upgrade: ${error.message}`);
        }
    }

    updateUpgradeUI(upgradeKey) {
        const upgrade = this.upgrades[upgradeKey];
        document.getElementById(`${upgradeKey}-level`).textContent = upgrade.currentLevel;
        
        const nextLevel = upgrade.currentLevel + 1;
        if (nextLevel < upgrade.levels.length) {
            document.getElementById(`${upgradeKey}-cost`).textContent = upgrade.levels[nextLevel].cost;
        } else {
            document.getElementById(`${upgradeKey}-cost`).textContent = "MAX";
            document.getElementById(`${upgradeKey}-upgrade-btn`).disabled = true;
        }
    }

    getGrowthSpeedMultiplier() {
        return this.upgrades.growthSpeed.levels[this.upgrades.growthSpeed.currentLevel].effect;
    }

    getYieldBoostMultiplier() {
        return this.upgrades.yieldBoost.levels[this.upgrades.yieldBoost.currentLevel].effect;
    }
}

export default UpgradeSystem;

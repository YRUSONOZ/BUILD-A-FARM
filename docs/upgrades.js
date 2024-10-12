class UpgradeSystem {
    constructor(game) {
        this.game = game;
        this.upgrades = {
            growthSpeed: {
                name: "Growth Accelerator",
                levels: [
                    { cost: 100, effect: 0.9 },
                    { cost: 250, effect: 0.8 },
                    { cost: 500, effect: 0.7 },
                    { cost: 1000, effect: 0.6 },
                    { cost: 2000, effect: 0.5 }
                ],
                description: "Reduces crop growth time",
                currentLevel: 0
            },
            yieldBoost: {
                name: "Yield Enhancer",
                levels: [
                    { cost: 100, effect: 1.1 },
                    { cost: 250, effect: 1.2 },
                    { cost: 500, effect: 1.3 },
                    { cost: 1000, effect: 1.4 },
                    { cost: 2000, effect: 1.5 }
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
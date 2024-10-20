export class TokenActions {
    constructor(game) {
        this.game = game;
    }

    async updateTokenBalances() {
        if (!this.game.web3 || !this.game.accounts) {
            console.log("Web3 or accounts not available");
            return;
        }

        try {
            const harvestTokenContract = new this.game.web3.eth.Contract(this.game.erc20ABI, this.game.harvestTokenAddress);
            const usdcTokenContract = new this.game.web3.eth.Contract(this.game.erc20ABI, this.game.usdcTokenAddress);

            const harvestBalance = await harvestTokenContract.methods.balanceOf(this.game.accounts[0]).call();
            const usdcBalance = await usdcTokenContract.methods.balanceOf(this.game.accounts[0]).call();

            this.game.tokenBalances.harvest = this.game.web3.utils.fromWei(harvestBalance, 'ether');
            this.game.tokenBalances.usdc = this.game.web3.utils.fromWei(usdcBalance, 'mwei'); // USDC has 6 decimals

            console.log("Token balances updated:", this.game.tokenBalances);
            console.log("Harvest balance:", this.game.tokenBalances.harvest);
            console.log("USDC balance:", this.game.tokenBalances.usdc);

            this.updateSelectedTokenBalance();
        } catch (error) {
            console.error("Error updating token balances:", error);
        }
    }

    updateSelectedTokenBalance() {
        console.log("Updating selected token balance");
        const tokenSelect = document.getElementById('token-select');
        const balanceElement = document.getElementById('wallet-token-balance');
        const stakedBalanceElement = document.getElementById('staked-token-balance');
        const apyElement = document.getElementById('token-staking-apy');

        if (!tokenSelect || !balanceElement) {
            console.error("Token select or balance element not found");
            return;
        }

        const selectedToken = tokenSelect.value;
        console.log("Selected token:", selectedToken);

        balanceElement.textContent = this.game.formatTokenAmount(this.game.tokenBalances[selectedToken]);

        if (this.game.contract && this.game.accounts) {
            const tokenAddress = selectedToken === 'usdc' ? this.game.usdcTokenAddress : this.game.harvestTokenAddress;
            this.game.contract.methods.stakes(this.game.accounts[0], tokenAddress).call()
                .then(stake => {
                    const stakedAmount = this.game.web3.utils.fromWei(stake.amount, selectedToken === 'usdc' ? 'mwei' : 'ether');
                    if (stakedBalanceElement) {
                        stakedBalanceElement.textContent = this.game.formatTokenAmount(stakedAmount);
                    }
                    return this.game.getStakingAPY(tokenAddress);
                })
                .then(apy => {
                    if (apyElement) {
                        apyElement.textContent = `${apy}%`;
                    }
                })
                .catch(error => {
                    console.error("Error updating staked balance and APY:", error);
                });
        }
    }

    async stakeTokens(tokenType, amount) {
        console.log(`Attempting to stake ${tokenType} tokens`);
        if (!this.game.contract || !this.game.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const tokenAddress = tokenType === 'usdc' ? this.game.usdcTokenAddress : this.game.harvestTokenAddress;
            const decimals = tokenType === 'usdc' ? 6 : 18;
            const amountInSmallestUnit = this.game.web3.utils.toWei(amount.toString(), tokenType === 'usdc' ? 'mwei' : 'ether');
            const tokenContract = new this.game.web3.eth.Contract(this.game.erc20ABI, tokenAddress);
            
            console.log("Approving token transfer...");
            const approvalResult = await tokenContract.methods.approve(this.game.contractAddress, amountInSmallestUnit).send({ from: this.game.accounts[0] });
            console.log("Approval result:", approvalResult);

            if (approvalResult.status) {
                console.log("Approval successful, now staking...");
                const result = await this.game.contract.methods.stake(tokenAddress, amountInSmallestUnit).send({ from: this.game.accounts[0] });
                
                if (result.status) {
                    console.log(`${amount} ${tokenType.toUpperCase()} tokens staked successfully!`);
                    alert(`${amount} ${tokenType.toUpperCase()} tokens staked successfully! Transaction hash: ${result.transactionHash}`);
                    await this.game.updateFarmStatus();
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
        if (!this.game.contract || !this.game.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const result = await this.game.contract.methods.unstake(tokenAddress, amount).send({ from: this.game.accounts[0] });
            
            if (result.status) {
                const tokenType = tokenAddress === this.game.usdcTokenAddress ? 'USDC' : 'Harvest Token';
                const unstakedAmount = this.game.web3.utils.fromWei(amount, tokenType === 'USDC' ? 'mwei' : 'ether');
                console.log(`${unstakedAmount} ${tokenType} unstaked successfully!`);
                alert(`${unstakedAmount} ${tokenType} unstaked successfully! Transaction hash: ${result.transactionHash}`);
                await this.game.updateFarmStatus();
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
        if (!this.game.contract || !this.game.accounts) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const result = await this.game.contract.methods.claimRewards(tokenAddress).send({ from: this.game.accounts[0] });
            
            if (result.status) {
                console.log("Rewards claimed successfully!");
                alert("Rewards claimed successfully!");
                await this.game.updateFarmStatus();
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
}

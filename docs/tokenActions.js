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

        // Update wallet balance
        balanceElement.textContent = this.game.formatTokenAmount(this.game.tokenBalances[selectedToken]);

        // Set default values for staking info
        if (stakedBalanceElement) {
            stakedBalanceElement.textContent = '0';
        }
        if (apyElement) {
            apyElement.textContent = 'N/A';
        }

        // Skip staking checks if contract isn't properly initialized
        if (!this.game.contract || !this.game.accounts) {
            return;
        }

        try {
            // Only try to get staking info if the contract has the stakes method
            if (this.game.contract.methods.stakes) {
                const tokenAddress = selectedToken === 'usdc' ? this.game.usdcTokenAddress : this.game.harvestTokenAddress;
                this.game.contract.methods.stakes(this.game.accounts[0], tokenAddress).call()
                    .then(stake => {
                        if (stake && stakedBalanceElement) {
                            const stakedAmount = this.game.web3.utils.fromWei(stake.amount, selectedToken === 'usdc' ? 'mwei' : 'ether');
                            stakedBalanceElement.textContent = this.game.formatTokenAmount(stakedAmount);
                        }
                        return this.getStakingAPY(tokenAddress);
                    })
                    .then(apy => {
                        if (apyElement) {
                            apyElement.textContent = `${apy}%`;
                        }
                    })
                    .catch(error => {
                        console.log("Staking info not available:", error);
                    });
            }
        } catch (error) {
            console.log("Error checking staking info:", error);
        }
    }

    async stakeTokens(tokenType, amount) {
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
            const approvalResult = await tokenContract.methods.approve(this.game.contractAddress, amountInSmallestUnit).send({ 
                from: this.game.accounts[0] 
            });

            if (approvalResult.status) {
                console.log("Approval successful, now staking...");
                if (this.game.contract.methods.stake) {
                    const result = await this.game.contract.methods.stake(tokenAddress, amountInSmallestUnit).send({ 
                        from: this.game.accounts[0] 
                    });
                    
                    if (result.status) {
                        console.log(`${amount} ${tokenType.toUpperCase()} tokens staked successfully!`);
                        alert(`${amount} ${tokenType.toUpperCase()} tokens staked successfully!`);
                        await this.updateTokenBalances();
                    }
                } else {
                    console.error("Staking method not available");
                    alert("Staking feature is currently not available");
                }
            }
        } catch (error) {
            console.error(`Error staking ${tokenType.toUpperCase()} tokens:`, error);
            alert(`Failed to stake ${tokenType.toUpperCase()} tokens: ${error.message}`);
        }
    }

    async unstakeTokens(tokenAddress, amount) {
        if (!this.game.contract || !this.game.accounts) {
            alert("Please connect your wallet first!");
            return;
        }

        try {
            if (this.game.contract.methods.unstake) {
                const result = await this.game.contract.methods.unstake(tokenAddress, amount).send({ 
                    from: this.game.accounts[0] 
                });
                
                if (result.status) {
                    const tokenType = tokenAddress === this.game.usdcTokenAddress ? 'USDC' : 'HARVEST';
                    const unstakedAmount = this.game.web3.utils.fromWei(amount, tokenType === 'USDC' ? 'mwei' : 'ether');
                    console.log(`${unstakedAmount} ${tokenType} unstaked successfully!`);
                    alert(`${unstakedAmount} ${tokenType} unstaked successfully!`);
                    await this.updateTokenBalances();
                }
            } else {
                console.error("Unstaking method not available");
                alert("Unstaking feature is currently not available");
            }
        } catch (error) {
            console.error("Error unstaking tokens:", error);
            alert(`Failed to unstake tokens: ${error.message}`);
        }
    }

    async claimRewards(tokenAddress) {
        if (!this.game.contract || !this.game.accounts) {
            alert("Please connect your wallet first!");
            return;
        }

        try {
            if (this.game.contract.methods.claimRewards) {
                const result = await this.game.contract.methods.claimRewards(tokenAddress).send({ 
                    from: this.game.accounts[0] 
                });
                
                if (result.status) {
                    console.log("Rewards claimed successfully!");
                    alert("Rewards claimed successfully!");
                    await this.updateTokenBalances();
                }
            } else {
                console.error("Claim rewards method not available");
                alert("Rewards claiming feature is currently not available");
            }
        } catch (error) {
            console.error("Error claiming rewards:", error);
            alert(`Failed to claim rewards: ${error.message}`);
        }
    }

    async getStakingAPY(tokenAddress) {
        if (!this.game.contract || !this.game.accounts) return "N/A";
        try {
            if (this.game.contract.methods.rewardRate) {
                const rewardRate = await this.game.contract.methods.rewardRate().call();
                const apy = (Number(rewardRate) * 365 * 100) / 10000; // Assuming rewardRate is daily and uses REWARD_RATE_PRECISION
                return apy.toFixed(2);
            }
            return "N/A";
        } catch (error) {
            console.log("Error fetching staking APY:", error);
            return "N/A";
        }
    }
}

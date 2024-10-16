// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CryptoFarming is ReentrancyGuard, Ownable {
    enum Weather { Sunny, Rainy, Drought, CryptoWinter }

    struct Crop {
        uint8 cropType;
        uint40 plantTime;
        uint40 maturityTime;
        uint168 baseReward;
    }

    struct Farm {
        Crop[] crops;
        uint40 lastHarvestTime;
        uint216 harvestTokenBalance;
    }

    struct StakeInfo {
        uint248 amount;
        uint40 lastRewardTime;
    }

    mapping(address => Farm) public farms;
    mapping(uint8 => uint256) public cropBaseRewards;
    mapping(uint8 => uint256) public marketPrices;
    mapping(address => mapping(address => StakeInfo)) public stakes;
    
    uint256 public constant BASE_MATURITY_DURATION = 1 minutes;
    uint256 public constant WEATHER_DURATION = 5 minutes;
    uint256 public constant SCALING_FACTOR = 1e15;
    uint256 public constant STAKING_FEE = 100; // 1%
    uint256 public constant REWARD_RATE = 10; // 0.1% per day

    Weather public currentWeather;
    uint40 public lastWeatherChange;
    address public constant TREASURY = 0x4abAB0dC4bf60Bd41601715035bFFcC898b4E2aa;

    IERC20 public immutable harvestToken;
    IERC20 public immutable bitcoinToken;
    IERC20 public immutable ethereumToken;
    IERC20 public immutable usdcToken;

    event CropPlanted(address indexed farmer, uint8 cropType);
    event CropsHarvested(address indexed farmer, uint256 amount);
    event WeatherChanged(Weather newWeather);
    event MarketPriceUpdated(uint8 cropType, uint256 newPrice);
    event Staked(address indexed user, address indexed token, uint256 amount);
    event Unstaked(address indexed user, address indexed token, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(
        address _harvestToken,
        address _bitcoinToken,
        address _ethereumToken,
        address _usdcToken
    ) Ownable(msg.sender) {
        require(_harvestToken != address(0) && _bitcoinToken != address(0) && 
                _ethereumToken != address(0) && _usdcToken != address(0), "Invalid token address");

        currentWeather = Weather.Sunny;
        lastWeatherChange = uint40(block.timestamp);
        
        harvestToken = IERC20(_harvestToken);
        bitcoinToken = IERC20(_bitcoinToken);
        ethereumToken = IERC20(_ethereumToken);
        usdcToken = IERC20(_usdcToken);

        cropBaseRewards[0] = 50; // Bitcoin
        cropBaseRewards[1] = 30; // Ethereum
        cropBaseRewards[2] = 10; // Dogecoin

        marketPrices[0] = 50000; // Bitcoin
        marketPrices[1] = 3000;  // Ethereum
        marketPrices[2] = 1;     // Dogecoin
    }

    function stake(address token, uint256 amount) external nonReentrant {
        require(token == address(harvestToken) || token == address(bitcoinToken) || 
                token == address(ethereumToken) || token == address(usdcToken), "Invalid token");

        uint256 fee = token != address(harvestToken) ? (amount * STAKING_FEE) / 10000 : 0;
        if (fee > 0) IERC20(token).transferFrom(msg.sender, TREASURY, fee);

        IERC20(token).transferFrom(msg.sender, address(this), amount - fee);

        StakeInfo storage stakeInfo = stakes[msg.sender][token];
        if (stakeInfo.amount > 0) {
            farms[msg.sender].harvestTokenBalance += uint216(calculateReward(msg.sender, token));
        }
        stakeInfo.lastRewardTime = uint40(block.timestamp);
        stakeInfo.amount += uint248(amount - fee);

        emit Staked(msg.sender, token, amount - fee);
    }

    function unstake(address token, uint256 amount) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender][token];
        require(stakeInfo.amount >= amount, "Insufficient staked amount");

        uint256 reward = calculateReward(msg.sender, token);
        stakeInfo.amount -= uint248(amount);
        stakeInfo.lastRewardTime = uint40(block.timestamp);

        IERC20(token).transfer(msg.sender, amount);
        farms[msg.sender].harvestTokenBalance += uint216(reward);

        emit Unstaked(msg.sender, token, amount);
        emit RewardClaimed(msg.sender, reward);
    }

    function calculateReward(address user, address token) public view returns (uint256) {
        StakeInfo storage stakeInfo = stakes[user][token];
        return (uint256(stakeInfo.amount) * REWARD_RATE * (block.timestamp - stakeInfo.lastRewardTime)) / (100 * 365 days);
    }

    function claimReward(address token) external nonReentrant {
        uint256 reward = calculateReward(msg.sender, token);
        require(reward > 0, "No reward to claim");

        stakes[msg.sender][token].lastRewardTime = uint40(block.timestamp);
        farms[msg.sender].harvestTokenBalance += uint216(reward);

        emit RewardClaimed(msg.sender, reward);
    }

    function plantCrop(uint8 _cropType, uint256 growthSpeedMultiplier) public {
        require(_cropType < 3, "Invalid crop type");
        Farm storage farm = farms[msg.sender];
        uint256 plantingCost = getPlantingCost(_cropType);
        require(farm.harvestTokenBalance >= plantingCost, "Insufficient Harvest tokens");
        
        farm.harvestTokenBalance -= uint216(plantingCost);
        uint256 maturityTime = calculateMaturityTime(BASE_MATURITY_DURATION, growthSpeedMultiplier);
        
        farm.crops.push(Crop({
            cropType: _cropType,
            plantTime: uint40(block.timestamp),
            maturityTime: uint40(block.timestamp + maturityTime),
            baseReward: uint168(cropBaseRewards[_cropType])
        }));
        
        emit CropPlanted(msg.sender, _cropType);
    }

    function harvestCrops(uint256 yieldBoostMultiplier) public {
        Farm storage farm = farms[msg.sender];
        uint256 reward = 0;
        uint256 i = 0;

        while (i < farm.crops.length) {
            if (farm.crops[i].maturityTime <= block.timestamp) {
                reward += calculateHarvestReward(farm.crops[i].cropType, farm.crops[i].baseReward, yieldBoostMultiplier);
                farm.crops[i] = farm.crops[farm.crops.length - 1];
                farm.crops.pop();
            } else {
                i++;
            }
        }

        if (reward > 0) {
            farm.lastHarvestTime = uint40(block.timestamp);
            farm.harvestTokenBalance += uint216(reward);
            emit CropsHarvested(msg.sender, reward);
        }
    }

    function getFarmStatus(address _farmer) public view returns (Crop[] memory, uint256) {
        return (farms[_farmer].crops, farms[_farmer].harvestTokenBalance);
    }

    function getCurrentWeather() public view returns (Weather) {
        return block.timestamp >= lastWeatherChange + WEATHER_DURATION ? generateNewWeather() : currentWeather;
    }

    function generateNewWeather() private view returns (Weather) {
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % 100;
        if (randomNumber < 40) return Weather.Sunny;
        if (randomNumber < 70) return Weather.Rainy;
        if (randomNumber < 90) return Weather.Drought;
        return Weather.CryptoWinter;
    }

    function updateWeather() public {
        if (block.timestamp >= lastWeatherChange + WEATHER_DURATION) {
            currentWeather = generateNewWeather();
            lastWeatherChange = uint40(block.timestamp);
            emit WeatherChanged(currentWeather);
        }
    }

    function calculateMaturityTime(uint256 baseTime, uint256 growthSpeedMultiplier) private view returns (uint256) {
        Weather weather = getCurrentWeather();
        uint256 weatherMultiplier = weather == Weather.Sunny ? 80 : (weather == Weather.Drought ? 120 : 100);
        return (baseTime * weatherMultiplier * growthSpeedMultiplier) / 10000;
    }

    function calculateHarvestReward(uint8 cropType, uint256 baseReward, uint256 yieldBoostMultiplier) private view returns (uint256) {
        Weather weather = getCurrentWeather();
        uint256 weatherMultiplier = weather == Weather.Rainy ? 120 : (weather == Weather.CryptoWinter ? 80 : 100);
        uint256 priceAdjustedReward = (baseReward * marketPrices[cropType]) / SCALING_FACTOR;
        return (priceAdjustedReward * weatherMultiplier * yieldBoostMultiplier) / 10000;
    }

    function updateMarketPrice(uint8 cropType, uint256 newPrice) public onlyOwner {
        require(cropType < 3, "Invalid crop type");
        marketPrices[cropType] = newPrice;
        emit MarketPriceUpdated(cropType, newPrice);
    }

    function getPlantingCost(uint8 _cropType) public pure returns (uint256) {
        if (_cropType == 0) return 10; // Bitcoin
        if (_cropType == 1) return 5;  // Ethereum
        if (_cropType == 2) return 1;  // Dogecoin
        return 0;
    }
}

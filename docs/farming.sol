// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoFarming {
    enum Weather { Sunny, Rainy, Drought, CryptoWinter }

    struct Crop {
        string cropType;
        uint256 plantTime;
        uint256 maturityTime;
        uint256 baseReward;
    }

    struct Farm {
        Crop[] crops;
        uint256 lastHarvestTime;
        uint256 tokenBalance;
    }

    struct MarketPrice {
        uint256 price;
        uint256 lastUpdate;
    }

    mapping(address => Farm) public farms;
    mapping(string => uint256) public cropBaseRewards;
    mapping(string => MarketPrice) public marketPrices;
    
    uint256 public constant BASE_MATURITY_DURATION = 1 minutes;
    uint256 public constant MARKET_UPDATE_INTERVAL = 5 minutes;
    Weather public currentWeather;
    uint256 public lastWeatherChange;
    uint256 public constant WEATHER_DURATION = 5 minutes;

    event CropPlanted(address farmer, string cropType);
    event CropsHarvested(address farmer, uint256 amount);
    event WeatherChanged(Weather newWeather);
    event MarketPriceUpdated(string cropType, uint256 newPrice);

    address private _owner;

    constructor() {
        _owner = msg.sender;
        currentWeather = Weather.Sunny;
        lastWeatherChange = block.timestamp;
        
        // Set base rewards for each crop type
        cropBaseRewards["Bitcoin"] = 50;
        cropBaseRewards["Ethereum"] = 30;
        cropBaseRewards["Dogecoin"] = 10;

        // Initialize market prices
        _updateMarketPrice("Bitcoin", 50000);
        _updateMarketPrice("Ethereum", 3000);
        _updateMarketPrice("Dogecoin", 1);
    }

    function _updateMarketPrice(string memory cropType, uint256 newPrice) private {
        marketPrices[cropType] = MarketPrice(newPrice, block.timestamp);
        emit MarketPriceUpdated(cropType, newPrice);
    }

    function plantCrop(string memory _cropType, uint256 growthSpeedMultiplier) public {
        require(cropBaseRewards[_cropType] > 0, "Invalid crop type");
        Farm storage farm = farms[msg.sender];
        uint256 maturityTime = calculateMaturityTime(BASE_MATURITY_DURATION, growthSpeedMultiplier);
        farm.crops.push(Crop({
            cropType: _cropType,
            plantTime: block.timestamp,
            maturityTime: block.timestamp + maturityTime,
            baseReward: cropBaseRewards[_cropType]
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
            farm.lastHarvestTime = block.timestamp;
            farm.tokenBalance += reward;
            emit CropsHarvested(msg.sender, reward);
        }
    }

    function harvestSingleCrop(uint256 _index, uint256 yieldBoostMultiplier) public {
        Farm storage farm = farms[msg.sender];
        require(_index < farm.crops.length, "Invalid crop index");
        Crop storage crop = farm.crops[_index];
        require(crop.maturityTime <= block.timestamp, "Crop is not ready for harvest");

        uint256 reward = calculateHarvestReward(crop.cropType, crop.baseReward, yieldBoostMultiplier);
        farm.tokenBalance += reward;

        // Remove the harvested crop
        farm.crops[_index] = farm.crops[farm.crops.length - 1];
        farm.crops.pop();

        farm.lastHarvestTime = block.timestamp;

        emit CropsHarvested(msg.sender, reward);
    }

    function getFarmStatus(address _farmer) public view returns (Crop[] memory, uint256) {
        return (farms[_farmer].crops, farms[_farmer].tokenBalance);
    }

    function getTokenBalance(address _farmer) public view returns (uint256) {
        return farms[_farmer].tokenBalance;
    }

    function getCurrentWeather() public view returns (Weather) {
        if (block.timestamp >= lastWeatherChange + WEATHER_DURATION) {
            return generateNewWeather();
        }
        return currentWeather;
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
            lastWeatherChange = block.timestamp;
            emit WeatherChanged(currentWeather);
        }
    }

    function calculateMaturityTime(uint256 baseTime, uint256 growthSpeedMultiplier) private view returns (uint256) {
        Weather weather = getCurrentWeather();
        uint256 weatherMultiplier = 100;
        if (weather == Weather.Sunny) weatherMultiplier = 80; // 20% faster
        if (weather == Weather.Drought) weatherMultiplier = 120; // 20% slower

        return (baseTime * weatherMultiplier * growthSpeedMultiplier) / 10000; // Divide by 10000 to account for percentages
    }

    function calculateHarvestReward(string memory cropType, uint256 baseReward, uint256 yieldBoostMultiplier) private view returns (uint256) {
        Weather weather = getCurrentWeather();
        uint256 weatherMultiplier = 100;
        if (weather == Weather.Rainy) weatherMultiplier = 120; // 20% more yield
        if (weather == Weather.CryptoWinter) weatherMultiplier = 80; // 20% less yield

        uint256 currentPrice = getMarketPrice(cropType);
        uint256 priceAdjustedReward = (baseReward * currentPrice) / 100; // Adjust reward based on current market price

        return (priceAdjustedReward * weatherMultiplier * yieldBoostMultiplier) / 10000; // Divide by 10000 to account for percentages
    }

    function updateMarketPrice(string memory cropType, uint256 newPrice) public {
        require(msg.sender == _owner, "Only the owner can update market prices");
        _updateMarketPrice(cropType, newPrice);
    }

    function getMarketPrice(string memory cropType) public view returns (uint256) {
        MarketPrice memory price = marketPrices[cropType];
        require(price.lastUpdate > 0, "Market price not set for this crop type");
        return price.price;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function transferOwnership(address newOwner) public {
        require(msg.sender == _owner, "Only the current owner can transfer ownership");
        require(newOwner != address(0), "New owner cannot be the zero address");
        _owner = newOwner;
    }
}

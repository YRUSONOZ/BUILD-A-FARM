// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoFarming {
    enum Weather { Sunny, Rainy, Drought, CryptoWinter }

    struct Crop {
        string cropType;
        uint256 plantTime;
        uint256 maturityTime;
    }

    struct Farm {
        Crop[] crops;
        uint256 lastHarvestTime;
        uint256 tokenBalance;
    }

    mapping(address => Farm) public farms;
    uint256 public constant BASE_MATURITY_DURATION = 1 minutes;
    Weather public currentWeather;
    uint256 public lastWeatherChange;
    uint256 public constant WEATHER_DURATION = 5 minutes;

    event CropPlanted(address farmer, string cropType);
    event CropsHarvested(address farmer, uint256 amount);
    event WeatherChanged(Weather newWeather);

    constructor() {
        currentWeather = Weather.Sunny;
        lastWeatherChange = block.timestamp;
    }

    function plantCrop(string memory _cropType) public {
        Farm storage farm = farms[msg.sender];
        uint256 maturityTime = calculateMaturityTime(BASE_MATURITY_DURATION);
        farm.crops.push(Crop({
            cropType: _cropType,
            plantTime: block.timestamp,
            maturityTime: block.timestamp + maturityTime
        }));
        
        emit CropPlanted(msg.sender, _cropType);
    }

    function harvestCrops() public {
        Farm storage farm = farms[msg.sender];
        uint256 reward = 0;
        uint256 i = 0;

        while (i < farm.crops.length) {
            if (farm.crops[i].maturityTime <= block.timestamp) {
                reward += calculateHarvestReward(10); // Base reward of 10 tokens
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

    function harvestSingleCrop(uint256 _index) public {
        Farm storage farm = farms[msg.sender];
        require(_index < farm.crops.length, "Invalid crop index");
        Crop storage crop = farm.crops[_index];
        require(crop.maturityTime <= block.timestamp, "Crop is not ready for harvest");

        uint256 reward = calculateHarvestReward(10); // Base reward of 10 tokens
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

    function calculateMaturityTime(uint256 baseTime) private view returns (uint256) {
        Weather weather = getCurrentWeather();
        if (weather == Weather.Sunny) return baseTime * 8 / 10; // 20% faster
        if (weather == Weather.Drought) return baseTime * 12 / 10; // 20% slower
        return baseTime; // No change for Rainy or CryptoWinter
    }

    function calculateHarvestReward(uint256 baseReward) private view returns (uint256) {
        Weather weather = getCurrentWeather();
        if (weather == Weather.Rainy) return baseReward * 12 / 10; // 20% more yield
        if (weather == Weather.CryptoWinter) return baseReward * 8 / 10; // 20% less yield
        return baseReward; // No change for Sunny or Drought
    }
}
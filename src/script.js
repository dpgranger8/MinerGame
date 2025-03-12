const grid = document.getElementById("minegrid");
const increaseHitbox = document.getElementById("extraPadding");
const display = document.getElementById("display");
const displayContainer = document.getElementById("displayContainer");
const rewardsContainer = document.getElementById("rewards");
const shopContainer = document.getElementById("shopContainer");

let color1Choices = ["moccasin", "navajowhite"]
let color2Choices = ["burlywood", "sandybrown"]

let tileStates = {};

let _balance = 0;
Object.defineProperty(window, "balance", {
    get: () => {
        return _balance;
    },
    set: (newValue) => {
        _balance = newValue;
        display.textContent = _balance.toLocaleString();
        storeData();
    }
});

let mouseState = {
    whichTile: 0,
    farmAreaOffsets: []
};

let autoFarmerTiles = [];

const rewards = {
    common: {index: 0, rarity: "common", colors: ["aquamarine", "lime"], chance: [100, 80, 74, 72.5, 72.01, 72], bonus: 1},
    uncommon: {index: 1, rarity: "uncommon", colors: ["aqua", "darkturquoise"], chance: [0, 20, 20, 20, 20, 20], bonus: 5},
    rare: {index: 2, rarity: "rare", colors: ["pink", "hotpink"], chance: [0, 0, 6, 6, 6, 6], bonus: 25},
    epic: {index: 3, rarity: "epic", colors: ["lightsalmon", "darkorange"], chance: [0, 0, 0, 1.5, 1.5, 1.5], bonus: 100},
    legendary: {index: 4, rarity: "legendary",  colors: ["yellow", "gold"], chance: [0, 0, 0, 0, 0.49, 0.49], bonus: 500},
    mythic: {index: 5, rarity: "mythic", colors: ["ghostwhite", "gainsboro"], chance: [0, 0, 0, 0, 0, 0.01], bonus: 10000}
};

let shopUpgrades = {
    farmSpeed: {name: "Farm Speed", image: "src/images/rake.png", level: 0, maxLevel: () => {return NaN}, modifier: (level) => {return 0.5 + (level / 5);}, cost: (level) => {return (level + 5) ** 2;}, onUpgrade: () => {}},
    rarityTier: {name: "Add Color", image: "src/images/color-wheel.png", level: 0, maxLevel: () => {return 5}, modifier: (level) => {return  level;}, cost: (level) => {return level == 0 ? 1 : (10 * level);}, onUpgrade: () => {resetColorGrid(); populateColorGrid();}},
    expansion: {name: "Expand Farm", image: "src/images/expand.png", level: 0, maxLevel: () => {return 3}, modifier: (level) => {return  level;}, cost: (level) => {return (100 * (level + 1));}, onUpgrade: () => {resetColorGrid(); populateColorGrid(); shopUpgrades.farmer.maxLevel();}},
    replanting: {name: "Re-seed Farm", image: "src/images/replanting.png", level: 0, maxLevel: () => {return NaN}, modifier: (level) => {return level;}, cost: (level) => {return (level + 1) ** 2;}, onUpgrade: () => {resetColorGrid(); populateColorGrid();}},
    farmer: {name: "Add Auto Farmer", image: "src/images/farmer.png", level: 0, maxLevel: () => {return getSquareSelection(shopUpgrades.expansion.level + 1).length}, modifier: (level) => {return level;}, cost: (level) => {return (level + 1) ** 2;}, onUpgrade: () => {
        let selection = getSquareSelection(shopUpgrades.expansion.level + 1).filter(item => !autoFarmerTiles.includes(item));
        let elementID = getRandomElement(selection);
        let marginToEdit = document.getElementById("margin"+elementID);
        addAutoFarmer(marginToEdit, elementID);
        autoFarmerTiles.push(elementID);
        shopUpgrades.farmer.maxLevel();
        storeData();
    }},
    hoverArea: {name: "Farm Area", image: "src/images/multi-rectangle.png", level: 0, maxLevel: () => {return 8}, modifier: (level) => {return level;}, cost: (level) => {return 10 ** (level + 1);}, onUpgrade: (level) => {
        switch (level) {
            case 1:
                mouseState.farmAreaOffsets = [+1];
                break;
            case 2:
                mouseState.farmAreaOffsets = [-1, +1];
                break;
            case 3:
                mouseState.farmAreaOffsets = [-1, +1, -8, +8];
                break;
            case 4:
                mouseState.farmAreaOffsets = [-1, +1, -8, +8, -9, -7, +9, +7];
                break;
            case 5:
                mouseState.farmAreaOffsets = [-1, +1, -8, +8, -9, -7, +9, +7, -2, +2, -16, +16];
                break;
            case 6:
                mouseState.farmAreaOffsets = [-1, +1, -8, +8, -9, -7, +9, +7, -2, +2, -16, +16, -10, -6, +10, +6];
                break;
            case 7:
                mouseState.farmAreaOffsets = [-1, +1, -8, +8, -9, -7, +9, +7, -2, +2, -16, +16, -10, -6, +10, +6, -17, -15, +17, +15];
                break;
            case 8:
                mouseState.farmAreaOffsets = [-1, +1, -8, +8, -9, -7, +9, +7, -2, +2, -16, +16, -10, -6, +10, +6, -17, -15, +17, +15, -18, -14, +18, +14];
                break;
        }
    }}
};

(() => {
    retrieveData();
    populateRarities();
    populateShop();
    populateColorGrid();
})();

function resetColorGrid() {
    grid.innerHTML = "";
}

function populateColorGrid() {
    for (let i = 1; i <= 64; i++) {
        tileStates[i] = {
            endAngle: 0,
            interval: undefined,
            gradientUnsetLight: color1Choices[getRandomInt(0, 1)],
            gradientUnsetDark: color2Choices[getRandomInt(0, 1)],
            currentItem: chooseRarity()
        };

        if (getSquareSelection(shopUpgrades.expansion.level + 1).includes(i)) {
            let nodeContainer = document.createElement("div");
            nodeContainer.classList.add("nodeContainer");
            nodeContainer.id = ("container"+i);
            let button = document.createElement("button");
            button.classList.add("nodeButton");
            button.id = ("node"+i);
            let margin = document.createElement("div");
            margin.classList.add("extraPadding", "p-1", "flex");
            margin.id = ("margin"+i);

            button.style.background = `linear-gradient(${tileStates[i].gradientUnsetLight}, ${tileStates[i].gradientUnsetDark}`;

            margin.addEventListener("mouseover", () => {
                startAngleIncrease(i)
                mouseState.whichTile = i;
                hoverOtherTiles(true);
            });

            margin.addEventListener("mouseleave", () => {
                startAngleDecrease(i)
                mouseState.whichTile = i;
                hoverOtherTiles(false);
            })
            grid.appendChild(nodeContainer);
            nodeContainer.appendChild(margin);
            margin.appendChild(button);

            autoFarmerTiles.forEach((index) => {
                if (index === i) {
                    addAutoFarmer(margin, index);
                }
            });
        } else {
            let button = document.createElement("button");
            button.classList.add("nodeButton");
            let margin = document.createElement("div");
            margin.classList.add("invisiblePadding", "p-1", "flex");
            grid.appendChild(margin);
            margin.appendChild(button);
        }
    }
}

function addAutoFarmer(element, index) {
    element.classList.add("autoFarmer");
    startAngleIncrease(index, true);
}

function hoverOtherTiles(add) {
    for (let i = 0; i < mouseState.farmAreaOffsets.length; i++) {
        let offset = mouseState.farmAreaOffsets[i];
        let targetTile = mouseState.whichTile + offset;

        let whichColumnTheOffsetIsOn = (((offset % 8) + 8) % 8)

        let isFirstColumn = (mouseState.whichTile % 8 == 1) && (whichColumnTheOffsetIsOn > 5)
        let isSecondColumn = (mouseState.whichTile % 8 == 2) && (whichColumnTheOffsetIsOn === 6)
        let isSecondToLastColumn = (mouseState.whichTile % 8 == 7) && (whichColumnTheOffsetIsOn === 2)
        let isLastColumn = (mouseState.whichTile % 8 == 0) && (whichColumnTheOffsetIsOn < 3 && whichColumnTheOffsetIsOn != 0)
        
        if (isFirstColumn || isSecondColumn || isSecondToLastColumn || isLastColumn) {
            continue;
        }

        let tileButton = document.getElementById("margin" + targetTile);
        if (tileButton != null && tileStates[targetTile]) {
            if (add) {
                tileButton.classList.add("hover");
                startAngleIncrease(targetTile);
            } else {
                tileButton.classList.remove("hover");
                startAngleDecrease(targetTile);
            }
        }
    }
}

function tilesBeingHovered() {
    let tiles = [mouseState.whichTile];
    mouseState.farmAreaOffsets.forEach((element) => {
        tiles.push(element + mouseState.whichTile);
    })
    return tiles;
}

/**
 * Starts increasing the end angle of a tile at a rate determined by upgrades and auto farm tiles.
 * @param {Int} index of grid element to apply styles to
 * @param {Boolean} whether the request to increase gradient angle is coming from the auto farmer function. If not that means it is being called from a mouse hover.
 * I do acknowledge this is a bit confusing
 */

function startAngleIncrease(index, fromAutoFarmer = false) {
    let state = tileStates[index];
    clearInterval(state.interval);
    state.interval = undefined;
    state.interval = setInterval(() => {
        let shouldDoubleSpeed = (autoFarmerTiles.includes(index) && !fromAutoFarmer)
        state.endAngle += (shopUpgrades.farmSpeed.modifier(shopUpgrades.farmSpeed.level) * (shouldDoubleSpeed ? 2 : 1));
        doIncreaseAction(index);
    }, 1);
}

/**
 * Starts decreasing the end angle of a tile over time.
 * @param {number} index - The index of the grid element.
 */

function startAngleDecrease(index) {
    let state = tileStates[index];
    if (state.interval) {
        clearInterval(state.interval);
        state.interval = undefined;
        state.interval = setInterval(() => {
            if (autoFarmerTiles.includes(index)) {
                state.endAngle += shopUpgrades.farmSpeed.modifier(shopUpgrades.farmSpeed.level);;
                doIncreaseAction(index);
            } else {
                state.endAngle -= .1;
                doDecreaseAction(index);
            }
        }, 1)
    }
}

function doDecreaseAction(index) {
    let button = document.getElementById("node"+index);
    let state = tileStates[index];
    button.style.background = `conic-gradient(${state.currentItem.colors[0]} 0deg, ${state.currentItem.colors[1]} ${state.endAngle}deg, ${state.gradientUnsetLight} ${state.endAngle}deg, ${state.gradientUnsetDark} 360deg)`;
    if (state.endAngle <= 0) {
        state.endAngle = 0;
        clearInterval(state.interval)
        state.interval = undefined;
        button.style.background = `linear-gradient(${state.gradientUnsetLight}, ${state.gradientUnsetDark})`;
    }
}

function doIncreaseAction(index) {
    let container = document.getElementById("container"+index);
    let button = document.getElementById("node"+index);
    let state = tileStates[index];
    button.style.background = `conic-gradient(${state.currentItem.colors[0]} 0deg, ${state.currentItem.colors[1]} ${state.endAngle}deg, ${state.gradientUnsetLight} ${state.endAngle}deg, ${state.gradientUnsetDark} 360deg)`;
    if (state.endAngle >= 360) {
        state.endAngle = 0;
        window.balance += state.currentItem.bonus;
        bonusToast(displayContainer, state.currentItem.bonus, "+", true);
        bonusToast(container, state.currentItem.bonus, "+", false);
        state.currentItem = chooseRarity();
    }
}

function populateRarities() {
    rewardsContainer.innerHTML = "";

    let rewardsTitles = document.createElement("div");
    rewardsTitles.classList.add("flex", "justify-between", "mb-5");
    rewardsContainer.appendChild(rewardsTitles)
    let titles = ["Rarity", "Chance", "Bonus"];
    let title = document.createElement("span");
    for (let i = 0; i < 3; i++) {
        let node = title.cloneNode(true);
        node.textContent = titles[i];
        rewardsTitles.appendChild(node);
    }

    for (let key in rewards) {
        let item = rewards[key];
        if (item.index <= shopUpgrades.rarityTier.level) {
            
            let listItem = document.createElement("div");
            listItem.classList.add("flex", "flex-row", "justify-between", "mb-2");

            let itemGroupDiv = document.createElement("div");
            itemGroupDiv.classList.add("flex", "basis-1/3", "self-center");

            let nodeButton = document.createElement("button");
            nodeButton.classList.add("nodeButton");
            nodeButton.style.background = `linear-gradient(${item.colors[0]}, ${item.colors[1]}`;

            let labelDiv = document.createElement("div");
            labelDiv.classList.add("flex", "self-center", "ml-3");
            labelDiv.textContent = capitalize(item.rarity);

            let chanceDiv = document.createElement("div");
            chanceDiv.classList.add("flex", "justify-center",  "self-center", "ml-3");
            chanceDiv.textContent = item.chance[shopUpgrades.rarityTier.level] + "%";

            let rewardDiv = document.createElement("div");
            rewardDiv.classList.add("flex", "basis-1/3", "justify-end", "self-center", "ml-3");
            rewardDiv.textContent = item.bonus;

            let spacer = document.createElement("div");
            spacer.classList.add("flex-grow");

            rewardsContainer.appendChild(listItem);

            itemGroupDiv.appendChild(nodeButton);
            itemGroupDiv.appendChild(labelDiv);

            listItem.appendChild(itemGroupDiv);
            listItem.appendChild(chanceDiv);
            listItem.appendChild(rewardDiv);
        }
    }
}

function resetShop() {
    shopContainer.innerHTML = "";
}

function populateShop() {
    Object.entries(shopUpgrades).forEach(([key, item]) => {
        let shopButton = document.createElement("button");
        shopButton.style.backgroundImage = `url(${item.image})`;
        shopButton.classList.add("shopButton", "relative", "bg-cover", "bg-center", "w-[50px]", "h-[50px]", "border-1", "rounded-md");
        shopContainer.appendChild(shopButton);

        let toolTip = document.createElement("div");
        toolTip.classList.add("toolTip", "absolute", "z-1", "rounded-md", "p-5", "bg-gray-300/50", "backdrop-blur-sm", "flex", "flex-col", "items-center", "border-1");

        let title = document.createElement("div");
        title.classList.add("w-7/8");
        title.textContent = item.name + " " + (item.level + 1);

        let rowItem = document.createElement("div");
        rowItem.classList.add("flex", "flex-row", "justify-between", "items-center", "w-7/8", "mt-5");
        let rowClone = rowItem.cloneNode(true);

        let arrows = document.createElement("div");
        arrows.classList.add("truncate", "mx-5", "text-center", "text-xl");
        arrows.textContent = "➔";

        let cost = document.createElement("div");
        cost.classList.add("flex");
        cost.textContent = "Cost:";
        
        let costLabel = document.createElement("div");
        costLabel.classList.add("flex", "text-red-500")
        costLabel.textContent = item.cost(item.level).toLocaleString();

        let modifier = document.createElement("div");
        modifier.classList.add("flex");
        modifier.textContent = item.modifier(item.level);

        let modifierUpgrade = document.createElement("div");
        modifierUpgrade.classList.add("flex", "text-blue-500")
        modifierUpgrade.textContent = item.modifier(item.level + 1);

        let upgrade = document.createElement("div");
        upgrade.classList.add("absolute", "bottom-0", "right-0", "px-0.5", "bg-cyan-100", "rounded-sm", "text-base/5");
        upgrade.textContent = item.level;

        if (item.level == item.maxLevel()) {
            let maxTitle = document.createElement("div");
            maxTitle.classList.add("w-7/8");
            maxTitle.textContent = item.name + " " + "Maxed";
            toolTip.appendChild(maxTitle);
            shopButton.classList.add("border-green-500", "border-2");
            shopContainer.appendChild(shopButton);
        } else {
            toolTip.appendChild(title);
            toolTip.appendChild(rowItem);
            toolTip.appendChild(rowClone);
        }

        rowItem.appendChild(cost);
        rowItem.appendChild(costLabel);
        rowClone.appendChild(modifier);
        rowClone.appendChild(arrows);
        rowClone.appendChild(modifierUpgrade);

        shopButton.appendChild(toolTip);
        shopButton.appendChild(upgrade);

        shopButton.addEventListener("click", () => {
            let cost = item.cost(item.level)
            if ((window.balance >= cost) && !(item.level == item.maxLevel())) {
                item.level += 1;
                window.balance -= cost;
                costLabel.textContent = item.cost(item.level).toLocaleString();
                modifier.textContent = item.modifier(item.level);
                modifierUpgrade.textContent = item.modifier(item.level + 1);
                upgrade.textContent = item.level;
                title.textContent = item.name + " " + (item.level + 1);
                bonusToast(display, cost, "-", true);
                if (item == shopUpgrades.rarityTier) {
                    populateRarities();
                }
                if (item.level == item.maxLevel()) {
                    resetShop();
                    populateShop();
                    buyAnimation(shopButton);
                } else {
                    buyAnimation(shopButton);
                }
                item.onUpgrade(item.level);
            } else {
                noBuyAnimation(shopButton);
            }
        });
    });
}

function chooseRarity() {
    let num = getRandomInt(1, 10000);
    let threshold = 0;
    
    for (let key of Object.keys(rewards)) {
        threshold += rewards[key].chance[shopUpgrades.rarityTier.level] * 100;
        if (num <= threshold) {
            return rewards[key];
        }
    }
}

/**
 * Function that adds a bonus toast to either the display or the grid element passed in
 * @param {HTMLElement} element the toast will appear above
 * @param {Int} bonus 
 * @param {String} plusOrMinus should only be "+" or "-"
 * @param {Boolean} isDisplay
 */

function bonusToast(button, bonus, plusOrMinus, isDisplay) {
    let toast = document.createElement("div");
    let color = (plusOrMinus === "+") ? "text-[#0000ff]" : "text-[#ff0000]"
    toast.classList.add("bonusToast", color, "translate-x-1.5");
    toast.textContent = plusOrMinus + parseInt(bonus).toLocaleString();
    if (isDisplay) {
        toast.classList.add("transform", "-translate-y-6", "-translate-x-1")
    }
    button.appendChild(toast);
    setTimeout(() => toast.remove(), 500);
}

function noBuyAnimation(button) {
    button.style.transition = "0.05s ease";
    setTimeout(() => {
        button.style.left = "4px";
    }, 50);
    setTimeout(() => {
        button.style.left = "0px";
    }, 100);
    setTimeout(() => {
        button.style.left = "-4px";
    }, 150);
    setTimeout(() => {
        button.style.left = "0px";
    }, 200);
}

function buyAnimation(button) {
    button.style.transition = "0.1s ease";
    button.style.transform = "scale(0.95)";
    setTimeout(() => {
        button.style.transform = "scale(1)";
    }, 100);
}

function getSquareSelection(index) {
    if (index < 1 || index > 4) {
        throw new Error("Index must be between 1 and 4");
    }
    
    const gridSize = 8;
    const sizes = [2, 4, 6, 8]; // Corresponding square sizes for index 1-4
    const size = sizes[index - 1];
    
    // Calculate the starting position for centering
    const startRow = Math.floor((gridSize - size) / 2);
    const startCol = Math.floor((gridSize - size) / 2);
    
    let selectedNumbers = [];
    
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            let number = (startRow + r) * gridSize + (startCol + c) + 1;
            selectedNumbers.push(number);
        }
    }
    
    return selectedNumbers;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function capitalize(str) {
    if (!str) {
      return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRandomElement(arr) {
    if (!Array.isArray(arr) || arr.length === 0) {
      return undefined;
    }
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

function storeData() {
    let levels = [];
    Object.entries(shopUpgrades).forEach(([key, upgrade]) => {
        levels.push(upgrade.level);
    });
    localStorage.setItem("levels", JSON.stringify(levels));
    localStorage.setItem("balance", window.balance);
    localStorage.setItem("autoFarmers", JSON.stringify(autoFarmerTiles));
}

function retrieveData() {
    let storedBalance = localStorage.getItem("balance");
    if (storedBalance == null) {
        window.balance = 10000000000;
    } else {
        // Any additional storage retrieval must come before the object.entries statement
        let levels = JSON.parse(localStorage.getItem("levels"));
        let autoFarm = JSON.parse(localStorage.getItem("autoFarmers"));
        autoFarmerTiles = autoFarm;
        let counter = 0;
        Object.entries(shopUpgrades).forEach(([key, upgrade]) => {
            upgrade.level = levels[counter];
            if (upgrade.name === "Farm Area") {
                shopUpgrades.hoverArea.onUpgrade(upgrade.level);
            }
            counter++;
        });
        window.balance = parseInt(storedBalance);
    }
}

function debug() {
    localStorage.removeItem("levels");
    localStorage.removeItem("balance");
    localStorage.removeItem("autoFarmers");
    location.reload();
}
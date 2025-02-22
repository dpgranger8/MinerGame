import * as utils from "./utils.js"

let mouseState = {
    whichTile: 0,
    farmAreaOffsets: [],
    farmAreaTiles: []
};

const rewards = {
    common: {index: 0, rarity: "common", colors: ["aquamarine", "lime"], chance: [100, 80, 74, 72.5, 72.01, 72], bonus: 1},
    uncommon: {index: 1, rarity: "uncommon", colors: ["aqua", "darkturquoise"], chance: [0, 20, 20, 20, 20, 20], bonus: 5},
    rare: {index: 2, rarity: "rare", colors: ["pink", "hotpink"], chance: [0, 0, 6, 6, 6, 6], bonus: 25},
    epic: {index: 3, rarity: "epic", colors: ["lightsalmon", "darkorange"], chance: [0, 0, 0, 1.5, 1.5, 1.5], bonus: 100},
    legendary: {index: 4, rarity: "legendary",  colors: ["yellow", "gold"], chance: [0, 0, 0, 0, 0.49, 0.49], bonus: 500},
    mythic: {index: 5, rarity: "mythic", colors: ["ghostwhite", "gainsboro"], chance: [0, 0, 0, 0, 0, 0.01], bonus: 10000}
};

let shopUpgrades = {
    farmSpeed: {name: "Farm Speed", image: "src/images/rake.png", level: 0, maxLevel: NaN, modifier: (level) => {return 0.5 + (level / 5);}, cost: (level) => {return (level + 5) ** 2;}, onUpgrade: () => {}},
    rarityTier: {name: "Add Color", image: "src/images/color-wheel.png", level: 0, maxLevel: 5, modifier: (level) => {return  level;}, cost: (level) => {return level == 0 ? 1 : (100 * level);}, onUpgrade: () => {resetColorGrid(); populateColorGrid();}},
    expansion: {name: "Expand Farm", image: "src/images/expand.png", level: 0, maxLevel: 3, modifier: (level) => {return  level;}, cost: (level) => {return (100 * (level + 1));}, onUpgrade: () => {resetColorGrid(); populateColorGrid();}},
    replanting: {name: "Re-seed Farm", image: "src/images/replanting.png", level: 0, maxLevel: NaN, modifier: (level) => {return level;}, cost: (level) => {return (level + 1) ** 2;}, onUpgrade: () => {resetColorGrid(); populateColorGrid();}},
    farmer: {name: "Add Farmer", image: "src/images/farmer.png", level: 0, maxLevel: NaN, modifier: (level) => {return level;}, cost: (level) => {return (level + 1) ** 2;}, onUpgrade: () => {}},
    hoverArea: {name: "Farm Area", image: "src/images/multi-rectangle.png", level: 0, maxLevel: NaN, modifier: (level) => {return level;}, cost: (level) => {return (level + 1) ** 2;}, onUpgrade: (level) => {
        switch (level) {
            case 1:
                mouseState.farmAreaOffsets = [-1, +1];
                break;
            case 2:
                mouseState.farmAreaOffsets.push(-8, +8);
                break;
            case 3:
                mouseState.farmAreaOffsets.push(-9, -7, +9, +7);
        }
    }}
};

(() => {
    populateRarities();
    populateShop();
    populateColorGrid();
})();

function resetColorGrid() {
    const grid = document.getElementById("minegrid");
    grid.innerHTML = "";
}

function populateColorGrid() {
    const grid = document.getElementById("minegrid");
    const increaseHitbox = document.getElementById("extraPadding");
    const balance = document.getElementById("display");

    for (let i = 1; i <= 64; i++) {

        let color1Choices = ["moccasin", "navajowhite"]
        let color2Choices = ["burlywood", "sandybrown"]

        let state = {
            endAngle: 0,
            interval: undefined,
            gradientUnsetLight: color1Choices[utils.getRandomInt(0, 1)],
            gradientUnsetDark: color2Choices[utils.getRandomInt(0, 1)],
            currentItem: chooseRarity()
        };

        if (getSquareSelection(shopUpgrades.expansion.level + 1).includes(i)) {
            let button = document.createElement("button");
            button.classList.add("nodeButton");
            let margin = document.createElement("div");
            margin.classList.add("extraPadding", "p-1", "flex");
            margin.id = i;

            button.style.background = `linear-gradient(${state.gradientUnsetLight}, ${state.gradientUnsetDark}`;

            margin.addEventListener("mouseover", () => {
                increaseGradient(button, balance, state, 1, [state.gradientUnsetLight, state.gradientUnsetDark])
                mouseState.whichTile = i;
                hoverOtherTiles();
            });

            margin.addEventListener("mouseleave", () => {
                decreaseGradient(button, state, 50, [state.gradientUnsetLight, state.gradientUnsetDark])
                mouseState.whichTile = 0;
                unHoverOtherTiles();
            })
            grid.appendChild(margin);
            margin.appendChild(button);
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

function hoverOtherTiles() {
    for (let i = 0; i < mouseState.farmAreaOffsets.length; i++) {
        let whichTile = mouseState.whichTile + mouseState.farmAreaOffsets[i];
        let tileButton = document.getElementById(whichTile);
        tileButton.classList.add("hover");
    }
}
function unHoverOtherTiles() {
    for (let i = 0; i < mouseState.farmAreaOffsets.length; i++) {
        let whichTile = mouseState.whichTile + mouseState.farmAreaOffsets[i];
        let tileButton = document.getElementById(whichTile);
        tileButton.classList.remove("hover");
    }
}

function increaseGradient(button, balance, state, ms, [gradientUnset1, gradientUnset2]) {
    clearInterval(state.interval)
    state.interval = undefined
    state.interval = setInterval(() => {
        state.endAngle += shopUpgrades.farmSpeed.modifier(shopUpgrades.farmSpeed.level);
        button.style.background = `conic-gradient(${state.currentItem.colors[0]} 0deg, ${state.currentItem.colors[1]} ${state.endAngle}deg, ${gradientUnset1} ${state.endAngle}deg, ${gradientUnset2} 360deg)`;
        if (state.endAngle >= 360) {
            state.endAngle = 0;
            let currentValue = parseInt(balance.textContent);
            balance.textContent = currentValue + state.currentItem.bonus;
            bonusToast(balance, state.currentItem.bonus, "+", true);
            bonusToast(button, state.currentItem.bonus, "+", false);
            state.currentItem = chooseRarity();
        }
    }, ms);
}

function decreaseGradient(button, state, ms, [gradientUnset1, gradientUnset2]) {
    if (state.interval) {
        clearInterval(state.interval);
        state.interval = undefined;
        state.interval = setInterval(() => {
            state.endAngle -= 1;
            button.style.background = `conic-gradient(${state.currentItem.colors[0]} 0deg, ${state.currentItem.colors[1]} ${state.endAngle}deg, ${gradientUnset1} ${state.endAngle}deg, ${gradientUnset2} 360deg)`;
            if (state.endAngle <= 0) {
                state.endAngle = 0;
                clearInterval(state.interval)
                state.interval = undefined
                button.style.background = `linear-gradient(${gradientUnset1}, ${gradientUnset2})`;
            }
        }, ms)
    }
}

function populateRarities() {
    const rewardsContainer = document.getElementById("rewards");
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
            labelDiv.textContent = utils.capitalize(item.rarity);

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

function populateShop() {
    const shopContainer = document.getElementById("shopContainer");
    const balance = document.getElementById("display");

    for (let key in shopUpgrades) {
        let item = shopUpgrades[key];
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
        costLabel.textContent = item.cost(item.level);

        let modifier = document.createElement("div");
        modifier.classList.add("flex");
        modifier.textContent = item.modifier(item.level);

        let modifierUpgrade = document.createElement("div");
        modifierUpgrade.classList.add("flex", "text-blue-500")
        modifierUpgrade.textContent = item.modifier(item.level + 1);

        let upgrade = document.createElement("div");
        upgrade.classList.add("absolute", "bottom-0", "right-0", "px-0.5", "bg-cyan-100", "rounded-sm", "text-base/5");
        upgrade.textContent = item.level;

        if (item.level == item.maxLevel) {
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
            if ((balance.textContent >= cost) && !(item.level == item.maxLevel)) {
                shopButton.disabled = true
                item.level += 1;
                balance.textContent -= cost;
                costLabel.textContent = item.cost(item.level);
                modifier.textContent = item.modifier(item.level);
                modifierUpgrade.textContent = item.modifier(item.level + 1);
                upgrade.textContent = item.level;
                title.textContent = item.name + " " + (item.level + 1);
                bonusToast(balance, cost, "-", true);
                buyAnimation(shopButton);
                if (item == shopUpgrades.rarityTier) {
                    populateRarities();
                }
                if (item.level == item.maxLevel) {
                    toolTip.innerHTML = "";
                    let maxTitle = document.createElement("div");
                    maxTitle.classList.add("w-7/8");
                    maxTitle.textContent = item.name + " " + "Maxed";
                    toolTip.appendChild(maxTitle);
                    shopButton.classList.add("border-green-500", "border-2");
                    shopContainer.appendChild(shopButton);
                }
                item.onUpgrade(item.level);
            } else {
                noBuyAnimation(shopButton);
            }
        });
    }
}

function chooseRarity() {
    let num = utils.getRandomInt(1, 10000);
    let threshold = 0;
    
    for (let key of Object.keys(rewards)) {
        threshold += rewards[key].chance[shopUpgrades.rarityTier.level] * 100;
        if (num <= threshold) {
            return rewards[key];
        }
    }
}

function bonusToast(button, bonus, plusOrMinus, upMore) {
    let toast = document.createElement("div");
    toast.classList.add("bonusToast");
    if (upMore) {
        toast.classList.add("transform", "-translate-y-6", "-translate-x-1")
    }
    toast.textContent = plusOrMinus + bonus;
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
    setTimeout(() => {
        button.disabled = false
    }, 500)
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
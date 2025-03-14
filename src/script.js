const grid = document.getElementById("mineGrid");
const fakeGrid = document.getElementById("selectionGrid");
const increaseHitbox = document.getElementById("extraPadding");
const display = document.getElementById("display");
const displayContainer = document.getElementById("displayContainer");
const raritiesContainer = document.getElementById("rewards");
const shopContainer = document.getElementById("shopContainer");
const statusText = document.getElementById("statusText");
const balanceHeader = document.getElementById("balance");
const inventory = document.getElementById("inventory");

let color1Choices = ["moccasin", "navajowhite"];
let color2Choices = ["burlywood", "sandybrown"];

let tileStates = {};

let inventoryCounts = [0, 0, 0, 0, 0, 0];

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
    common: { index: 0, rarity: "common", colors: ["aquamarine", "lime"], chance: [100, 80, 74, 72.5, 72.01, 72], bonus: 1, toastColor: "text-[#006400]" },
    uncommon: { index: 1, rarity: "uncommon", colors: ["aqua", "darkturquoise"], chance: [0, 20, 20, 20, 20, 20], bonus: 5, toastColor: "text-[#0000ff]" },
    rare: { index: 2, rarity: "rare", colors: ["pink", "hotpink"], chance: [0, 0, 6, 6, 6, 6], bonus: 25, toastColor: "text-[#ff1493]" },
    epic: { index: 3, rarity: "epic", colors: ["gold", "orange"], chance: [0, 0, 0, 1.5, 1.5, 1.5], bonus: 100, toastColor: "text-[#cc5500]" },
    legendary: { index: 4, rarity: "legendary", colors: ["lightsalmon", "orangered"], chance: [0, 0, 0, 0, 0.49, 0.49], bonus: 500, toastColor: "text-[#ff0000]" },
    mythic: { index: 5, rarity: "mythic", colors: ["ghostwhite", "gainsboro"], chance: [0, 0, 0, 0, 0, 0.01], bonus: 10000, toastColor: "text-[#4b0082]" }
};


let shopUpgrades = {
    farmSpeed: { name: "Hover Farm Speed", image: "src/images/rake.png", level: 0, maxLevel: () => { return NaN }, modifier: (level) => { return 0.5 + (level / 5); }, cost: (level) => { return (level + 5) ** 3; }, onUpgrade: () => { } },
    rarityTier: { name: "Add Color", image: "src/images/color-wheel.png", level: 0, maxLevel: () => { return 5 }, modifier: (level) => { return level; }, cost: (level) => { return level == 0 ? 1 : (10 * level); }, onUpgrade: () => { resetColorGrid(); } },
    expansion: { name: "Expand Farm", image: "src/images/expand.png", level: 0, maxLevel: () => { return 3 }, modifier: (level) => { return level; }, cost: (level) => { return (100 * (level + 1)); }, onUpgrade: () => { resetColorGrid(); shopUpgrades.farmer.maxLevel(); populateShop(); } },
    replanting: { name: "Re-seed Farm", image: "src/images/replanting.png", level: 0, maxLevel: () => { return NaN }, modifier: (level) => { return level; }, cost: (level) => { return (level + 1) ** 2; }, onUpgrade: () => { resetColorGrid(); } },
    farmer: { name: "Add Auto Farmer", image: "src/images/farmer.png", level: 0, maxLevel: () => { return getSquareSelection(shopUpgrades.expansion.level + 1).length }, modifier: (level) => { return level; }, cost: (level) => { return (level + 1) ** 2; }, onUpgrade: () => { placeBuilding(); } },
    autoFarmerSpeed: { name: "Auto Farmer Speed", image: "src/images/speed.png", level: 0, maxLevel: () => { return NaN }, modifier: (level) => { return Number((0.1 + (level / 10)).toFixed(1)); }, cost: (level) => { return (level + 1) ** 4; }, onUpgrade: () => { } },
    //multiplier: {name: "Multiplier", image: "src/images/multiplier.png", level: 0, maxLevel: () => {return NaN}, modifier: (level) => {return level;}, cost: (level) => {return level;}, onUpgrade: () => {}},
    hoverArea: { name: "Farm Area", image: "src/images/multi-rectangle.png", level: 0, maxLevel: () => { return 8 }, modifier: (level) => { return level; }, cost: (level) => { return 10 ** (level + 1); }, onUpgrade: (level) => { setFarmAreaOffsets(shopUpgrades.hoverArea.level) } }
};

(() => {
    retrieveData();
    populateRarities();
    populateShop();
    populateColorGrid();
    updateInventoryCounts();
})();

function resetColorGrid() {
    Object.values(tileStates).forEach((state) => {
        if (state.interval) {
            clearInterval(state.interval);
            state.interval = undefined;
        }
    });
    grid.innerHTML = "";
    populateColorGrid();
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
            nodeContainer.id = ("container" + i);
            let button = document.createElement("button");
            button.classList.add("nodeButton");
            button.id = ("node" + i);
            let margin = document.createElement("div");
            margin.classList.add("extraPadding", "p-1", "flex");
            margin.id = ("margin" + i);

            button.style.background = `linear-gradient(${tileStates[i].gradientUnsetLight}, ${tileStates[i].gradientUnsetDark}`;

            margin.addEventListener("mouseover", () => {
                statusText.textContent = "";
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

function placeBuilding() {
    //This code is very similar to populateColorGrid because it is populating a fake grid to show as a selection screen to place buildings on.
    //Currently this only places auto farmers but more buildings are planned.
    //The real grid is hidden temporarily to allow the fake grid to show as a selection screen.
    let selection = getSquareSelection(shopUpgrades.expansion.level + 1).filter(item => !autoFarmerTiles.includes(item));
    statusText.textContent = "Select a tile to place Auto Farmer on!"
    let blur = ["opacity-50", "pointer-events-none"];
    balanceHeader.classList.add(blur[0], blur[1]);
    shopContainer.classList.add(blur[0], blur[1]);
    raritiesContainer.classList.add(blur[0], blur[1]);
    grid.classList.remove("grid");
    grid.classList.add("hidden");
    fakeGrid.classList.remove("hidden");
    fakeGrid.classList.add("grid");


    for (let i = 1; i <= 64; i++) {
        if (selection.includes(i)) {
            let nodeContainer = document.createElement("div");
            nodeContainer.classList.add("nodeContainer");
            nodeContainer.id = ("container" + i);
            let button = document.createElement("button");
            button.classList.add("fakeNodeButton");
            button.id = ("node" + i);
            let margin = document.createElement("div");
            margin.classList.add("extraPadding", "p-1", "flex");
            margin.id = ("margin" + i);

            button.style.background = `linear-gradient(${tileStates[i].gradientUnsetLight}, ${tileStates[i].gradientUnsetDark}`;

            margin.addEventListener("click", (event) => {
                statusText.textContent = "";
                grid.classList.add("grid");
                grid.classList.remove("hidden");
                fakeGrid.classList.add("hidden");
                fakeGrid.classList.remove("grid");
                fakeGrid.innerHTML = "";
                balanceHeader.classList.remove(blur[0], blur[1]);
                shopContainer.classList.remove(blur[0], blur[1]);
                raritiesContainer.classList.remove(blur[0], blur[1]);

                let marginToEdit = document.getElementById("margin" + i);
                addAutoFarmer(marginToEdit, i);
                autoFarmerTiles.push(i);
                shopUpgrades.farmer.maxLevel();
                storeData();
            });

            fakeGrid.appendChild(nodeContainer);
            nodeContainer.appendChild(margin);
            margin.appendChild(button);
        } else {
            let button = document.createElement("button");
            button.classList.add("fakeNodeButton");
            let margin = document.createElement("div");
            margin.classList.add("invisiblePadding", "p-1", "flex");
            fakeGrid.appendChild(margin);
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
        let shouldDoubleFarm = (autoFarmerTiles.includes(index) && !fromAutoFarmer);
        if (shouldDoubleFarm) {
            state.endAngle += shopUpgrades.autoFarmerSpeed.modifier(shopUpgrades.autoFarmerSpeed.level)
                + shopUpgrades.farmSpeed.modifier(shopUpgrades.farmSpeed.level);

        } else {
            state.endAngle += fromAutoFarmer
                ? shopUpgrades.autoFarmerSpeed.modifier(shopUpgrades.autoFarmerSpeed.level)
                : shopUpgrades.farmSpeed.modifier(shopUpgrades.farmSpeed.level);
        }
        doIncreaseAction(state, index);
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
                state.endAngle += shopUpgrades.autoFarmerSpeed.modifier(shopUpgrades.autoFarmerSpeed.level);
                doIncreaseAction(state, index);
            } else {
                state.endAngle -= .1;
                doDecreaseAction(state, index);
            }
        }, 1)
    }
}

function doIncreaseAction(state, index) {
    let container = document.getElementById("container" + index);
    let button = document.getElementById("node" + index);
    button.style.background = `conic-gradient(${state.currentItem.colors[0]} 0deg, ${state.currentItem.colors[1]} ${state.endAngle}deg, ${state.gradientUnsetLight} ${state.endAngle}deg, ${state.gradientUnsetDark} 360deg)`;
    if (state.endAngle >= 360) {
        state.endAngle = 0;
        if (ifAutoSell(state.currentItem.index)) {
            window.balance += state.currentItem.bonus;
            bonusToast(displayContainer, state.currentItem.bonus, true, state.currentItem.toastColor);
            bonusToast(container, state.currentItem.bonus, true, state.currentItem.toastColor);
        } else {
            colorToast(container, state.currentItem);
            bonusToast(document.getElementById("inventoryContainer" + state.currentItem.index), 1, true, state.currentItem.toastColor);
            inventoryCounts[state.currentItem.index] += 1;
            updateInventoryCounts(state.currentItem.index);
        }
        state.currentItem = chooseRarity();
    }
}

function doDecreaseAction(state, index) {
    let button = document.getElementById("node" + index);
    button.style.background = `conic-gradient(${state.currentItem.colors[0]} 0deg, ${state.currentItem.colors[1]} ${state.endAngle}deg, ${state.gradientUnsetLight} ${state.endAngle}deg, ${state.gradientUnsetDark} 360deg)`;
    if (state.endAngle <= 0) {
        state.endAngle = 0;
        clearInterval(state.interval)
        state.interval = undefined;
        button.style.background = `linear-gradient(${state.gradientUnsetLight}, ${state.gradientUnsetDark})`;
    }
}

function populateRarities() {
    raritiesContainer.innerHTML = "";
    populateInventory();

    let rewardsTitles = document.createElement("div");
    rewardsTitles.classList.add("flex", "justify-between", "mb-2");
    raritiesContainer.appendChild(rewardsTitles)
    let titles = ["Rarity", "Chance", "Value"];
    let title = document.createElement("span");
    for (let i = 0; i < 3; i++) {
        let node = title.cloneNode(true);
        node.textContent = titles[i];
        if (i === 1) {
            node.classList.add("basis-1/2", "text-end");
        } else if (i === 2) {
            node.classList.add("basis-1/4", "text-end");
        }
        rewardsTitles.appendChild(node);
    }

    Object.values(rewards).forEach(item => {
        if (item.index <= shopUpgrades.rarityTier.level) {

            let listItem = document.createElement("div");
            listItem.classList.add("flex", "flex-row", "justify-between", "mb-2");

            let itemGroupDiv = document.createElement("div");
            itemGroupDiv.classList.add("flex", "basis-1/2", "self-center");

            let nodeButton = document.createElement("button");
            nodeButton.classList.add("nodeButton");
            nodeButton.style.background = `linear-gradient(${item.colors[0]}, ${item.colors[1]}`;

            let labelDiv = document.createElement("div");
            labelDiv.classList.add("flex", "self-center", "ml-1");
            labelDiv.textContent = capitalize(item.rarity);

            let chanceDiv = document.createElement("div");
            chanceDiv.classList.add("flex", "justify-center", "self-center", "ml-3");
            chanceDiv.textContent = item.chance[shopUpgrades.rarityTier.level] + "%";

            let rewardDiv = document.createElement("div");
            rewardDiv.classList.add("flex", "basis-1/4", "justify-end", "self-center", "ml-3");
            rewardDiv.textContent = item.bonus;

            let spacer = document.createElement("div");
            spacer.classList.add("flex-grow");

            raritiesContainer.appendChild(listItem);

            itemGroupDiv.appendChild(nodeButton);
            itemGroupDiv.appendChild(labelDiv);

            listItem.appendChild(itemGroupDiv);
            listItem.appendChild(chanceDiv);
            listItem.appendChild(rewardDiv);
        }
    })
}

function populateInventory() {
    inventory.innerHTML = "";

    let inventoryTitles = document.createElement("div");
    inventoryTitles.classList.add("flex", "w-full", "justify-between", "mb-2");
    let titles = ["Inventory", "Auto-sell"];
    let title = document.createElement("span");
    for (let i = 0; i < 2; i++) {
        let node = title.cloneNode(true);
        node.textContent = titles[i];
        inventoryTitles.appendChild(node);
    }
    inventory.appendChild(inventoryTitles);

    Object.values(rewards).forEach(item => {
        if (item.index <= shopUpgrades.rarityTier.level) {
            let container = document.createElement("div");
            container.classList.add("flex", "w-full", "justify-between", "h-[30px]", "mb-2")
            container.id = "inventoryContainer" + item.index;

            let text = document.createElement("div");
            text.textContent = inventoryCounts[item.index];
            text.id = "inventoryCount" + item.index;

            let toggle = createToggle(item.index, (item.index === 0) ? true : false);

            container.appendChild(text);
            container.appendChild(toggle)
            inventory.appendChild(container);
        }
    })
}

function populateShop() {
    shopContainer.innerHTML = "";

    Object.values(shopUpgrades).forEach(item => {
        let shopButton = document.createElement("button");
        shopButton.style.backgroundImage = `url(${item.image})`;
        shopButton.classList.add("shopButton", "relative", "bg-cover", "bg-center", "w-[50px]", "h-[50px]", "border-1", "rounded-md", "hover:cursor-pointer");
        shopContainer.appendChild(shopButton);

        let toolTip = document.createElement("div");
        toolTip.classList.add("toolTip", "absolute", "z-1", "rounded-md", "p-5", "bg-gray-300/45", "backdrop-blur-sm", "flex", "flex-col", "items-center", "border-1");

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
                bonusToast(displayContainer, cost, false, true);
                if (item == shopUpgrades.rarityTier) {
                    populateRarities();
                }
                if (item.level == item.maxLevel()) {
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
 * @param {HTMLElement} element the toast will appear above this
 * @param {Int} value 
 * @param {Boolean} isBonus whether the toast is a bonus
 * @param {String} color the toast will show up as in Tailwind text-[#hex] format
 */

function bonusToast(element, value, isBonus, color) {
    // I am so sorry to anyone who has to read this its a mess
    let toast = document.createElement("div");
    toast.textContent = (isBonus ? "+" : "-") + parseInt(value).toLocaleString();
    let translateXStrings = ["-translate-x-7", "-translate-x-6", "-translate-x-5", "-translate-x-4", "-translate-x-3", "-translate-x-2", "-translate-x-1", "translate-x-0", "translate-x-1", "translate-x-2", "translate-x-3", "translate-x-4", "translate-x-5", "translate-x-6", "translate-x-7"];
    let translateYStrings = ["-translate-y-8", "-translate-y-7", "-translate-y-6"]
    let closerYStrings = ["translate-y-1", "translate-y-0", "-translate-y-1"]
    let closerXStrings = ["-translate-x-4", "-translate-x-3", "-translate-x-2", "-translate-x-1", "translate-x-0", "translate-x-1", "translate-x-2", "translate-x-3", "translate-x-4"];
    let translateBottomYStrings = ["-translate-y-6", "-translate-y-5", "-translate-y-4"]
    let selectedColor = isBonus ? color : "text-[#ff0000]";
    let isBonusOrMinus = isBonus ? "bonusToast" : "minusToast";
    toast.classList.add(isBonusOrMinus, selectedColor);
    if (element.id.includes("display")) {
        if (isBonus) {
            toast.classList.add("transform", getRandomElement(translateYStrings), getRandomElement(translateXStrings));
            setTimeout(() => toast.remove(), getRandomInt(200, 500));
        } else {
            toast.classList.add("transform", getRandomElement(translateBottomYStrings), getRandomElement(translateXStrings));
            setTimeout(() => toast.remove(), 500);
        }
    } else if (element.id.includes("inventory")) {
        toast.classList.add("transform", getRandomElement(closerYStrings), getRandomElement(closerXStrings));
        setTimeout(() => toast.remove(), getRandomInt(200, 500));
    } else {
        toast.classList.add("translate-x-1");
        setTimeout(() => toast.remove(), 500);
    }
    element.appendChild(toast);
}

function colorToast(element, item) {
    let container = document.createElement("div");
    container.classList.add("flex", "items-center", "bonusToast", "translate-x-0.5");
    let toast = document.createElement("button");
    toast.classList.add("toastNode");
    toast.style.background = `linear-gradient(${item.colors[0]}, ${item.colors[1]}`;
    let text = document.createElement("div");
    text.classList.add(item.toastColor);
    text.textContent = "+";

    setTimeout(() => container.remove(), 500);

    container.appendChild(text);
    container.appendChild(toast);
    element.appendChild(container);
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

function setFarmAreaOffsets(level) {
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
}

function storeData() {
    localStorage.setItem("levels", JSON.stringify(getShopLevels()));
    localStorage.setItem("balance", window.balance);
    localStorage.setItem("autoFarmers", JSON.stringify(autoFarmerTiles));
    localStorage.setItem("statusText", statusText.textContent);
    localStorage.setItem("inventoryCounts", JSON.stringify(inventoryCounts));
}

function retrieveData() {
    let status = localStorage.getItem("statusText");
    if (status == null) {
        statusText.textContent = "Hover over any tile to start farming it!";
    } else {
        statusText.textContent = status;
    }
    let storedBalance = localStorage.getItem("balance");
    if (storedBalance == null) {
        window.balance = 1000000;
    } else {
        // Any additional storage retrieval must come before the object.values statement
        let levels = JSON.parse(localStorage.getItem("levels"));
        autoFarmerTiles = JSON.parse(localStorage.getItem("autoFarmers"));

        let counts = JSON.parse(localStorage.getItem("inventoryCounts"));
        if (counts == null || counts.length === 0) {
            inventoryCounts = [0, 0, 0, 0, 0, 0];
        } else {
            inventoryCounts = counts;
        }
        let counter = 0;
        Object.values(shopUpgrades).forEach(upgrade => {
            if (upgrade.name === "Add Auto Farmer") {
                upgrade.level = autoFarmerTiles.length; // Prevents incorrect count bug where the page was refreshed before a building could be placed
            } else {
                upgrade.level = levels[counter];
            }
            if (upgrade.name === "Farm Area") {
                shopUpgrades.hoverArea.onUpgrade(upgrade.level);
            }
            counter++;
        });
        window.balance = parseInt(storedBalance);
    }
}

function getShopLevels() {
    let levels = [];
    Object.values(shopUpgrades).forEach(upgrade => {
        levels.push(upgrade.level);
    });
    return levels;
}

function debug() {
    localStorage.removeItem("levels");
    localStorage.removeItem("balance");
    localStorage.removeItem("autoFarmers");
    localStorage.removeItem("statusText");
    localStorage.removeItem("inventoryCounts");
    location.reload();
}

function createToggle(id, initialState = false) {
    const label = document.createElement('label');
    label.classList.add('flex', 'cursor-pointer', 'select-none', 'text-dark');

    const divWrapper = document.createElement('div');
    divWrapper.classList.add('relative');

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = "toggle" + id;
    input.classList.add('peer', 'sr-only');
    input.checked = initialState;

    const divBlock = document.createElement('div');
    divBlock.classList.add('block', 'h-6', 'rounded-full', 'box', 'bg-blue-100', 'w-10');
    divBlock.classList.add('peer-checked:bg-green-100');

    const dotDiv = document.createElement('div');
    dotDiv.classList.add('absolute', 'flex', 'items-center', 'justify-center', 'w-4', 'h-4', 'transition', 'bg-blue-400', 'rounded-full', 'dot', 'left-1', 'top-1');
    dotDiv.classList.add('peer-checked:translate-x-full', 'peer-checked:bg-green-500');
    
    divWrapper.appendChild(input);
    divWrapper.appendChild(divBlock);
    divWrapper.appendChild(dotDiv);

    label.appendChild(divWrapper);

    return label;
}

function updateInventoryCounts(value = null) {
    if (value === null) {
        Object.values(rewards).forEach(item => {
            if (item.index <= shopUpgrades.rarityTier.level) {
                const countDisplayElement = document.getElementById("inventoryCount" + item.index);
                countDisplayElement.textContent = inventoryCounts[item.index];
            }
        })
    } else {
        const countDisplayElement = document.getElementById("inventoryCount" + value);
        countDisplayElement.textContent = inventoryCounts[value];
    }
}

function ifAutoSell(index) {
    const toggle = document.getElementById("toggle" + index);
    return toggle.checked;
}

function customSellButton(text, onClick) {
    const button = document.createElement("a");
    
    button.className = "rounded relative inline-flex group items-center justify-center cursor-pointer border-b-4 border-l-2 active:border-violet-500 active:shadow-none shadow-lg bg-violet-500 border-violet-600 text-white hover:brightness-125 select-none";
    
    const spanText = document.createElement("span");
    spanText.className = "relative w-full active:translate-y-0.25 active:-translate-x-0.25 px-3.5 py-1.5";
    spanText.textContent = text;
    
    button.appendChild(spanText);
    
    if (typeof onClick === "function") {
        button.addEventListener("click", onClick);
    }
    
    return button;
}
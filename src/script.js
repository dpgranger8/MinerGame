const rewards = {
    common: {rarity: "common", colors: ["aquamarine", "lime"], chance: 72, bonus: 1},
    uncommon: {rarity: "uncommon", colors: ["aqua", "darkturquoise"], chance: 20, bonus: 5},
    rare: {rarity: "rare", colors: ["pink", "hotpink"], chance: 6, bonus: 25},
    epic: {rarity: "epic", colors: ["violet", "purple"], chance: 1.5, bonus: 100},
    legendary: {rarity: "legendary",  colors: ["yellow", "gold"], chance: 0.49, bonus: 500},
    mythic: {rarity: "mythic", colors: ["ghostwhite", "gainsboro"], chance: 0.01, bonus: 10000}
};

// 65.53\ e^{-1.156x}

let shopUpgrades = {
    farmspeed: { name: "Farm Speed", image: "src/images/rake.png", level: 0, modifier: function(level) {return 0.5 + (level / 5);}, cost: function(level) {return (level + 3) ** 2;}}
};

(function() {
    const grid = document.getElementById("minegrid");
    const increaseHitbox = document.getElementById("extraPadding");
    const balance = document.getElementById("display");

    populateRewards();
    populateShop();

    for (let i = 0; i < 64; i++) {

        let state = {
            endAngle: 0,
            interval: null,
            gradientUnsetLight: "lemonchiffon",
            gradientUnsetDark: "moccasin",
            currentItem: chooseRarity()
        };

        let button = document.createElement("button");
        button.classList.add("nodeButton");
        let margin = document.createElement("div");
        margin.classList.add("extraPadding", "p-1", "flex");

        button.id = i;
        button.style.background = `linear-gradient(${state.gradientUnsetLight}, ${state.gradientUnsetDark}`;

        margin.addEventListener("mouseover", () => {
            increaseGradient(button, balance, state, 1, [state.gradientUnsetLight, state.gradientUnsetDark])
        });

        margin.addEventListener("mouseleave", () => {
            decreaseGradient(button, state, 50, [state.gradientUnsetLight, state.gradientUnsetDark])
        })

        grid.appendChild(margin);
        margin.appendChild(button);
    }
})();


function increaseGradient(button, balance, state, ms, [gradientUnset1, gradientUnset2]) {
    clearInterval(state.interval)
    state.interval = undefined
    state.interval = setInterval(() => {
        state.endAngle += shopUpgrades.farmspeed.modifier(shopUpgrades.farmspeed.level);
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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function capitalize(str) {
    if (!str) {
      return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function populateRewards() {
    const rewardsContainer = document.getElementById("rewards");

    for (let key in rewards) {
        let item = rewards[key];
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
        chanceDiv.textContent = item.chance + "%";

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
        listItem.appendChild(rewardDiv)
    }
}

function chooseRarity() {
    let num = getRandomInt(1, 10000);
    let threshold = 0;
    
    for (let key of Object.keys(rewards)) {
        threshold += rewards[key].chance * 100;
        if (num <= threshold) {
            return rewards[key];
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
        title.textContent = "Upgrade "+ item.name;

        let rowItem = document.createElement("div");
        rowItem.classList.add("flex", "flex-row", "justify-between", "w-7/8", "mt-5");
        let rowClone = rowItem.cloneNode(true);

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

        toolTip.appendChild(title);
        toolTip.appendChild(rowItem);
        toolTip.appendChild(rowClone);
        
        rowItem.appendChild(cost);
        rowItem.appendChild(costLabel);
        rowClone.appendChild(modifier);
        rowClone.appendChild(modifierUpgrade);

        let upgrade = document.createElement("div");
        upgrade.classList.add("absolute", "bottom-0", "right-0", "pr-0.5");
        upgrade.textContent = item.level;

        shopButton.appendChild(toolTip);
        shopButton.appendChild(upgrade);

        shopButton.addEventListener("click", () => {
            let cost = item.cost(item.level)
            if (balance.textContent >= cost) {
                shopButton.disabled = true
                item.level += 1;
                balance.textContent -= cost;
                costLabel.textContent = item.cost(item.level);
                modifier.textContent = item.modifier(item.level);
                modifierUpgrade.textContent = item.modifier(item.level + 1);
                bonusToast(balance, cost, "-", true);
                buyAnimation(shopButton);
            } else {
                noBuyAnimation(shopButton);
            }
        });
    }
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
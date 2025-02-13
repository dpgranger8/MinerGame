const rewards = {
    common: {rarity: "common", bonus: 1, colors: ["aquamarine", "lime"], chance: 72},
    uncommon: {rarity: "uncommon", bonus: 5, colors: ["aqua", "darkturquoise"], chance: 20},
    rare: {rarity: "rare", bonus: 25, colors: ["pink", "hotpink"], chance: 6},
    epic: {rarity: "epic", bonus: 100, colors: ["violet", "purple"], chance: 1.5},
    legendary: {rarity: "legendary", bonus: 500, colors: ["yellow", "gold"], chance: 0.49},
    mythic: {rarity: "mythic", bonus: 10000, colors: ["ghostwhite", "gainsboro"], chance: 0.01}
};

// 65.53\ e^{-1.156x}

let shopUpgrades = {
    farmspeed: { name: "Farm Speed", image: "src/images/rake.png", level: 0}
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
        // button.textContent = 1;

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
        state.endAngle += 10 + (0.5 + (shopUpgrades.farmspeed.level / 5));
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
        shopButton.addEventListener("click", () => {
            let cost = (item.level + 1) * 10;
            if (balance.textContent >= cost) {
                shopButton.disabled = true
                shopUpgrades[key].level += 1;
                shopUpgrades[key].modifier += 0.1;
                upgrade.textContent = shopUpgrades[key].level;
                costLabel.textContent = (item.level + 1) * 10;
                balance.textContent -= cost;
                bonusToast(balance, cost, "-", true);
                buyAnimation(shopButton);
            } else {
                noBuyAnimation(shopButton);
            }
        });

        shopContainer.appendChild(shopButton);

        let toolTip = document.createElement("div");
        toolTip.classList.add("toolTip", "absolute", "z-1", "rounded-md", "p-5", "bg-gray-300/50", "backdrop-blur-sm", "flex", "flex-col", "items-center", "border-1");

        let title = document.createElement("div");
        title.classList.add("w-7/8");
        title.textContent = "Upgrade "+ item.name;

        let rowItem = document.createElement("div");
        rowItem.classList.add("flex", "flex-row", "justify-between", "w-7/8", "mt-5");

        let cost = document.createElement("div");
        cost.classList.add("flex");
        cost.textContent = "Cost:";
        
        let costLabel = document.createElement("div");
        costLabel.classList.add("flex", "text-red-500")
        costLabel.textContent = (item.level + 1) * 10;

        toolTip.appendChild(title);
        toolTip.appendChild(rowItem);
        rowItem.appendChild(cost);
        rowItem.appendChild(costLabel)

        let upgrade = document.createElement("div");
        upgrade.classList.add("absolute", "bottom-0", "right-0", "pr-0.5");
        upgrade.textContent = item.level;

        shopButton.appendChild(toolTip);
        shopButton.appendChild(upgrade);
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
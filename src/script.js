const rewards = {
    common: ["common", 1, ["aquamarine", "lime"], 60],
    uncommon: ["uncommon", 5, ["aqua", "darkturquoise"], 25],
    rare: ["rare", 10, ["pink", "hotpink"], 8],
    epic: ["epic", 50, ["indianred", "crimson"], 5],
    legendary: ["legendary", 100, ["yellow", "gold"], 1.9],
    mythic: ["mythic", 5000, ["ghostwhite", "gainsboro"], 0.1]
};

const shopUpgrades = [
    ["Farm Speed", "./rake.png"]
];

(function() {
    const grid = document.getElementById("minegrid");
    const increaseHitbox = document.getElementById("extraPadding");
    const display = document.getElementById("display");

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
            increaseGradient(button, display, state, 1, [state.gradientUnsetLight, state.gradientUnsetDark])
        });

        margin.addEventListener("mouseleave", () => {
            decreaseGradient(button, state, 50, [state.gradientUnsetLight, state.gradientUnsetDark])
        })

        grid.appendChild(margin);
        margin.appendChild(button);
    }
})();


function increaseGradient(button, display, state, ms, [gradientUnset1, gradientUnset2]) {
    clearInterval(state.interval)
    state.interval = undefined
    state.interval = setInterval(() => {
        state.endAngle += 1;
        button.style.background = `conic-gradient(${state.currentItem[2][0]} 0deg, ${state.currentItem[2][1]} ${state.endAngle}deg, ${gradientUnset1} ${state.endAngle}deg, ${gradientUnset2} 360deg)`;
        if (state.endAngle >= 360) {
            state.endAngle = 0;
            let currentValue = parseInt(display.textContent);
            display.textContent = currentValue + state.currentItem[1];
            bonusToast(button, state.currentItem[1]);
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
            button.style.background = `conic-gradient(${state.currentItem[2][0]} 0deg, ${state.currentItem[2][1]} ${state.endAngle}deg, ${gradientUnset1} ${state.endAngle}deg, ${gradientUnset2} 360deg)`;
            if (state.endAngle == 0) {
                state.endAngle = 0;
                clearInterval(state.interval)
                state.interval = undefined
                button.style.background = `linear-gradient(${gradientUnset1}, ${gradientUnset2})`;
            }
        }, ms)
    }
}

function bonusToast(button, bonus) {
    let toast = document.createElement("div");
    toast.classList.add("bonusToast");
    toast.textContent = "+" + bonus;
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
        nodeButton.style.background = `linear-gradient(${item[2][0]}, ${item[2][1]}`;

        let labelDiv = document.createElement("div");
        labelDiv.classList.add("flex", "self-center", "ml-3");
        labelDiv.textContent = capitalize(item[0]);

        let chanceDiv = document.createElement("div");
        chanceDiv.classList.add("flex", "justify-center",  "self-center", "ml-3");
        chanceDiv.textContent = item[3] + "%";

        let rewardDiv = document.createElement("div");
        rewardDiv.classList.add("flex", "basis-1/3", "justify-end", "self-center", "ml-3");
        rewardDiv.textContent = item[1];

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
    let num = getRandomInt(1, 1000);
    if (num > 400) {
        return rewards.common;
    } else if (num > 150) {
        return rewards.uncommon;
    } else if (num > 70) {
        return rewards.rare;
    } else if (num > 20) {
        return rewards.epic;
    } else if (num > 2) {
        return rewards.legendary;
    } else {
        return rewards.mythic;
    }
}

function populateShop() {
    const shopContainer = document.getElementById("shopContainer");

    for (let key in shopUpgrades) {
        let item = shopUpgrades[key];
        let shopButton = document.createElement("button");
        shopButton.classList.add("shopButton", "relative", `bg-[url(${item[1]})]`, "bg-cover", "bg-center", "w-[50px]", "h-[50px]", "border-1", "rounded-md");

        shopContainer.appendChild(shopButton);

        let toolTip = document.createElement("span");
        toolTip.classList.add("toolTip", "absolute", "z-1", "rounded-md", "p-5", "bg-gray-300/50", "backdrop-blur-sm");
        toolTip.textContent = "Upgrade "+ item[0];

        let upgrade = document.createElement("div");
        upgrade.classList.add("absolute", "bottom-0", "right-0", "pr-0.5");
        upgrade.textContent = 0;

        shopButton.appendChild(toolTip);
        shopButton.appendChild(upgrade);
    }
}
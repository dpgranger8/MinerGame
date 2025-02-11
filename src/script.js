let rewards = {
    common: ["common", 1, ["aquamarine", "lime"], 50],
    uncommon: ["uncommon", 5, ["aqua", "darkturquoise"], 25],
    rare: ["rare", 10, ["hotpink", "mediumvioletred"], 15],
    epic: ["epic", 50, ["lightCoral", "crimson"], 7],
    legendary: ["legendary", 100, ["yellow", "gold"], 2.9],
    mythic: ["mythic", 500, ["ghostwhite", "gainsboro"], 0.1]
};

(function() {
    const grid = document.getElementById("minegrid");
    const increaseHitbox = document.getElementById("extraPadding");
    const display = document.getElementById("display");

    populateRewards();

    for (let i = 0; i < 64; i++) {

        let state = {
            endAngle: 0,
            interval: null,
            gradientUnsetLight: "lemonchiffon",
            gradientUnsetDark: "moccasin",
            gradientProgressedLight: "aquamarine",
            gradientProgressedDark: "lime"
        };

        let button = document.createElement("button");
        button.classList.add("nodeButton");
        let margin = document.createElement("div");
        margin.classList.add("extraPadding", "p-1", "flex");

        button.id = i;
        button.style.background = `linear-gradient(${state.gradientUnsetLight}, ${state.gradientUnsetDark}`;
        // button.textContent = 1;

        margin.addEventListener("mouseover", () => {
            increaseGradient(button, display, state, 1, [[state.gradientUnsetLight, state.gradientUnsetDark], [state.gradientProgressedLight, state.gradientProgressedDark]], 100000)
        });

        margin.addEventListener("mouseleave", () => {
            decreaseGradient(button, state, 50, [[state.gradientUnsetLight, state.gradientUnsetDark], [state.gradientProgressedLight, state.gradientProgressedDark]])
        })

        grid.appendChild(margin);
        margin.appendChild(button);
    }
})();

function increaseGradient(button, display, state, ms, [[gradientUnset1, gradientUnset2], [gradientProgressed1, gradientProgressed2]], bonus) {
    clearInterval(state.interval)
    state.interval = undefined
    state.interval = setInterval(() => {
        state.endAngle += 1;
        button.style.background = `conic-gradient(${gradientProgressed1} 0deg, ${gradientProgressed2} ${state.endAngle}deg, ${gradientUnset1} ${state.endAngle}deg, ${gradientUnset2} 360deg)`;
        if (state.endAngle >= 360) {
            state.endAngle = 0;
            let currentValue = parseInt(display.textContent);
            display.textContent = currentValue + bonus;
            bonusToast(button, bonus)
        }
    }, ms);
}

function decreaseGradient(button, state, ms, [[gradientUnset1, gradientUnset2], [gradientProgressed1, gradientProgressed2]]) {
    if (state.interval) {
        clearInterval(state.interval);
        state.interval = undefined;
        state.interval = setInterval(() => {
            state.endAngle -= 1;
            button.style.background = `conic-gradient(${gradientProgressed1} 0deg, ${gradientProgressed2} ${state.endAngle}deg, ${gradientUnset1} ${state.endAngle}deg, ${gradientUnset2} 360deg)`;
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
    return Math.floor(Math.random() * (max - min)) + min;
}

function capitalize(str) {
    if (!str) {
      return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function populateRewards() {
    const rewardsContainer = document.getElementById("rewards");
    let newelement = document.createElement("h1");
    newelement.textContent = "hello";

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
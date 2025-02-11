(function() {
    const grid = document.getElementById("minegrid");
    const increaseHitbox = document.getElementById("extraPadding");
    const display = document.getElementById("display");

    for (let i = 0; i < 64; i++) {

        let state = {
            endAngle: 0,
            interval: null,
            gradientUnsetLight: "lemonchiffon",
            gradientUnsetDark: "moccasin",
            gradientProgressedLight: "aquamarine",
            gradientProgressedDark: "lime"
        };

        let bonus = Math.random

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

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
let state = {
    endAngle: 0,
    interval: null
};

(function() {
    const grid = document.getElementById("minegrid");
    const display = document.getElementById("display");

    for (let i = 0; i < 64; i++) {

        let button = document.createElement("button");
        button.classList.add("nodeButton");
        button.id = i;
        button.style.background = "linear-gradient(rgba(111, 111, 111, 0.2), rgba(111, 111, 111, 0.5)";
        // button.textContent = 1;

        button.addEventListener("mouseover", () => {
            increaseGradient(button, display, state, 10, [["rgba(111, 111, 111, 0.2)", "rgba(111, 111, 111, 0.5)"], ["aquamarine", "lime"]], 10)
        });

        button.addEventListener("mouseleave", () => {
            decreaseGradient(button, state, 50, [["rgba(111, 111, 111, 0.2)", "rgba(111, 111, 111, 0.5)"], ["aquamarine", "lime"]])
        })
        grid.appendChild(button);
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
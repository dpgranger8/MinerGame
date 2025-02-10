(function() {
    const grid = document.getElementById("minegrid");
    const display = document.getElementById("display");

    for (let i = 0; i < 64; i++) {

        let button = document.createElement("button");
        button.classList.add("nodeButton");
        button.id = i;
        button.style.background = "linear-gradient(rgba(111, 111, 111, 0.2), rgba(111, 111, 111, 0.5)";
        // button.textContent = 1;
        let endAngle = 0;
        let interval;

        button.addEventListener("mouseover", () => {
            clearInterval(interval)
            interval = undefined
            interval = setInterval(() => {
                endAngle += 1;
                button.style.background = `conic-gradient(aquamarine 0deg, lime ${endAngle}deg, rgba(111, 111, 111, 0.5) ${endAngle}deg, rgba(111, 111, 111, 0.2) 360deg)`;
                if (endAngle >= 360) {
                    endAngle = 0;
                    let currentValue = parseInt(display.textContent);
                    display.textContent = currentValue + 10;
                }
            }, 10);
        });

        button.addEventListener("mouseleave", () => {
            if (interval) {
                clearInterval(interval);
                interval = undefined;
                interval = setInterval(() => {
                    endAngle -= 1;
                    button.style.background = `conic-gradient(aquamarine 0deg, lime ${endAngle}deg, rgba(111, 111, 111, 0.5) ${endAngle}deg, rgba(111, 111, 111, 0.2) 360deg)`;
                    if (endAngle == 0) {
                        endAngle = 0;
                        clearInterval(interval)
                        interval = undefined
                        button.style.background = "linear-gradient(rgba(111, 111, 111, 0.2), rgba(111, 111, 111, 0.5)";
                    }
                }, 50)
            }
        })
        grid.appendChild(button);
    }
})();

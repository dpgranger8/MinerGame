(function() {
    const grid = document.getElementById("minegrid");

    for (i = 0; i < 20; i++) {

        const button = document.createElement("button");
        button.classList.add("nodebutton");
        button.textContent = "h"

        grid.appendChild(button);
    }
})();
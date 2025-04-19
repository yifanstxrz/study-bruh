document.getElementById("menuButton").addEventListener("click", function() {
    document.getElementById("fullMenu").style.top = "10%"; // Moves it down smoothly
});

document.getElementById("closeMenu").addEventListener("click", function() {
    document.getElementById("fullMenu").style.top = "-100vh"; // Slides it back up
});

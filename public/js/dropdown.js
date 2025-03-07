document.addEventListener("DOMContentLoaded", function () {
    const profileTrigger = document.getElementById("profileDropdownTrigger");
    const dropdownMenu = document.getElementById("profileDropdown");

    if (profileTrigger) {
        profileTrigger.addEventListener("click", function (event) {
            event.stopPropagation();
            dropdownMenu.classList.toggle("active");
        });
    }

    document.addEventListener("click", function (event) {
        if (!profileTrigger.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove("active");
        }
    });
});
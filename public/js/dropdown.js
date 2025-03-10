document.addEventListener("DOMContentLoaded", function () {
    const profileTriggers = document.querySelectorAll(".profileDropdownTrigger");
    const dropdownMenus = document.querySelectorAll(".profileDropdown");

    if (profileTriggers.length === 0 || dropdownMenus.length === 0) {
        return;
    }

    profileTriggers.forEach((profileTrigger, index) => {
        const dropdownMenu = dropdownMenus[index]; // Match the corresponding dropdown

        profileTrigger.addEventListener("click", function (event) {
            event.stopPropagation();
            dropdownMenu.classList.toggle("active");
        });

        document.addEventListener("click", function (event) {
            if (!profileTrigger.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.remove("active");
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const searchBar = document.querySelector(".searchBar");
    const communityDropdown = document.querySelector(".communityDropdown");
    const currentUser = new URLSearchParams(window.location.search).get("currentuser"); // ✅ Store currentUser at the top

    if (searchBar) {
        searchBar.addEventListener("input", updateSearchResults);
    }

    if (communityDropdown) {
        communityDropdown.addEventListener("change", updateSearchResults);
    }

    function updateSearchResults() {
        const searchQuery = searchBar ? searchBar.value : "";
        const selectedCommunity = communityDropdown ? communityDropdown.value : "";
        const queryParams = new URLSearchParams({
            searchBar: searchQuery,
            community: selectedCommunity,
        });

        if (currentUser && currentUser.trim() !== "") {
            queryParams.append("currentuser", currentUser);
        }

        fetch(`/explore/results?${queryParams.toString()}`) 
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const exploreContent = document.querySelector(".exploreContent");
                if (exploreContent && doc.querySelector(".exploreContent")) {
                    exploreContent.innerHTML = doc.querySelector(".exploreContent").innerHTML;
                } else {
                    console.warn("Could not find .exploreContent in the response.");
                }
            })
            .catch(error => console.error("Error fetching search results:", error));
    }
});



document.addEventListener("DOMContentLoaded", function () {
    const editForm = document.getElementById("editForm");
    if (editForm) {
        editForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const currentUser = new URLSearchParams(window.location.search).get("currentuser") || "";
            window.location.href = `/?currentuser=${encodeURIComponent(currentUser)}`;
        });
    }

    const editReplyForm = document.getElementById("editReplyForm");
    if (editReplyForm) {
        editReplyForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const currentUser = new URLSearchParams(window.location.search).get("currentuser") || "";
            window.location.href = `/?currentuser=${encodeURIComponent(currentUser)}`;
        });
    }

    const postForm = document.getElementById("postForm");
    if (postForm) {
        postForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const currentUser = new URLSearchParams(window.location.search).get("currentuser") || "";
            window.location.href = `/?currentuser=${encodeURIComponent(currentUser)}`;
        });
    }

    const editDetailsForm = document.getElementById("editDetailsForm");
    if (editDetailsForm) {
        editDetailsForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const currentUser = new URLSearchParams(window.location.search).get("currentuser") || "";
            window.location.href = `/profile/${encodeURIComponent(currentUser)}?currentuser=${encodeURIComponent(currentUser)}`;
        });
    }
});

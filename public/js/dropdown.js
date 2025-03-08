document.getElementById("postForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const currentUser = new URLSearchParams(window.location.search).get("currentuser");

    window.location.href = `/?currentuser=${encodeURIComponent(currentUser || '')}`;
});

document.addEventListener("DOMContentLoaded", function() {
    const searchBar = document.querySelector(".searchBar");
    const communityDropdown = document.querySelector(".communityDropdown");
    const currentUser = new URLSearchParams(window.location.search).get("currentuser");

    searchBar.addEventListener("input", () => updateSearchResults());
    communityDropdown.addEventListener("change", () => updateSearchResults());

    function updateSearchResults() {
        const searchQuery = searchBar.value;
        const selectedCommunity = communityDropdown.value;
        const queryParams = new URLSearchParams({
            searchBar: searchQuery,
            community: selectedCommunity,
        });

        if (currentUser) {
            queryParams.append("currentuser", currentUser);
        }

        fetch(`/explore/results?${queryParams.toString()}`) 
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                document.querySelector(".exploreContent").innerHTML = doc.querySelector(".exploreContent").innerHTML;
            })
            .catch(error => console.error("Error fetching search results:", error));
    }
});
document.addEventListener("DOMContentLoaded", function () {
    // ✅ Profile Dropdown
    const containers = document.querySelectorAll(".profile-container");
    console.log("Found containers:", containers.length);

    containers.forEach(container => {
        const trigger = container.querySelector(".profileDropdownTrigger");
        const dropdown = container.querySelector(".profileDropdown");

        console.log("Trigger found:", !!trigger);
        console.log("Dropdown found:", !!dropdown);

        if (trigger && dropdown) {
            trigger.addEventListener("click", function (event) {
                console.log("Profile image clicked!");
                event.stopPropagation();
                dropdown.classList.toggle("active");
            });

            document.addEventListener("click", function (event) {
                if (!container.contains(event.target)) {
                    dropdown.classList.remove("active");
                }
            });
        }
    });

    const searchForm = document.getElementById("searchForm");
    const searchBar = document.querySelector(".searchBar");
    const communityDropdown = document.querySelector(".communityDropdown");
    if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const searchQuery = searchBar?.value.trim() || "";
            const selectedCommunity = communityDropdown?.value || "";

            const queryParams = new URLSearchParams();
            if (searchQuery) queryParams.append("searchBar", searchQuery);
            if (selectedCommunity) queryParams.append("community", selectedCommunity);

            window.location.href = `/explore/results?${queryParams.toString()}`;
        });
    }


    // ✅ Edit Profile
    const editDetailsForm = document.getElementById("editDetailsForm");
    if (editDetailsForm) {
        editDetailsForm.addEventListener("submit", function (event) {
            event.preventDefault(); // ✅ Prevent default form submission
            const usernameInput = document.getElementById("userName");
            const newUsername = usernameInput ? usernameInput.value : "";
            window.location.href = `/profile/${encodeURIComponent(newUsername)}`;
        });
    }

    // ✅ Delete Buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const id = button.getAttribute('data-id');
            const type = button.getAttribute('data-type');
            const url = `/${type}/${id}`;

            fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`) {
                    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
                    window.location.href = `/`;
                } else {
                    alert(`Error deleting ${type}: ${data.error}`);
                    window.location.href = `/`;
                }
            })
            .catch(error => {
                alert(`Error: ${error}`);
                window.location.href = `/`;
            });
        });
    });
});

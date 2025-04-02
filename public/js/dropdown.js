document.addEventListener("DOMContentLoaded", function () {
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
});

document.addEventListener("DOMContentLoaded", function () {
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
});

document.addEventListener("DOMContentLoaded", function () {

    const editDetailsForm = document.getElementById("editDetailsForm");
    if (editDetailsForm) {
        editDetailsForm.addEventListener("submit", function (event) {
            const usernameInput = document.getElementById("userName");
            const newUsername = usernameInput ? usernameInput.value : "";
            window.location.href = `/profile/${encodeURIComponent(newUsername)}`;
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const deleteButtons = document.querySelectorAll('.delete-btn');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const id = button.getAttribute('data-id');
            const type = button.getAttribute('data-type');
            const url = `/${type}/${id}`;

            fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
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

document.addEventListener("DOMContentLoaded", function () {
    const pfpInput = document.getElementById("pfpInput");
    const pfpPreview = document.getElementById("pfpPreview");
    const editPfpText = document.getElementById("editPfpText");

    pfpPreview.addEventListener("click", showPfpInput);
    editPfpText.addEventListener("click", showPfpInput);

    function showPfpInput() {
        pfpInput.style.display = "block"; 
        pfpInput.focus(); 
    }

    pfpInput.addEventListener("input", function () {
        const newPfpUrl = pfpInput.value.trim();
        if (newPfpUrl) {
            pfpPreview.src = newPfpUrl;
        } else {
            pfpPreview.src = "https://cdn.pfps.gg/pfps/2301-default-2.png"; 
        }
    });

    document.addEventListener("click", function (event) {
        if (event.target !== pfpInput && event.target !== pfpPreview && event.target !== editPfpText) {
            pfpInput.style.display = "none"; 
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const upvoteButtons = document.querySelectorAll('.upvote-btn');
    const downvoteButtons = document.querySelectorAll('.downvote-btn');

    upvoteButtons.forEach(button => {
        button.addEventListener('click', async function () {
            const id = this.getAttribute('data-reply-id') || this.getAttribute('data-post-id');
            const type = this.hasAttribute('data-reply-id') ? 'reply' : 'post';

            try {
                const response = await fetch('/upvote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, type })
                });

                const result = await response.json();

                if (response.status === 401 && result.redirect) {
                    window.location.href = result.redirect; // Redirect to login page
                } else if (response.ok) {
                    window.location.reload(); // Reload the page to reflect changes
                } else {
                    console.error(result.message);
                }
            } catch (error) {
                console.error('Error upvoting:', error);
            }
        });
    });

    downvoteButtons.forEach(button => {
        button.addEventListener('click', async function () {
            const id = this.getAttribute('data-reply-id') || this.getAttribute('data-post-id');
            const type = this.hasAttribute('data-reply-id') ? 'reply' : 'post';

            try {
                const response = await fetch('/downvote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, type })
                });

                const result = await response.json();

                if (response.status === 401 && result.redirect) {
                    window.location.href = result.redirect; // Redirect to login page
                } else if (response.ok) {
                    window.location.reload(); // Reload the page to reflect changes
                } else {
                    console.error(result.message);
                }
            } catch (error) {
                console.error('Error downvoting:', error);
            }
        });
    });
});

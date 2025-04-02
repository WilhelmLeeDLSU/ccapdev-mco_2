document.addEventListener("DOMContentLoaded", function () {
    // Profile dropdown logic
    document.addEventListener("click", function (event) {
        const trigger = event.target.closest(".profileDropdownTrigger");
        const container = event.target.closest(".profile-container");

        document.querySelectorAll(".profileDropdown").forEach(dropdown => {
            dropdown.classList.remove("active");
        });

        if (trigger && container) {
            const dropdown = container.querySelector(".profileDropdown");
            if (dropdown) {
                event.stopPropagation();
                dropdown.classList.toggle("active");
            }
        }
    });

    // Search form logic
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

    // Delete button logic
    const deleteButtons = document.querySelectorAll('.delete-btn');

deleteButtons.forEach(button => {
    button.addEventListener('click', function (event) {
        event.preventDefault();

        const id = button.getAttribute('data-id');
        const type = button.getAttribute('data-type');

        // Construct URL based on type
        const url = `/${type}/${id}/delete`; // Use POST request to mark as deleted

        // Send POST request to update the "deleted" flag
        fetch(url, {
            method: 'POST', // Use POST to mark as deleted
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === `${type.charAt(0).toUpperCase() + type.slice(1)} marked as deleted`) {
                alert(`${type.charAt(0).toUpperCase() + type.slice(1)} marked as deleted successfully`);
                window.location.href = `/`; // Redirect after success
            } else {
                alert(`Error deleting ${type}: ${data.error}`);
                window.location.href = `/`; // Redirect after error
            }
        })
        .catch(error => {
            alert(`Error: ${error}`);
            window.location.href = `/`; // Redirect on error
        });
    });
});



    // Upvote button logic
    const upvoteButtons = document.querySelectorAll('.upvote-btn');
    upvoteButtons.forEach(button => {
        button.removeEventListener('click', handleUpvote); // Remove any existing listener (optional safeguard)
        button.addEventListener('click', handleUpvote);
    });

    function handleUpvote(event) {
        const button = event.currentTarget;
        const id = button.getAttribute('data-reply-id') || button.getAttribute('data-post-id');
        const type = button.hasAttribute('data-reply-id') ? 'reply' : 'post';

        fetch('/upvote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, type })
        })
        .then(response => response.json())
        .then(result => {
            if (result.redirect) {
                window.location.href = result.redirect; // Redirect to login if unauthenticated
            } else if (result.message === 'Upvoted successfully') {
                window.location.reload(); // Reload on success
            } else {
                console.error(result.message);
            }
        })
        .catch(error => console.error('Error upvoting:', error));
    }

    // Downvote button logic
    const downvoteButtons = document.querySelectorAll('.downvote-btn');
    downvoteButtons.forEach(button => {
        button.removeEventListener('click', handleDownvote); // Remove any existing listener (optional safeguard)
        button.addEventListener('click', handleDownvote);
    });

    function handleDownvote(event) {
        const button = event.currentTarget;
        const id = button.getAttribute('data-reply-id') || button.getAttribute('data-post-id');
        const type = button.hasAttribute('data-reply-id') ? 'reply' : 'post';

        fetch('/downvote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, type })
        })
        .then(response => response.json())
        .then(result => {
            if (result.redirect) {
                window.location.href = result.redirect; // Redirect to login if unauthenticated
            } else if (result.message === 'Downvoted successfully') {
                window.location.reload(); // Reload on success
            } else {
                console.error(result.message);
            }
        })
        .catch(error => console.error('Error downvoting:', error));
    }

    // Profile picture input logic
    const pfpInput = document.getElementById("pfpInput");
    const pfpPreview = document.getElementById("pfpPreview");
    const editPfpText = document.getElementById("editPfpText");

    pfpPreview?.addEventListener("click", showPfpInput);
    editPfpText?.addEventListener("click", showPfpInput);

    function showPfpInput() {
        pfpInput.style.display = "block";
        pfpInput.focus();
    }

    pfpInput?.addEventListener("input", function () {
        const newPfpUrl = pfpInput.value.trim();
        pfpPreview.src = newPfpUrl || "https://cdn.pfps.gg/pfps/2301-default-2.png";
    });

    document.addEventListener("click", function (event) {
        if (event.target !== pfpInput && event.target !== pfpPreview && event.target !== editPfpText) {
            pfpInput.style.display = "none";
        }
    });
});
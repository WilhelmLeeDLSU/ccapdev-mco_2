document.getElementById("postForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const currentUser = new URLSearchParams(window.location.search).get("currentuser");

    window.location.href = `/?currentuser=${encodeURIComponent(currentUser || '')}`;
});

document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded!"); // ✅ Debugging

    const postForm = document.getElementById("postForm");

    if (!postForm) {
        console.error("Error: Form not found!");
        return; // Exit script if the form isn't found
    }

    console.log("Form detected:", postForm); // ✅ Debugging

    postForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // ✅ Prevent default form submission
        console.log("Submit button clicked!"); // ✅ Debugging

        const formData = {
            postTitle: document.querySelector(".postTitle").value.trim(),
            postDesc: document.querySelector("#postDesc").value.trim(),
            postCommunity: document.querySelector("#postCommunity").value
        };

        console.log("Form data:", formData); // ✅ Debugging

        // Ensure the form has values
        if (!formData.postTitle || !formData.postDesc || !formData.postCommunity) {
            console.error("Error: Missing form fields!");
            return;
        }

        try {
            const response = await fetch("/newpost", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                console.log("Post created successfully!");
                window.location.href = "/explore"; // ✅ Redirect after success
            } else {
                console.error("Failed to create post. Status:", response.status);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    });
});

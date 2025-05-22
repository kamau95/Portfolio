document.getElementById("projectForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Form submission triggered");

  const form = e.target;
  const formData = new FormData(form);
  console.log("FormData:", formData);

  const errorDiv = document.getElementById("error-message");
  const successDiv = document.getElementById("success-message");
  const submitButton = document.getElementById("submitButton");
  const loadingSpinner = document.getElementById("loadingSpinner");

  // Reset messages and show spinner
  errorDiv.style.display = "none";
  successDiv.style.display = "none";
  submitButton.disabled = true;
  loadingSpinner.style.display = "block";

  try {
    const response = await fetch("/projects", {
      method: "POST",
      body: formData,
    });
    const responseData = await response.json();
    console.log("Response status:", response.status, "Response data:", responseData);

    if (!response.ok) {
      throw new Error(responseData.error || "Unknown error");
    }

    successDiv.textContent = responseData.message || "Project added successfully";
    successDiv.style.display = "block";
    setTimeout(() => {
      window.location.href = "/projects";
    }, 1500); // Redirect after 1.5s
  } catch (err) {
    console.error("Error:", err);
    errorDiv.textContent = err.message || "Unable to create project, try again";
    errorDiv.style.display = "block";
  } finally {
    submitButton.disabled = false;
    loadingSpinner.style.display = "none";
  }
});
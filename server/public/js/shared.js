export function displayError(formId, message, errors = []) {
    const errorContainer = document.getElementById("error-container") || document.createElement("div");
    errorContainer.id = "error-container";
    errorContainer.style.color = "red";
    errorContainer.innerHTML = message;

    if (errors.length > 0) {
        const errorList = errors.map(err => `<li>${err.msg}</li>`).join("");
        errorContainer.innerHTML += `<ul>${errorList}</ul>`;
    }

    const form = document.getElementById(formId);
    if (form) {
        form.prepend(errorContainer);
    } else {
        console.error(`Form with ID ${formId} not found`);
    }
}
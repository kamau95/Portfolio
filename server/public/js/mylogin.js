import { displayError } from './shared.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) {
        console.error('Login form not found. Check if ID "login-form" exists in the HTML.');
        return;
    }

    console.log('Attaching login form event listener');
    loginForm.addEventListener('submit', async (e) => {
        console.log('Form submitted, preventing default');
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const submitButton = loginForm.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = true;

        try {
            console.log('Sending login request');
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            console.log('Received response:', response);
            const loginResult = await response.json();
            console.log('Parsed result:', loginResult);

            if (loginResult.success) {
                console.log('Redirecting to:', loginResult.redirect);
                loginForm.reset();
                window.location.href = loginResult.redirect;
            } else {
                displayError('login-form', loginResult.message || 'Login failed', loginResult.errors);
            }
        } catch (error) {
            console.error('Login fetch error:', error);
            displayError('login-form', 'An error occurred. Please try again.');
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
});
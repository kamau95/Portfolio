import { displayError } from './shared.js';

// Handle signup form submission
document.getElementById('signup-form').addEventListener('submit', (e) => {
  const firstname = document.getElementById('firstname').value;
  const surname = document.getElementById('surname').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Client-side validation
  const errors = [];
  if (!firstname || !surname || !email || !password) {
    errors.push({ msg: 'All fields are required' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    e.preventDefault();
    displayError('signup-form', 'Please fix the following errors:', errors);
    return;
  }

  // Let the form submit naturally to /signup
  // Backend will render signup.ejs for errors or redirect to /login for success
});
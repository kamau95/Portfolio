export function displayError(formId, message, errors = []) {
  let messageContainer = document.getElementById('message-container');
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    messageContainer.style.background = '#f8d7da';
    messageContainer.style.color = '#721c24';
    messageContainer.style.padding = '10px';
    messageContainer.style.margin = '10px 0';
    messageContainer.style.borderRadius = '4px';
  }

  messageContainer.innerHTML = message || '';

  if (errors.length > 0) {
    const errorList = errors.map(err => `<li>${err.msg}</li>`).join('');
    messageContainer.innerHTML += `<ul style="list-style: none; padding: 0; margin: 0;">${errorList}</ul>`;
  }

  const form = document.getElementById(formId);
  if (form) {
    form.prepend(messageContainer);
  } else {
    console.error(`Form with ID ${formId} not found`);
  }
}
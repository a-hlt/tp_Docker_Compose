/**
 * Validates a task title.
 * @param {any} title - The title of the task to validate.
 * @returns {{valid: boolean, error: string|null}}
 */
function validateTask(title) {
  if (title === null || title === undefined) {
    return { valid: false, error: 'Le titre est obligatoire.' };
  }
  
  if (typeof title !== 'string') {
    return { valid: false, error: 'Le titre doit être une chaîne de caractères.' };
  }
  
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Le titre ne peut pas être vide ou contenir uniquement des espaces.' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'Le titre ne peut pas dépasser 100 caractères.' };
  }
  
  return { valid: true, error: null };
}

module.exports = { validateTask };

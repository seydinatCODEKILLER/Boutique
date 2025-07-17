export const validators = {
  required: (value) => !!value?.trim(),
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^[0-9]{9}$/.test(value),
  minLength: (value, length) => value?.length >= length,
  passwordComplexity: (value) =>
    /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value),
  fileType: (file, types) => types.includes(file?.type),
};

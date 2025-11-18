export type TValidation = {
  isValid: boolean;
  message?: string;
};

export function validateEmail(email: string): boolean {
  const REG_EX: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return REG_EX.test(email);
}

export function validateFormField(field: string): TValidation {
  return field && field.trim() !== ""
    ? { isValid: true }
    : { isValid: false, message: "requiredField" };
}

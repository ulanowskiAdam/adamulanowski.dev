export interface ContactFields {
  name: string;
  email: string;
  message: string;
}
export type FieldErrors = Partial<Record<keyof ContactFields, string>>;
export const validEmail = (value: string) =>
  value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export function validateContact(fields: ContactFields): FieldErrors {
  const errors: FieldErrors = {};
  if (fields.name.length > 100) errors.name = 'Imię może mieć maksymalnie 100 znaków.';
  if (!fields.email.trim()) errors.email = 'Podaj adres e-mail.';
  else if (!validEmail(fields.email.trim())) errors.email = 'Podaj poprawny adres e-mail.';
  if (!fields.message.trim()) errors.message = 'Napisz, czego potrzebujesz.';
  else if (fields.message.length > 2000)
    errors.message = 'Wiadomość może mieć maksymalnie 2000 znaków.';
  return errors;
}

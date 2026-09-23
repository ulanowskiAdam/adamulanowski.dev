export const contactSources = [
  { value: 'google', label: 'Google' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'other-ai', label: 'Inny asystent AI' },
  { value: 'recommendation', label: 'Polecenie' },
  { value: 'social', label: 'Media społecznościowe' },
  { value: 'other', label: 'Inne źródło' },
] as const;

export function contactSource(value: unknown) {
  return contactSources.find((source) => source.value === value);
}

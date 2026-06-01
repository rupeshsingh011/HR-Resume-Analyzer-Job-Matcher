export const supportedLanguages = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" }
];

export function getLanguageLabel(code) {
  return supportedLanguages.find((language) => language.code === code)?.label || "English";
}

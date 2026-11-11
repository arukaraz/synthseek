function isDigits(part: string): boolean {
  return part.length > 0 && [...part].every((character) => character >= "0" && character <= "9");
}

export function isBareVersion(value: string): boolean {
  const parts = value.split(".");
  return parts.length === 3 && parts.every(isDigits);
}

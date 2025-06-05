export function capitalize(string: string): string {
  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
}

export function padStart(
  value: string | number,
  length: number,
  chars: string
): string {
  const valueString = value.toString();
  const diff = length - valueString.length;
  if (diff > 0) {
    return `${new Array(diff + 1).join(chars)}${value}`;
  }

  return valueString;
}

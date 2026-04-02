export const formatItemName = (name: string, size?: string) => {
  if (!size) return name;
  const normalizedSize = size.toLowerCase().trim();
  const isSingleSize = ["único", "unico", "pago único", "pago unico"].includes(normalizedSize);
  return isSingleSize ? name : `${name} (${size})`;
};

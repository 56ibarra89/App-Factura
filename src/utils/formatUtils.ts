export const formatItemName = (name: string, size?: string) => {
  if (!size) return name;
  const normalizedSize = size.toLowerCase().trim();
  const isSingleSize = ["único", "unico", "pago único", "pago unico"].includes(normalizedSize);
  return isSingleSize ? name : `${name} (${size})`;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'NIO',
  }).format(value);
};

export const formatTableName = (tableId: string | null | undefined, floorsConfig: Array<{id: number, name: string}>): string => {
  if (!tableId) return "--";
  const match = tableId.match(/^F(\d+)-M(\d+)$/);
  if (match) {
    const floorId = parseInt(match[1], 10);
    const mesaNum = match[2];
    const floor = floorsConfig.find(f => f.id === floorId);
    if (floor) {
      return `${floor.name} - Mesa ${mesaNum}`;
    }
    return `Planta ${floorId} - Mesa ${mesaNum}`;
  }
  return `Mesa ${tableId}`;
};

export const fakeAuth = async (
  username: string,
  password: string
): Promise<boolean> => {
  // Simulamos una autenticación simple para varios usuarios conocidos
  const allowedUsers = new Set(["admin", "fran", "engels", "sidney"]);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(allowedUsers.has(username) && password === "123456");
    }, 1000);
  });
};

export const fakePinAuth = async (
  pin: string
): Promise<string | null> => {
  // Simular la autenticación por PIN (por ejemplo, 1234 corresponde a "admin")
  const pinDictionary: Record<string, string> = {
    "1234": "admin",
    "4321": "fran",
    "0000": "engels",
    "1111": "sidney"
  };
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(pinDictionary[pin] || null);
    }, 1000);
  });
};

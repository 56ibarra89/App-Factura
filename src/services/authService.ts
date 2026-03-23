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

import { useState, useEffect } from "react";
import { UserAccount } from "../types/user";
import { logService } from "../services/logService";
import { useAuth } from "../context/AuthContext";

// Simulación de datos iniciales
const MOCK_INITIAL_USERS: UserAccount[] = [
  {
    id: "admin",
    username: "admin",
    firstName: "Administrador",
    lastName: "Principal",
    pin: "1234",
    password: "123456",
    role: "admin",
    isActive: true,
    createdAt: new Date(Date.now() - 1000000000).toISOString(),
    lastVisit: new Date().toISOString()
  },
  {
    id: "fran",
    username: "fran",
    firstName: "Fran",
    lastName: "Cajero",
    pin: "4321",
    password: "123456",
    role: "cajero",
    isActive: true,
    createdAt: new Date(Date.now() - 500000000).toISOString(),
    lastVisit: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "engels",
    username: "engels",
    firstName: "Engels",
    lastName: "Mesero",
    pin: "0000",
    password: "123456",
    role: "mesero",
    isActive: true,
    createdAt: new Date(Date.now() - 200000000).toISOString(),
  },
  {
    id: "sidney",
    username: "sidney",
    firstName: "Sidney",
    lastName: "Cocinero",
    pin: "1111",
    password: "123456",
    role: "cocinero",
    isActive: true,
    createdAt: new Date(Date.now() - 100000000).toISOString(),
  }
];

export function useAccountManager() {
  const { username: adminUser, role: adminRole } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar usuarios al inicio
  useEffect(() => {
    setLoading(true);
    const storedUsers = localStorage.getItem("app_factura_users");
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (e) {
        setUsers(MOCK_INITIAL_USERS);
      }
    } else {
      setUsers(MOCK_INITIAL_USERS);
      localStorage.setItem("app_factura_users", JSON.stringify(MOCK_INITIAL_USERS));
    }
    setLoading(false);
  }, []);

  const saveToStorage = (updatedUsers: UserAccount[]) => {
    localStorage.setItem("app_factura_users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const saveUser = (user: UserAccount) => {
    setLoading(true);
    setTimeout(() => { // Simular latencia
      const exists = users.find(u => u.id === user.id);
      let updatedUsers;
      if (exists) {
        updatedUsers = users.map(u => u.id === user.id ? user : u);
        logService.log(adminUser, adminRole, "USER_UPDATE", `Usuario actualizado: @${user.username} (${user.firstName} ${user.lastName})`);
      } else {
        updatedUsers = [...users, { ...user, createdAt: new Date().toISOString() }];
        logService.log(adminUser, adminRole, "USER_CREATE", `Nuevo usuario creado: @${user.username} (${user.firstName} ${user.lastName})`);
      }
      saveToStorage(updatedUsers);
      setLoading(false);
    }, 500);
  };

  const toggleUserStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    );
    if (user) {
      logService.log(adminUser, adminRole, "USER_UPDATE_STATUS", `Usuario @${user.username} ${!user.isActive ? "ACTIVADO" : "DESACTIVADO"}`);
    }
    saveToStorage(updatedUsers);
  };

  const deleteUser = (userId: string) => {
    // Evitar eliminar al admin principal
    if (userId === "admin") return;
    const user = users.find(u => u.id === userId);
    const updatedUsers = users.filter(u => u.id !== userId);
    if (user) {
      logService.log(adminUser, adminRole, "USER_DELETE", `Usuario eliminado permanentemente: @${user.username}`);
    }
    saveToStorage(updatedUsers);
  };

  return {
    users,
    loading,
    saveUser,
    toggleUserStatus,
    deleteUser
  };
}

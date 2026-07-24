import {
  Box,
  Paper,
  Tab,
  Tabs,
} from "@mui/material";
import type { UserAccount } from "../../types/user";
import { UserActivity } from "./UserActivity";
import { UserForm } from "./UserForm";

interface AccountsWorkspaceProps {
  selectedUser: UserAccount | null;
  tabIndex: number;
  onTabChange(index: number): void;
  onSave(user: UserAccount): void | Promise<void>;
  onToggleStatus(id: string): void;
  onDelete(id: string): void;
  onUnlock(id: string): void | Promise<void>;
}

export function AccountsWorkspace({
  selectedUser,
  tabIndex,
  onTabChange,
  onSave,
  onToggleStatus,
  onDelete,
  onUnlock,
}: AccountsWorkspaceProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderRadius: 6,
        boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        minHeight: { xs: "auto", md: "660px" },
      }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          px: 4,
          pt: 2,
          background: "action.hover",
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={(_, value) => onTabChange(value)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": {
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
              transition: "0.2s",
            },
          }}
        >
          <Tab
            label={
              selectedUser
                ? "Información de Cuenta"
                : "Ficha de Registro"
            }
          />
          <Tab
            label="Actividad Reciente"
            disabled={!selectedUser}
          />
        </Tabs>
      </Box>

      <Box sx={{ p: { xs: 1.5, md: 2 }, flex: 1 }}>
        {tabIndex === 0 && (
          <UserForm
            user={selectedUser}
            onSave={onSave}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onUnlock={onUnlock}
          />
        )}
        {tabIndex === 1 && selectedUser && (
          <UserActivity user={selectedUser} />
        )}
      </Box>
    </Paper>
  );
}

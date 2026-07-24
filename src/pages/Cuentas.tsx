import { Box, Grid } from "@mui/material";
import AccountMenu from "../components/AccountMenu";
import { BackButton } from "../components/BackButton";
import PageHeader from "../components/PageHeader";
import { AccountManagementDialogs } from "../components/cuentas/AccountManagementDialogs";
import { AccountsSidebar } from "../components/cuentas/AccountsSidebar";
import { AccountsWorkspace } from "../components/cuentas/AccountsWorkspace";
import { useAccountsWorkspace } from "../hooks/cuentas/useAccountsWorkspace";

export default function Cuentas() {
  const accounts = useAccountsWorkspace();

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        pt: 2,
        pb: 2,
        px: { xs: 2, md: 6 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PageHeader
        title="Directorio de Cuentas"
        startContent={<BackButton to="/admin" />}
        actions={<AccountMenu />}
      />

      <Grid container spacing={2} sx={{ mt: 1, flex: 1 }}>
        <Grid
          size={{ xs: 12, md: 4, lg: 3 }}
          sx={{
            position: "relative",
            minHeight: { xs: 400, md: "auto" },
          }}
        >
          <AccountsSidebar
            users={accounts.users}
            filteredUsers={accounts.filteredUsers}
            selectedUserId={accounts.selectedUserId}
            searchQuery={accounts.searchQuery}
            onSearchChange={accounts.setSearchQuery}
            onCreate={accounts.createUser}
            onSelect={accounts.selectUser}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <AccountsWorkspace
            selectedUser={accounts.selectedUser}
            tabIndex={accounts.tabIndex}
            onTabChange={accounts.setTabIndex}
            onSave={accounts.saveUser}
            onToggleStatus={accounts.toggleUserStatus}
            onDelete={accounts.requestDelete}
            onUnlock={accounts.unlockUser}
          />
        </Grid>
      </Grid>

      <AccountManagementDialogs
        deletion={accounts.deletion}
        feedback={accounts.feedback}
      />
    </Box>
  );
}

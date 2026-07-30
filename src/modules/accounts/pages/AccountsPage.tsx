import { Box, Grid } from "@mui/material";
import { BackButton, PageHeader } from "../../../shared/ui";
import AccountMenu from "../ui/AccountMenu";
import { AccountManagementDialogs } from "../ui/admin/AccountManagementDialogs";
import { AccountsSidebar } from "../ui/admin/AccountsSidebar";
import { AccountsWorkspace } from "../ui/admin/AccountsWorkspace";
import { useAccountsWorkspace } from "../hooks/useAccountsWorkspace";

export default function AccountsPage() {
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

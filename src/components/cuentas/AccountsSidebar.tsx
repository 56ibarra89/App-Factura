import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import type { UserAccount } from "../../types/user";
import {
  LOGIN_COLORS,
  LOGIN_SHADOWS,
} from "../../theme/loginTheme";
import { UserList } from "./UserList";

interface AccountsSidebarProps {
  users: UserAccount[];
  filteredUsers: UserAccount[];
  selectedUserId: string | null;
  searchQuery: string;
  onSearchChange(query: string): void;
  onCreate(): void;
  onSelect(id: string): void;
}

export function AccountsSidebar({
  users,
  filteredUsers,
  selectedUserId,
  searchQuery,
  onSearchChange,
  onCreate,
  onSelect,
}: AccountsSidebarProps) {
  return (
    <Box
      sx={{
        position: { md: "absolute" },
        inset: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h6"
          fontWeight="900"
          sx={{ opacity: 0.8 }}
        >
          Usuarios ({users.length})
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<PersonAddIcon />}
          onClick={onCreate}
          sx={{
            borderRadius: 4,
            bgcolor: LOGIN_COLORS.primary,
            fontWeight: "bold",
            boxShadow: LOGIN_SHADOWS.title,
          }}
        >
          Nuevo
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Buscar por nombre o rol..."
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={(event) =>
          onSearchChange(event.target.value)
        }
        sx={{
          mb: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Box
        sx={{
          borderRadius: 4,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          pr: 1,
        }}
      >
        <UserList
          users={filteredUsers}
          selectedUserId={selectedUserId}
          onSelectUser={onSelect}
        />
      </Box>
    </Box>
  );
}

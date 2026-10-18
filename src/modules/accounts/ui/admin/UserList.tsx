import { Box, Typography, Avatar, List, ListItemButton, Chip, alpha } from "@mui/material";
import {
  ROLE_LABELS,
} from "../../../auth";
import type { UserAccount } from "../../model/account.types";

interface UserListProps {
  users: UserAccount[];
  selectedUserId: string | null;
  onSelectUser: (id: string) => void;
}

export function UserList({ users, selectedUserId, onSelectUser }: UserListProps) {
  return (
    <List sx={{ width: '100%', padding: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {users.map((user) => {
        const isSelected = selectedUserId === user.id;
        return (
          <ListItemButton
            key={user.id}
            selected={isSelected}
            onClick={() => onSelectUser(user.id)}
            sx={{
              py: 1,
              px: 1.5,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              transition: 'background-color 120ms ease-out, border-color 120ms ease-out',
              bgcolor: isSelected
                ? (theme) => alpha(theme.palette.primary.main, 0.08)
                : 'transparent',
              borderLeft: '3px solid',
              borderLeftColor: isSelected ? 'primary.main' : 'transparent',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, isSelected ? 0.12 : 0.04),
              }
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: (theme) => !user.isActive
                  ? theme.palette.action.disabledBackground
                  : alpha(theme.palette.primary.main, 0.12),
                color: !user.isActive ? "text.disabled" : "primary.main",
                fontSize: '1.2rem',
                fontWeight: 700,
              }}
            >
              {user.firstName.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={isSelected ? "bold" : "medium"}
                color={!user.isActive ? "text.disabled" : "text.primary"}
                noWrap
              >
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }} noWrap>
                @{user.username}
              </Typography>
            </Box>

            <Box display="flex" flexDirection="column" alignItems="flex-end">
              {user.isActive ? (
                <Chip
                  label={ROLE_LABELS[user.role]}
                  size="small"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.65rem",
                    height: 20,
                    bgcolor: "action.hover",
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
              ) : (
                <Chip
                  label="SUSP."
                  size="small"
                  color="error"
                  variant="filled"
                  sx={{ fontWeight: "bold", fontSize: "0.65rem", height: 20 }}
                />
              )}
            </Box>
          </ListItemButton>
        );
      })}
    </List>
  );
}


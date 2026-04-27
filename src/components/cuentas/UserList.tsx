import { Box, Typography, Avatar, List, ListItemButton, Chip, alpha } from "@mui/material";
import { UserAccount, ROLE_LABELS } from "../../types/user";

// Gradientes premium para los roles
const ROLE_GRADIENTS: Record<string, string> = {
  admin: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)",
  cajero: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  mesero: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  cocinero: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
};

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
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              transition: 'all 0.2s ease-in-out',
              bgcolor: isSelected ? alpha('#1976d2', 0.08) : 'transparent', // #1976d2 is roughly primary.main
              borderLeft: '4px solid',
              borderColor: isSelected ? 'primary.main' : 'transparent',
              '&:hover': {
                bgcolor: isSelected ? alpha('#1976d2', 0.12) : alpha('#000000', 0.04),
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                background: !user.isActive ? 'linear-gradient(135deg, #9e9e9e 0%, #616161 100%)' : ROLE_GRADIENTS[user.role],
                color: "white",
                fontSize: '1.2rem',
                fontWeight: 'bold',
                boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
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
                    background: alpha('#000000', 0.05),
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

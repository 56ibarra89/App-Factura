import { Box, Typography, Avatar, List, ListItemButton, Chip, alpha, Paper } from "@mui/material";
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
    <List sx={{ width: '100%', padding: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {users.map((user) => {
        const isSelected = selectedUserId === user.id;
        return (
          <Paper
            key={user.id}
            elevation={isSelected ? 6 : 1}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              bgcolor: isSelected ? 'white' : alpha('#ffffff', 0.8),
              border: '1px solid',
              borderColor: isSelected ? 'primary.main' : 'transparent',
              '&:hover': {
                transform: 'scale(1.02) translateY(-2px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                bgcolor: 'white'
              }
            }}
          >
            <ListItemButton
              selected={isSelected}
              onClick={() => onSelectUser(user.id)}
              sx={{ py: 2, px: 2, display: 'flex', alignItems: 'center', gap: 2 }}
            >
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56,
                  background: !user.isActive ? 'linear-gradient(135deg, #9e9e9e 0%, #616161 100%)' : ROLE_GRADIENTS[user.role],
                  color: "white",
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                {user.firstName.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" color={!user.isActive ? "text.disabled" : "text.primary"}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                  @{user.username}
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                {user.isActive ? (
                  <Chip 
                    label={ROLE_LABELS[user.role]} 
                    size="small" 
                    sx={{ 
                      fontWeight: "bold", 
                      fontSize: "0.7rem", 
                      height: 22,
                      background: alpha('#000000', 0.05),
                      color: 'text.primary',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                ) : (
                  <Chip 
                    label="SUSPENDIDO" 
                    size="small" 
                    color="error" 
                    variant="filled"
                    sx={{ fontWeight: "bold", fontSize: "0.7rem", height: 22 }}
                  />
                )}
              </Box>
            </ListItemButton>
          </Paper>
        );
      })}
    </List>
  );
}

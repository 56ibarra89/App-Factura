import React, { useState } from 'react';
import { 
  Badge, 
  IconButton, 
  Popover, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Box, 
  Divider,
  useTheme
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from "../../auth";

export default function NotificationsMenu() {
  const { role } = useAuth();
  const theme = useTheme();
  const { notifications, unreadCount, removeNotification, markAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  if (
    role !== 'admin' &&
    role !== 'cajero' &&
    role !== 'cajero_principal' &&
    role !== 'despachador' &&
    role !== 'mesero' &&
    role !== 'motorizado'
  ) {
    return null;
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 350, maxHeight: 400, mt: 1, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }
        }}
      >
        <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? 'white' : 'primary.main' }}>
            Notificaciones
          </Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'white' }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText primary="No tienes notificaciones pendientes." />
            </ListItem>
          ) : (
            notifications.map((notif) => (
              <React.Fragment key={notif.id}>
                <ListItem 
                  alignItems="flex-start" 
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => removeNotification(notif.id)} size="small">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{ 
                    bgcolor: notif.isRead 
                      ? (theme.palette.mode === 'dark' ? 'transparent' : 'transparent')
                      : (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
                    mb: 0.5,
                    opacity: notif.isRead ? 0.7 : 1,
                    '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.100' }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {notif.title}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {notif.message}
                        </Typography>
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block', mb: notif.isRead ? 0 : 1 }}>
                          {new Date(notif.createdAt).toLocaleString()}
                        </Typography>
                        {!notif.isRead && (
                          <Typography
                            component="span"
                            variant="body2"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            sx={{ 
                              cursor: 'pointer', 
                              textDecoration: 'underline', 
                              fontWeight: 'bold',
                              color: theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
                              '&:hover': { color: theme.palette.primary.main }
                            }}
                          >
                            Marcar leída
                          </Typography>
                        )}
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          )}
        </List>
      </Popover>
    </>
  );
}

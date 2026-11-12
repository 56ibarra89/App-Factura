import {
  Avatar,
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { UserAccount } from "../../model/account.types";
import { LOGIN_COLORS } from "../../../../shared/theme";

interface UserMultiSelectProps {
  label: string;
  users: UserAccount[];
  selectedUserIds: string[];
  emptyLabel: string;
  onChange(userIds: string[]): void;
}

export function UserMultiSelect({
  label,
  users,
  selectedUserIds,
  emptyLabel,
  onChange,
}: UserMultiSelectProps) {
  const handleChange = (
    event: SelectChangeEvent<string[]>,
  ) => {
    const value = event.target.value;
    onChange(
      typeof value === "string" ? value.split(",") : value,
    );
  };

  const renderSelection = (selected: string[]) => {
    if (selected.length === 0) {
      return <em>{emptyLabel}</em>;
    }
    return selected
      .map((id) => {
        const user = users.find((item) => item.id === id);
        return user ? user.firstName : id;
      })
      .join(", ");
  };

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select<string[]>
        multiple
        value={selectedUserIds}
        label={label}
        onChange={handleChange}
        renderValue={renderSelection}
        sx={{ borderRadius: 2 }}
      >
        {users.map((user) => (
          <MenuItem key={user.id} value={user.id}>
            <Checkbox
              checked={selectedUserIds.includes(user.id)}
            />
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: "0.8rem",
                  bgcolor: LOGIN_COLORS.primary,
                }}
              >
                {user.firstName[0]}
              </Avatar>
              <ListItemText
                primary={`${user.firstName} ${user.lastName} (@${user.username})`}
              />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

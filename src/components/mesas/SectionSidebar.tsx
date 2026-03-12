import { Box, List, ListItem, ListItemButton, ListItemText } from "@mui/material";

interface Props {
  floors: string[];
  selectedFloor: number;
  onChangeFloor: (floor: number) => void;
}

export default function SectionSidebar({
  floors,
  selectedFloor,
  onChangeFloor,
}: Props) {
  return (
    <Box sx={{ width: 220, borderRight: "1px solid #ccc", bgcolor: "#ebebeb" }}>
      <List>
        {floors.map((floor, index) => (
          <ListItem disablePadding key={floor}>
            <ListItemButton
              selected={selectedFloor === index + 1}
              onClick={() => onChangeFloor(index + 1)}
            >
              <ListItemText primary={floor} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

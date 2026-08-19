import { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;

  actions?: ReactNode;

  startContent?: ReactNode;
}

const PageHeader = ({ title, actions, startContent }: PageHeaderProps) => (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    mb={5}
    px={2}
  >
    <Box display="flex" alignItems="center" gap={2}>
      {startContent}
      <Typography
        variant="h5"
        fontWeight="800"
        color="text.primary"
        sx={{ letterSpacing: "-0.5px", display: { xs: "none", sm: "block" } }}
      >
        {title}
      </Typography>
    </Box>
    {actions && <Box>{actions}</Box>}
  </Box>
);

export default PageHeader;


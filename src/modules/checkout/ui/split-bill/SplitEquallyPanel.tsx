import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import PeopleIcon from "@mui/icons-material/People";
import {
  Avatar,
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { formatCurrency } from "../../../../shared/format";
import type { SplitBillCheckoutSelection } from "../../model/splitBill.types";

interface EqualAccount {
  id: string;
  name: string;
  amount: number;
}

interface SplitEquallyPanelProps {
  peopleCount: number;
  accounts: EqualAccount[];
  onPeopleCountChange(count: number): void;
  onCheckout(selection: SplitBillCheckoutSelection): void;
}

export default function SplitEquallyPanel({
  peopleCount,
  accounts,
  onPeopleCountChange,
  onCheckout,
}: SplitEquallyPanelProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      onPeopleCountChange(Math.min(100, Math.max(1, val)));
    }
  };

  const handleDecrement = () => {
    if (peopleCount > 2) {
      onPeopleCountChange(peopleCount - 1);
    }
  };

  const handleIncrement = () => {
    if (peopleCount < 100) {
      onPeopleCountChange(peopleCount + 1);
    }
  };

  return (
    <Box sx={{ textAlign: "center", py: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        ¿Entre cuántas personas deseas dividir la cuenta?
      </Typography>

      {}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1.5,
          mb: 3,
        }}
      >
        <IconButton
          onClick={handleDecrement}
          disabled={peopleCount <= 2}
          color="primary"
          sx={{ border: "1px solid", borderColor: "divider", p: 1.2 }}
        >
          <RemoveIcon />
        </IconButton>

        <TextField
          type="number"
          value={peopleCount || ""}
          onChange={handleInputChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PeopleIcon color="primary" />
                </InputAdornment>
              ),
              inputProps: {
                min: 2,
                max: 100,
                style: { textAlign: "center", fontWeight: 800, fontSize: "1.3rem" },
              },
            },
          }}
          sx={{ width: 170 }}
        />

        <IconButton
          onClick={handleIncrement}
          disabled={peopleCount >= 100}
          color="primary"
          sx={{ border: "1px solid", borderColor: "divider", p: 1.2 }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      <Grid container spacing={2} justifyContent="center">
        {accounts.map((account, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={account.id}>
            <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
              <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 1 }}>
                {index + 1}
              </Avatar>
              <Typography variant="subtitle1" fontWeight={700}>
                {account.name}
              </Typography>
              <Typography variant="h5" fontWeight={800} color="success.main" my={1}>
                {formatCurrency(account.amount)}
              </Typography>
              <Button
                fullWidth
                size="small"
                variant="contained"
                color="success"
                startIcon={<ShoppingCartCheckoutIcon />}
                onClick={() =>
                  onCheckout({
                    mode: "equal",
                    accountId: account.id,
                    accountName: account.name,
                    amount: account.amount,
                  })
                }
                sx={{ fontWeight: 700, textTransform: "none", mt: 1 }}
              >
                Preparar esta parte
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}


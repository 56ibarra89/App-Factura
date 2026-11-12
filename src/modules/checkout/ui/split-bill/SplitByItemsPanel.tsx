import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { OrderItem } from "../../../orders";
import { formatCurrency } from "../../../../shared/format";
import { calculateOrderItemAmount } from "../../model/splitBillDomain";
import type {
  SplitBillAccount,
  SplitBillAccountTotal,
  SplitBillCheckoutSelection,
} from "../../model/splitBill.types";

interface SplitByItemsPanelProps {
  accounts: SplitBillAccount[];
  accountTotals: SplitBillAccountTotal[];
  activeAccountId: string;
  unassignedItems: OrderItem[];
  unassignedTotal: number;
  onSelectAccount(accountId: string): void;
  onAddAccount(): void;
  onRemoveAccount(accountId: string): void;
  onAssignItem(itemIndex: number, accountId: string, assignAll?: boolean): void;
  onUnassignItem(accountId: string, itemIndex: number, unassignAll?: boolean): void;
  onCheckout(selection: SplitBillCheckoutSelection): void;
}

export default function SplitByItemsPanel({
  accounts,
  accountTotals,
  activeAccountId,
  unassignedItems,
  unassignedTotal,
  onSelectAccount,
  onAddAccount,
  onRemoveAccount,
  onAssignItem,
  onUnassignItem,
  onCheckout,
}: SplitByItemsPanelProps) {
  const activeAccount = accounts.find(
    (account) => account.id === activeAccountId,
  );
  const activeTotal = accountTotals.find(
    (account) => account.id === activeAccountId,
  )?.total ?? 0;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card
          variant="outlined"
          sx={{ borderRadius: 2, height: "100%" }}
        >
          <CardContent>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="text.secondary"
              mb={1}
            >
              Productos pendientes ({unassignedItems.length})
            </Typography>

            {unassignedItems.length === 0 ? (
              <Alert severity="success">Todos los productos están asignados.</Alert>
            ) : (
              <>
                <Stack spacing={1} sx={{ maxHeight: 320, overflowY: "auto" }}>
                  {unassignedItems.map((item, index) => (
                    <Paper
                      key={`${item.id ?? item.name}-${index}`}
                      variant="outlined"
                      sx={{
                        p: 1.25,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        borderRadius: 1.5,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {item.quantity}x {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(calculateOrderItemAmount(item))}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                        {item.quantity > 1 ? (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => onAssignItem(index, activeAccountId, false)}
                              sx={{ textTransform: "none", minWidth: 40, px: 1, py: 0.3, fontWeight: 700 }}
                            >
                              +1
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => onAssignItem(index, activeAccountId, true)}
                              sx={{ textTransform: "none", px: 1, py: 0.3, fontSize: "0.75rem" }}
                            >
                              Todos
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            endIcon={<ArrowForwardIcon fontSize="small" />}
                            onClick={() => onAssignItem(index, activeAccountId, false)}
                            sx={{ textTransform: "none" }}
                          >
                            Asignar
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mt={1}
                >
                  Pendiente por distribuir: {formatCurrency(unassignedTotal)}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 1.5,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Personas / subcuentas
          </Typography>
          <Button
            size="small"
            startIcon={<PersonAddIcon />}
            variant="outlined"
            onClick={onAddAccount}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Agregar persona
          </Button>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2, overflowX: "auto", pb: 0.5 }}
        >
          {accounts.map((account) => {
            const total = accountTotals.find(
              (candidate) => candidate.id === account.id,
            )?.total ?? 0;
            const isActive = activeAccountId === account.id;

            return (
              <Chip
                key={account.id}
                label={`${account.name} (${formatCurrency(total)})`}
                color={isActive ? "primary" : "default"}
                onClick={() => onSelectAccount(account.id)}
                onDelete={
                  accounts.length > 1
                    ? () => onRemoveAccount(account.id)
                    : undefined
                }
                sx={{ fontWeight: isActive ? 700 : 500 }}
              />
            );
          })}
        </Stack>

        {activeAccount && (
          <Card
            variant="outlined"
            sx={{ borderColor: "primary.light", borderWidth: 2, borderRadius: 2 }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  {activeAccount.name}
                </Typography>
                <Chip
                  label={`Total: ${formatCurrency(activeTotal)}`}
                  color="success"
                  sx={{ fontWeight: 800 }}
                />
              </Box>

              {activeAccount.items.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic", my: 2 }}
                >
                  Selecciona productos de la lista para esta persona.
                </Typography>
              ) : (
                <Stack spacing={1} sx={{ maxHeight: 200, overflowY: "auto" }}>
                  {activeAccount.items.map((item, index) => (
                    <Box
                      key={`${item.id ?? item.name}-${index}`}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        bgcolor: "action.hover",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2">
                        {item.quantity}x {item.name} ({formatCurrency(calculateOrderItemAmount(item))})
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                        {item.quantity > 1 && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => onUnassignItem(activeAccount.id, index, false)}
                            sx={{ minWidth: "auto", px: 1, py: 0.2, fontSize: "0.75rem", textTransform: "none", fontWeight: 700 }}
                          >
                            -1
                          </Button>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          aria-label={`Quitar ${item.name} de ${activeAccount.name}`}
                          onClick={() => onUnassignItem(activeAccount.id, index, true)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}

              <Divider sx={{ my: 1.5 }} />
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<ShoppingCartCheckoutIcon />}
                disabled={activeAccount.items.length === 0 || activeTotal <= 0}
                onClick={() =>
                  onCheckout({
                    mode: "items",
                    accountId: activeAccount.id,
                    accountName: activeAccount.name,
                    amount: activeTotal,
                    items: activeAccount.items,
                  })
                }
                sx={{ fontWeight: 800, textTransform: "none" }}
              >
                Preparar cobro de {activeAccount.name} ({formatCurrency(activeTotal)})
              </Button>
            </CardContent>
          </Card>
        )}
      </Grid>
    </Grid>
  );
}

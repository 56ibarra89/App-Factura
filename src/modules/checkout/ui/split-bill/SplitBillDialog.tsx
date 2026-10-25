import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import CloseIcon from "@mui/icons-material/Close";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  isSplitBillCreditOrderItem,
  type Order,
} from "../../../orders";
import { formatCurrency } from "../../../../shared/format";
import { useSplitBill } from "../../hooks/useSplitBill";
import type {
  SplitBillCheckoutSelection,
  SplitBillMode,
} from "../../model/splitBill.types";
import SplitByItemsPanel from "./SplitByItemsPanel";
import SplitCustomAmountsPanel from "./SplitCustomAmountsPanel";
import SplitEquallyPanel from "./SplitEquallyPanel";

interface SplitBillDialogProps {
  open: boolean;
  onClose(): void;
  tableId?: string | null;
  order?: Order | null;
  onCheckout(selection: SplitBillCheckoutSelection): void;
  completedSelection?: SplitBillCheckoutSelection | null;
}

interface SplitBillDialogContentProps {
  order: Order;
  onCheckout(selection: SplitBillCheckoutSelection): void;
  completedSelection?: SplitBillCheckoutSelection | null;
}

function SplitBillDialogContent({
  order,
  onCheckout,
  completedSelection,
}: SplitBillDialogContentProps) {
  const splitBill = useSplitBill({
    items: order.items,
    totalAmount: order.total,
  });
  const { completeCheckout, mode, setMode } = splitBill;
  const appliedCompletion = useRef<SplitBillCheckoutSelection | null>(null);
  const hasAmountCredits = order.items.some(isSplitBillCreditOrderItem);

  useEffect(() => {
    if (hasAmountCredits && mode === "items") {
      setMode("equal");
    }
  }, [hasAmountCredits, mode, setMode]);

  useEffect(() => {
    if (
      completedSelection &&
      appliedCompletion.current !== completedSelection
    ) {
      completeCheckout(completedSelection);
      appliedCompletion.current = completedSelection;
    }
  }, [completedSelection, completeCheckout]);

  return (
    <>
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={mode}
          onChange={(_, value: SplitBillMode) => setMode(value)}
          variant="fullWidth"
        >
          <Tab
            icon={<FastfoodIcon />}
            iconPosition="start"
            label="Por productos"
            value="items"
            disabled={hasAmountCredits}
            sx={{ fontWeight: 700, textTransform: "none" }}
          />
          <Tab
            icon={<EqualizerIcon />}
            iconPosition="start"
            label="Partes iguales"
            value="equal"
            sx={{ fontWeight: 700, textTransform: "none" }}
          />
          <Tab
            icon={<AttachMoneyIcon />}
            iconPosition="start"
            label="Monto personalizado"
            value="custom"
            sx={{ fontWeight: 700, textTransform: "none" }}
          />
        </Tabs>
      </Box>

      {mode === "items" && (
        <SplitByItemsPanel
          accounts={splitBill.accounts}
          accountTotals={splitBill.itemAccountTotals}
          activeAccountId={splitBill.activeAccountId}
          unassignedItems={splitBill.unassignedItems}
          unassignedTotal={splitBill.unassignedTotal}
          onSelectAccount={splitBill.setActiveAccountId}
          onAddAccount={splitBill.addAccount}
          onRemoveAccount={splitBill.removeAccount}
          onAssignItem={splitBill.assignItem}
          onUnassignItem={splitBill.unassignItem}
          onCheckout={onCheckout}
        />
      )}

      {mode === "equal" && (
        <SplitEquallyPanel
          peopleCount={splitBill.equalPeopleCount}
          accounts={splitBill.equalAccounts}
          onPeopleCountChange={splitBill.setEqualPeopleCount}
          onCheckout={onCheckout}
        />
      )}

      {mode === "custom" && (
        <SplitCustomAmountsPanel
          accounts={splitBill.accounts}
          assignedTotal={splitBill.customAssignedTotal}
          remaining={splitBill.customRemaining}
          isValid={splitBill.isCustomSplitValid}
          onAddAccount={splitBill.addAccount}
          onRemoveAccount={splitBill.removeAccount}
          onAmountChange={splitBill.setCustomAmount}
          onCheckout={onCheckout}
        />
      )}
    </>
  );
}

export default function SplitBillDialog({
  open,
  onClose,
  tableId,
  order,
  onCheckout,
  completedSelection,
}: SplitBillDialogProps) {
  const [openedOrderId, setOpenedOrderId] = useState<string | null>(null);
  useEffect(() => {
    if (open && order) setOpenedOrderId(order.id);
  }, [open, order]);

  if (!order || openedOrderId !== order.id) return null;

  const tableNumber = tableId ? tableId.split("-M")[1] || tableId : "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth keepMounted>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          py: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CallSplitIcon />
          <Typography variant="h6" fontWeight={700}>
            Dividir cuenta{tableNumber ? ` - Mesa ${tableNumber}` : ""}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={`Total: ${formatCurrency(order.total)}`}
            sx={{
              bgcolor: "primary.contrastText",
              color: "primary.main",
              fontWeight: 800,
            }}
          />
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="Cerrar división de cuenta"
            sx={{ color: "primary.contrastText" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "background.default" }}>
        <SplitBillDialogContent
          key={order.id}
          order={order}
          onCheckout={onCheckout}
          completedSelection={completedSelection}
        />
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          bgcolor: "background.paper",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Revisa la distribución antes de preparar cada cobro.
        </Typography>
        <Button variant="outlined" onClick={onClose} sx={{ textTransform: "none" }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

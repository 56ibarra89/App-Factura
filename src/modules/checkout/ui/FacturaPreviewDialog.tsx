import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
} from "@mui/material";
import type { OrderItem } from "../../orders";
import type { CheckoutFormValues } from "../model/checkout.types";
import type { Customer } from "../../customers";
import type { OrderType } from "../../orders";
import {
  PromocionesSelector,
  type AppliedPromotion,
} from "../../promotions";
import { buildSupplementalCartItems } from "../model/checkoutDomain";
import { useCheckoutDialog } from "../hooks/useCheckoutDialog";
import CustomerDeliverySection from "./CustomerDeliverySection";
import InvoiceSummary from "./InvoiceSummary";
import PackagingSection from "./PackagingSection";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { TicketPrint } from "../../invoices";

interface FacturaPreviewDialogProps {
  open: boolean;
  cart: OrderItem[];
  promotion?: AppliedPromotion | null;
  subTotal: number;
  discountAmount?: number;
  taxAmount: number;
  total: number;
  invoiceNumber?: string;
  onApplyPromotion?: (promotion: AppliedPromotion) => void;
  onRemovePromotion?: () => void;
  onClose: () => void;
  onConfirm: (values: CheckoutFormValues) => void | Promise<void>;
  title?: string;
  confirmText?: string;
  isTableMode?: boolean;
  disableRestoreFocus?: boolean;
  disableEnforceFocus?: boolean;
  initialCustomer?: Customer | null;
  initialPhone?: string;
  initialAddress?: string;
  initialOrderType?: OrderType;
  initialDriverId?: string;
  initialDeliveryCost?: number;
  initialCustomerTendered?: number;
  lockOrderType?: boolean;
  hideDeliveryOption?: boolean;
  cashierName?: string;
}

export default function FacturaPreviewDialog({
  open,
  cart,
  promotion,
  subTotal,
  discountAmount = 0,
  taxAmount,
  total,
  onApplyPromotion,
  onRemovePromotion,
  onClose,
  onConfirm,
  title = "Resumen de Factura",
  confirmText = "Confirmar pedido",
  isTableMode = false,
  disableRestoreFocus = false,
  disableEnforceFocus = false,
  initialCustomer = null,
  initialPhone = "",
  initialAddress = "",
  initialOrderType = "local",
  initialDriverId = "",
  initialDeliveryCost = 0,
  initialCustomerTendered,
  lockOrderType = false,
  hideDeliveryOption = false,
  invoiceNumber,
  cashierName,
}: FacturaPreviewDialogProps) {
  const checkout = useCheckoutDialog({
    open,
    total,
    isTableMode,
    initialCustomer,
    initialPhone,
    initialAddress,
    initialOrderType,
    initialDriverId,
    initialDeliveryCost,
    initialCustomerTendered,
    onConfirm,
  });
  const supplementalCart = buildSupplementalCartItems(
    checkout.packagingItems,
    checkout.orderType === "delivery" ? checkout.deliveryCost : undefined,
  );
  const printableCart = [...cart, ...supplementalCart];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus={disableRestoreFocus}
        disableEnforceFocus={disableEnforceFocus}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <InvoiceSummary
            cart={cart}
            subTotal={subTotal}
            discountAmount={discountAmount}
            taxAmount={taxAmount}
            extraCostsTax={checkout.extraCostsTax}
            totalPackagingCost={checkout.totalPackagingCost}
            deliveryCost={checkout.deliveryCost}
            showDeliveryCost={checkout.orderType === "delivery"}
            finalTotal={checkout.finalTotal}
            finalTotalSecondary={checkout.finalTotalSecondary}
            exchangeRate={checkout.exchangeRate}
            config={checkout.config}
          />

          {!isTableMode && onApplyPromotion && onRemovePromotion && (
            <PromocionesSelector
              currentPromotion={promotion ?? null}
              onApply={onApplyPromotion}
              onRemove={onRemovePromotion}
            />
          )}

          {!isTableMode && (
            <>
              <Divider sx={{ my: 2 }} />
              <CustomerDeliverySection
                customerName={checkout.customerName}
                onCustomerNameChange={checkout.setCustomerName}
                customerPhone={checkout.customerPhone}
                onCustomerPhoneChange={checkout.setCustomerPhone}
                onCustomerSelect={checkout.handleCustomerSelect}
                orderType={checkout.orderType}
                onOrderTypeChange={checkout.setOrderType}
                lockOrderType={lockOrderType}
                hideDeliveryOption={hideDeliveryOption}
                customerAddress={checkout.customerAddress}
                onCustomerAddressChange={checkout.setCustomerAddress}
                savedAddresses={checkout.savedAddresses}
                drivers={checkout.drivers}
                driverStats={checkout.driverStats}
                selectedDriverId={checkout.selectedDriverId}
                onDriverChange={checkout.setSelectedDriverId}
                deliveryCost={checkout.deliveryCost}
                onDeliveryCostChange={checkout.setDeliveryCost}
                deliveryPrices={checkout.deliveryPrices}
              />
              {(checkout.orderType === "llevar" ||
                checkout.orderType === "delivery") && (
                <PackagingSection
                  packaging={checkout.packagingConfig}
                  quantities={checkout.packagingQuantities}
                  onChange={(name, quantity) =>
                    checkout.setPackagingQuantities((current) => ({
                      ...current,
                      [name]: quantity,
                    }))
                  }
                />
              )}
              <Divider sx={{ my: 2 }} />
              <PaymentMethodSelector
                total={checkout.finalTotal}
                paymentMethod={checkout.paymentMethod}
                setPaymentMethod={checkout.setPaymentMethod}
                splitAmounts={checkout.splitAmounts}
                setSplitAmounts={checkout.setSplitAmounts}
                receivedLocal={checkout.receivedLocal}
                setReceivedLocal={checkout.setReceivedLocal}
                receivedSecondary={checkout.receivedSecondary}
                setReceivedSecondary={checkout.setReceivedSecondary}
                currencySymbol={checkout.config.currencySymbol}
                secondaryCurrencySymbol={
                  checkout.config.secondaryCurrencySymbol
                }
                exchangeRate={checkout.exchangeRate}
                enableSecondaryCurrency={
                  checkout.config.enableSecondaryCurrency
                }
              />
            </>
          )}
          {checkout.submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {checkout.submitError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ "@media print": { display: "none" } }}>
          <Button onClick={onClose} sx={{ color: "error.main" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void checkout.handleConfirm()}
            disabled={!checkout.canConfirm || checkout.isSubmitting}
          >
            {checkout.isSubmitting ? "Procesando..." : confirmText}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={checkout.toastOpen}
        autoHideDuration={3000}
        onClose={() => checkout.setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => checkout.setToastOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          ¡Cliente guardado exitosamente!
        </Alert>
      </Snackbar>

      <TicketPrint
        cart={printableCart}
        subTotal={subTotal + checkout.extraCostsSubtotal}
        discountAmount={discountAmount}
        taxAmount={taxAmount + checkout.extraCostsTax}
        total={checkout.finalTotal}
        customerName={checkout.customerName}
        customerAddress={checkout.customerAddress}
        orderType={checkout.orderType}
        invoiceNumber={invoiceNumber}
        cashierName={cashierName}
      />
    </>
  );
}

import { Alert, Snackbar } from "@mui/material";
import CertificadoDialog from "../CertificadoDialog";
import ConfirmDialog from "../ConfirmDialog";
import ExtrasDialog from "../ExtrasDialog";
import FacturaPreviewDialog from "../FacturaPreviewDialog";
import SelectSizeDialog from "../SelectSizeDialog";
import type { CartItemType } from "../../types/cart";
import type {
  CheckoutFormValues,
  RedeemableCertificate,
} from "../../types/checkout";
import type { Customer } from "../../types/customer.types";
import type { SelectedExtra } from "../../types/extras";
import type {
  Product,
  ProductPrice,
  ProductSize,
} from "../../types/product";
import type { AppliedPromotion } from "../../utils/cartTotals";

interface SelectedProduct {
  name: string;
  prices: ProductPrice[];
}

interface PendingProduct {
  product: Product;
  size: ProductSize;
}

interface ProductDialogs {
  selectedProduct: SelectedProduct | null;
  pendingItem: PendingProduct | null;
  closeSizeDialog(): void;
  selectSize(selected: {
    name: string;
    price: number;
    size: ProductSize;
  }): void;
  cancelExtras(): void;
  confirmExtras(
    selectedExtras: SelectedExtra[],
    note?: string,
  ): void;
}

interface InvoiceDialog {
  open: boolean;
  cart: CartItemType[];
  promotion: AppliedPromotion | null;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  tableId: string | null;
  isCheckoutMode: boolean;
  hasActiveOrder: boolean;
  initialCustomer: Customer | null;
  initialPhone: string;
  initialDriverId?: string;
  initialDeliveryCost?: number;
  initialCustomerTendered?: number;
  invoiceNumber?: string;
  cashierName?: string;
  close(): void;
  confirm(form: CheckoutFormValues): void | Promise<void>;
  applyPromotion(promotion: AppliedPromotion): void;
  removePromotion(): void;
}

interface KitchenDialogs {
  confirmOpen: boolean;
  successOpen: boolean;
  cancel(): void;
  confirm(): void | Promise<void>;
  closeSuccess(): void;
}

interface CertificateDialog {
  open: boolean;
  close(): void;
  apply(certificate: RedeemableCertificate): void;
}

interface BillingDialogsProps {
  products: ProductDialogs;
  invoice: InvoiceDialog;
  kitchen: KitchenDialogs;
  certificate: CertificateDialog;
}

const getInvoiceTitle = ({
  tableId,
  isCheckoutMode,
}: Pick<InvoiceDialog, "tableId" | "isCheckoutMode">) => {
  if (!tableId) return "Resumen de Factura";
  return isCheckoutMode
    ? `Cerrar Cuenta Mesa ${tableId}`
    : `Pedido Mesa ${tableId}`;
};

const getConfirmText = ({
  tableId,
  isCheckoutMode,
  hasActiveOrder,
}: Pick<
  InvoiceDialog,
  "tableId" | "isCheckoutMode" | "hasActiveOrder"
>) => {
  if (!tableId) return "Confirmar pedido";
  if (isCheckoutMode) return "Finalizar y Cobrar";
  return hasActiveOrder ? "Actualizar Mesa" : "Abrir Mesa";
};

export default function BillingDialogs({
  products,
  invoice,
  kitchen,
  certificate,
}: BillingDialogsProps) {
  return (
    <>
      {products.selectedProduct && (
        <SelectSizeDialog
          open
          productName={products.selectedProduct.name}
          prices={products.selectedProduct.prices}
          onClose={products.closeSizeDialog}
          onSelect={products.selectSize}
        />
      )}

      {products.pendingItem && (
        <ExtrasDialog
          open
          productName={products.pendingItem.product.name}
          size={products.pendingItem.size}
          extras={products.pendingItem.product.extras || []}
          onClose={products.cancelExtras}
          onConfirm={products.confirmExtras}
        />
      )}

      <FacturaPreviewDialog
        open={invoice.open}
        cart={invoice.cart}
        promotion={invoice.promotion}
        subTotal={invoice.subTotal}
        discountAmount={invoice.discountAmount}
        taxAmount={invoice.taxAmount}
        total={invoice.total}
        onApplyPromotion={invoice.applyPromotion}
        onRemovePromotion={invoice.removePromotion}
        onClose={invoice.close}
        onConfirm={invoice.confirm}
        title={getInvoiceTitle(invoice)}
        confirmText={getConfirmText(invoice)}
        isTableMode={!!invoice.tableId && !invoice.isCheckoutMode}
        disableRestoreFocus
        disableEnforceFocus
        initialCustomer={invoice.initialCustomer}
        initialPhone={invoice.initialPhone}
        initialOrderType={
          invoice.initialCustomer || invoice.initialPhone
            ? "delivery"
            : undefined
        }
        lockOrderType={
          !!(invoice.initialCustomer || invoice.initialPhone)
        }
        initialDriverId={invoice.initialDriverId}
        initialDeliveryCost={invoice.initialDeliveryCost}
        initialCustomerTendered={invoice.initialCustomerTendered}
        invoiceNumber={invoice.invoiceNumber}
        cashierName={invoice.cashierName}
      />

      <Snackbar
        open={kitchen.successOpen}
        autoHideDuration={3000}
        onClose={kitchen.closeSuccess}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={kitchen.closeSuccess}
          severity="success"
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 3,
            fontWeight: "bold",
          }}
        >
          Pedido enviado a cocina correctamente
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={kitchen.confirmOpen}
        title="Enviar a Cocina"
        message="¿Estás seguro de que quieres enviar este pedido a cocina? Asegúrate de que todos los productos sean correctos."
        onClose={kitchen.cancel}
        onConfirm={kitchen.confirm}
        disableRestoreFocus
        disableEnforceFocus
      />

      <CertificadoDialog
        open={certificate.open}
        onClose={certificate.close}
        onApply={certificate.apply}
      />
    </>
  );
}

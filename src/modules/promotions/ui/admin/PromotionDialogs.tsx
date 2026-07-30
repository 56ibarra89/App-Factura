import type {
  AdminPromotionsViewModel,
} from "../../hooks/useAdminPromotions";
import CertificadoDetailDialog from "./CertificadoDetailDialog";
import CertificadoDialog from "./CertificadoDialog";
import CuponDialog from "./CuponDialog";
import DescuentoDialog from "./DescuentoDialog";
import HappyHourDialog from "./HappyHourDialog";

interface PromotionDialogsProps {
  promotions: AdminPromotionsViewModel;
}

export default function PromotionDialogs({
  promotions,
}: PromotionDialogsProps) {
  return (
    <>
      <DescuentoDialog
        open={promotions.discounts.dialogOpen}
        onClose={promotions.discounts.closeDialog}
        onSave={promotions.discounts.save}
        editingRule={promotions.discounts.editing}
      />
      <HappyHourDialog
        open={promotions.happyHours.dialogOpen}
        onClose={promotions.happyHours.closeDialog}
        onSave={promotions.happyHours.save}
        editingRule={promotions.happyHours.editing}
      />
      <CuponDialog
        open={promotions.coupons.dialogOpen}
        onClose={promotions.coupons.closeDialog}
        onSave={promotions.coupons.save}
        editingCupon={promotions.coupons.editing}
      />
      <CertificadoDialog
        open={promotions.certificates.dialogOpen}
        onClose={promotions.certificates.closeDialog}
        onEmit={promotions.certificates.emit}
      />
      <CertificadoDetailDialog
        open={promotions.certificates.detailOpen}
        onClose={promotions.certificates.closeDetail}
        certificado={promotions.certificates.viewing}
        onMarkDelivered={promotions.certificates.markDelivered}
        onCancel={promotions.certificates.cancel}
      />
    </>
  );
}

import { useState } from "react";
import type {
  CertificadoRule,
  CuponFormOutput,
  CuponRule,
  DescuentoRule,
  HappyHourRule,
} from "../model/promotion.types";
import { useCertificados } from "./useCertificados";
import { useCupones } from "./useCupones";
import { useDescuentos } from "./useDescuentos";
import { useHappyHours } from "./useHappyHours";

export function useAdminPromotions() {
  const [activeTab, setActiveTab] = useState(0);

  const discountData = useDescuentos();
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] =
    useState<DescuentoRule | null>(null);

  const happyHourData = useHappyHours();
  const [happyHourDialogOpen, setHappyHourDialogOpen] = useState(false);
  const [editingHappyHour, setEditingHappyHour] =
    useState<HappyHourRule | null>(null);

  const couponData = useCupones();
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CuponRule | null>(null);

  const certificateData = useCertificados();
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [certificateDetailOpen, setCertificateDetailOpen] = useState(false);
  const [viewingCertificate, setViewingCertificate] =
    useState<CertificadoRule | null>(null);

  const openNewDiscount = () => {
    setEditingDiscount(null);
    setDiscountDialogOpen(true);
  };
  const openDiscount = (discount: DescuentoRule) => {
    setEditingDiscount(discount);
    setDiscountDialogOpen(true);
  };
  const saveDiscount = async (discount: DescuentoRule) => {
    if (editingDiscount) {
      await discountData.editDescuento(discount);
    } else {
      await discountData.addDescuento(discount);
    }
  };

  const openNewHappyHour = () => {
    setEditingHappyHour(null);
    setHappyHourDialogOpen(true);
  };
  const openHappyHour = (happyHour: HappyHourRule) => {
    setEditingHappyHour(happyHour);
    setHappyHourDialogOpen(true);
  };
  const saveHappyHour = async (happyHour: HappyHourRule) => {
    if (editingHappyHour) {
      await happyHourData.editHappyHour(happyHour);
    } else {
      await happyHourData.addHappyHour(happyHour);
    }
  };

  const openNewCoupon = () => {
    setEditingCoupon(null);
    setCouponDialogOpen(true);
  };
  const openCoupon = (coupon: CuponRule) => {
    setEditingCoupon(coupon);
    setCouponDialogOpen(true);
  };
  const saveCoupon = async (coupon: CuponFormOutput) => {
    if (editingCoupon) {
      await couponData.editCupon(coupon);
    } else {
      await couponData.addCupon(coupon);
    }
  };

  const openCertificate = (certificate: CertificadoRule) => {
    setViewingCertificate(certificate);
    setCertificateDetailOpen(true);
  };
  const closeCertificateDetail = () => {
    setCertificateDetailOpen(false);
    setViewingCertificate(null);
  };
  const markCertificateDelivered = async (id: number) => {
    await certificateData.markDelivered(id);
    closeCertificateDetail();
  };
  const cancelCertificate = async (id: number) => {
    await certificateData.cancelCertificado(id);
    closeCertificateDetail();
  };

  return {
    activeTab,
    changeTab: setActiveTab,
    discounts: {
      items: discountData.descuentos,
      dialogOpen: discountDialogOpen,
      editing: editingDiscount,
      openNew: openNewDiscount,
      openEdit: openDiscount,
      closeDialog: () => setDiscountDialogOpen(false),
      save: saveDiscount,
      delete: discountData.deleteDescuento,
    },
    happyHours: {
      items: happyHourData.happyHours,
      dialogOpen: happyHourDialogOpen,
      editing: editingHappyHour,
      openNew: openNewHappyHour,
      openEdit: openHappyHour,
      closeDialog: () => setHappyHourDialogOpen(false),
      save: saveHappyHour,
      delete: happyHourData.deleteHappyHour,
      toggleStatus: happyHourData.toggleHappyHourStatus,
    },
    coupons: {
      items: couponData.cupones,
      dialogOpen: couponDialogOpen,
      editing: editingCoupon,
      openNew: openNewCoupon,
      openEdit: openCoupon,
      closeDialog: () => setCouponDialogOpen(false),
      save: saveCoupon,
      delete: couponData.deleteCupon,
      copy: (code: string) => navigator.clipboard?.writeText(code),
    },
    certificates: {
      items: certificateData.certificados,
      dialogOpen: certificateDialogOpen,
      detailOpen: certificateDetailOpen,
      viewing: viewingCertificate,
      openNew: () => setCertificateDialogOpen(true),
      closeDialog: () => setCertificateDialogOpen(false),
      openDetail: openCertificate,
      closeDetail: closeCertificateDetail,
      emit: certificateData.addCertificado,
      markDelivered: markCertificateDelivered,
      cancel: cancelCertificate,
      delete: certificateData.deleteCertificado,
    },
  };
}

export type AdminPromotionsViewModel = ReturnType<typeof useAdminPromotions>;

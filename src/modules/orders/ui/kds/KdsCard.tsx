import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import TakeoutDiningIcon from "@mui/icons-material/TakeoutDining";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { Order, OrderStatus, SelectedComboOptionItem } from "../../model/order.types";
import {
  isPackagingOrderItem,
  requiresKitchenPreparation,
} from "../../model/orderItemDomain";
import type { Kitchen } from "../../../kitchens";
import { useCatalog } from "../../../catalog";
import { getTicketUrgency } from "../../utils/timeUrgency";
import { formatItemName, formatTableName } from "../../../../shared/format";
import { LOGIN_COLORS } from "../../../../shared/theme";

interface KdsCardProps {
  order: Order;
  filteredItems?: Order["items"];
  kitchens: Kitchen[];
  selectedKitchenId?: string;
  resolveTableName?: (tableId: string) => string;
  onUpdateStatus: (
    id: string,
    status: OrderStatus,
    cancelReason?: string,
    adminPin?: string,
    sentAt?: number,
    kitchenId?: string,
    itemId?: number | string
  ) => void;
}

export const KdsCard: React.FC<KdsCardProps> = ({
  order,
  filteredItems,
  kitchens,
  selectedKitchenId,
  resolveTableName,
  onUpdateStatus,
}) => {
  const itemsToUse = filteredItems || order.items;
  const hasPackaging = order.items.some(isPackagingOrderItem);
  const displayItems = itemsToUse.filter(requiresKitchenPreparation);

  const { categories } = useCatalog();

  // Mapeo dinámico del catálogo para resolver categoría y cocina en cualquier producto
  const productMetaMap = React.useMemo(() => {
    const byId = new Map<
      string,
      { categoryId?: string; categoryName?: string; kitchenId?: string }
    >();
    const byName = new Map<
      string,
      { categoryId?: string; categoryName?: string; kitchenId?: string }
    >();

    categories.forEach((cat) => {
      cat.items.forEach((prod) => {
        const meta = {
          categoryId: cat.id || prod.categoryId,
          categoryName: cat.label,
          kitchenId: cat.kitchenId,
        };
        if (prod.id) byId.set(prod.id, meta);
        if (prod.name) byName.set(prod.name.toLowerCase().trim(), meta);
      });
    });

    return { byId, byName };
  }, [categories]);

  const resolveItemCategoryName = React.useCallback(
    (
      productId?: string,
      name?: string,
      explicitCategoryName?: string,
      categoryId?: string,
    ) => {
      if (explicitCategoryName) return explicitCategoryName;
      if (categoryId) {
        const cat = categories.find((c) => c.id === categoryId);
        if (cat) return cat.label;
      }
      if (productId && productMetaMap.byId.has(productId)) {
        return productMetaMap.byId.get(productId)!.categoryName;
      }
      if (name && productMetaMap.byName.has(name.toLowerCase().trim())) {
        return productMetaMap.byName.get(name.toLowerCase().trim())!.categoryName;
      }
      return undefined;
    },
    [categories, productMetaMap],
  );

  const resolveItemKitchenId = React.useCallback(
    (
      productId?: string,
      name?: string,
      explicitKitchenId?: string,
      categoryId?: string,
    ) => {
      if (explicitKitchenId) return explicitKitchenId;
      if (categoryId) {
        const cat = categories.find((c) => c.id === categoryId);
        if (cat?.kitchenId) return cat.kitchenId;
      }
      if (productId && productMetaMap.byId.has(productId)) {
        return productMetaMap.byId.get(productId)!.kitchenId;
      }
      if (name && productMetaMap.byName.has(name.toLowerCase().trim())) {
        return productMetaMap.byName.get(name.toLowerCase().trim())!.kitchenId;
      }
      return undefined;
    },
    [categories, productMetaMap],
  );

  const ticketSentAt = displayItems.find((i) => i.isSentToKitchen)?.sentAt || order.timestamp;
  const sentAtTimestampMs = ticketSentAt ? new Date(ticketSentAt).getTime() : undefined;
  const urgency = getTicketUrgency(ticketSentAt);
  const normalizedOrderType = order.orderType
    ? order.orderType.toLowerCase()
    : order.tableId
      ? "local"
      : "llevar";
  const isTakeout = normalizedOrderType === "llevar";
  const isLocal = normalizedOrderType === "local";
  const isDelivery = normalizedOrderType === "delivery";

  return (
    <Card
      elevation={4}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        bgcolor: "background.paper",
        color: "text.primary",
        border: "2px solid",
        borderColor: urgency.isPulsing ? urgency.color : "divider",
        boxShadow: urgency.isPulsing
          ? "0 0 20px rgba(211, 47, 47, 0.4)"
          : "0 4px 16px rgba(0,0,0,0.06)",
        transition: "all 0.3s ease-in-out",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {}
      <Box
        sx={{
          bgcolor: urgency.badgeBg,
          borderBottom: `2px solid ${urgency.badgeBorder}`,
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          animation: urgency.isPulsing ? "pulseBorder 1.5s infinite ease-in-out" : "none",
          "@keyframes pulseBorder": {
            "0%": { opacity: 0.7 },
            "50%": { opacity: 1 },
            "100%": { opacity: 0.7 },
          },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TimerIcon sx={{ color: urgency.textColor, fontSize: "1.2rem" }} />
          <Typography
            variant="subtitle2"
            fontWeight="800"
            sx={{ color: urgency.textColor, fontSize: "0.95rem" }}
          >
            {urgency.label}
          </Typography>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
          {new Date(order.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Typography>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {/* Encabezado del ticket */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box>
            <Typography variant="h5" fontWeight="900" color="text.primary" sx={{ letterSpacing: "-0.5px" }}>
              {order.invoiceNumber ? `#${order.invoiceNumber}` : "Orden en Curso"}
            </Typography>

            <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
              {order.customerName && (
                <Chip
                  label={order.customerName}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                />
              )}
              {order.tableId ? (
                <Chip
                  label={
                    resolveTableName?.(order.tableId) ??
                    formatTableName(order.tableId, [])
                  }
                  size="small"
                  color="secondary"
                  sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                />
              ) : isLocal ? (
                <Chip
                  icon={<RestaurantIcon sx={{ fontSize: "0.9rem !important" }} />}
                  label="Comer en el Local"
                  size="small"
                  color="success"
                  sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                />
              ) : null}
              {isTakeout && (
                <Chip
                  icon={<TakeoutDiningIcon sx={{ fontSize: "0.9rem !important" }} />}
                  label="Para Llevar"
                  size="small"
                  color="info"
                  sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                />
              )}
              {isDelivery && (
                <Chip
                  icon={<TwoWheelerIcon sx={{ fontSize: "0.9rem !important" }} />}
                  label="Delivery"
                  size="small"
                  color="error"
                  sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                />
              )}
              {hasPackaging && (
                <Chip
                  icon={<LocalShippingIcon sx={{ fontSize: "0.9rem !important" }} />}
                  label={order.tableId ? "Solicitó Empaque" : "Requiere Empaque"}
                  size="small"
                  color="warning"
                  sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5, borderColor: "divider" }} />

        {/* Lista de Ítems */}
        <Stack spacing={1.5}>
          {displayItems.map((item, idx) => {
            const status = item.kitchenStatus || order.status;

            // CASO 1: ÍTEM ES UN COMBO
            if (item.isCombo) {
              const enrichedSelections = (item.comboSelections || []).map((sel) => {
                const catName = resolveItemCategoryName(
                  sel.productId,
                  sel.productName,
                  sel.categoryName,
                  sel.categoryId,
                );
                const kId = resolveItemKitchenId(
                  sel.productId,
                  sel.productName,
                  sel.kitchenId,
                  sel.categoryId,
                );
                const kName = kitchens.find((k) => k.id === kId)?.name || "Sin área";
                return {
                  ...sel,
                  resolvedCategoryName: catName,
                  resolvedKitchenId: kId,
                  resolvedKitchenName: kName,
                };
              });

              // Si se filtra por una estación de cocina específica
              if (selectedKitchenId) {
                const stationSelections = enrichedSelections.filter(
                  (s) => s.resolvedKitchenId === selectedKitchenId,
                );

                // Si esta cocina no tiene platillos que preparar en este combo, omitir
                if (stationSelections.length === 0) {
                  return null;
                }

                const currentKitchenName =
                  kitchens.find((k) => k.id === selectedKitchenId)?.name ||
                  stationSelections[0]?.resolvedKitchenName ||
                  "Cocina";

                const stationAllDelivered = stationSelections.every(
                  (s) => s.kitchenStatus === "delivered",
                );
                const stationAllReady = stationSelections.every(
                  (s) => s.kitchenStatus === "ready" || s.kitchenStatus === "delivered",
                );
                const stationAnyPreparingOrReady = stationSelections.some(
                  (s) => s.kitchenStatus === "preparing" || s.kitchenStatus === "ready",
                );

                let stationStatus: OrderStatus = "pending";
                if (stationAllDelivered) stationStatus = "delivered";
                else if (stationAllReady) stationStatus = "ready";
                else if (stationAnyPreparingOrReady) stationStatus = "preparing";

                return (
                  <Box
                    key={`combo-station-${idx}`}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: item.note ? "rgba(255, 193, 7, 0.12)" : "action.hover",
                      border: "1px solid",
                      borderColor: item.note ? "#ffc107" : "divider",
                      borderLeft: `5px solid ${LOGIN_COLORS.primary}`,
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" mb={0.8}>
                          <Chip
                            label={`📦 Combo: ${item.name}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.72rem",
                              height: 22,
                              borderColor: LOGIN_COLORS.primary,
                              color: LOGIN_COLORS.primary,
                            }}
                          />
                          <Chip
                            label={`📍 ${currentKitchenName}`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.7rem",
                              height: 20,
                              bgcolor: "rgba(0,0,0,0.06)",
                            }}
                          />
                        </Stack>

                        {/* Platillos a preparar en esta estación */}
                        <Stack spacing={0.8}>
                          {stationSelections.map((sel, sIdx) => {
                            const sizeText =
                              sel.size && sel.size !== "único" ? ` (${sel.size})` : "";
                            return (
                              <Box key={sIdx} sx={{ pl: 0.5 }}>
                                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                  <Typography
                                    variant="body1"
                                    fontWeight="900"
                                    color="text.primary"
                                    sx={{ fontSize: "1.05rem", lineHeight: 1.25 }}
                                  >
                                    <Box component="span" sx={{ color: LOGIN_COLORS.primary, mr: 0.6 }}>
                                      {sel.quantity * item.quantity}x
                                    </Box>
                                    {sel.productName}
                                    {sizeText && (
                                      <Box component="span" sx={{ color: "text.secondary", fontWeight: 600, ml: 0.6, fontSize: "0.9rem" }}>
                                        {sizeText}
                                      </Box>
                                    )}
                                  </Typography>
                                  {sel.resolvedCategoryName && (
                                    <Chip
                                      label={`🏷️ ${sel.resolvedCategoryName}`}
                                      size="small"
                                      sx={{
                                        bgcolor: "primary.main",
                                        color: "#fff",
                                        fontWeight: 800,
                                        fontSize: "0.72rem",
                                        height: 22,
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            );
                          })}
                        </Stack>

                        {item.note && (
                          <Box
                            sx={{
                              mt: 1,
                              p: 0.8,
                              bgcolor: "rgba(255, 193, 7, 0.15)",
                              borderRadius: 1.5,
                              borderLeft: "4px solid #ffc107",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <WarningAmberIcon sx={{ color: "#ffc107", fontSize: "1rem" }} />
                            <Typography variant="caption" fontWeight="700" color="text.primary">
                              NOTA: {item.note}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Acciones para la estación */}
                      <Box sx={{ flexShrink: 0 }}>
                        {stationStatus === "pending" && (
                          <Button
                            size="medium"
                            variant="contained"
                            onClick={() =>
                              onUpdateStatus(
                                order.id,
                                "preparing",
                                undefined,
                                undefined,
                                sentAtTimestampMs,
                                selectedKitchenId,
                                item.id,
                              )
                            }
                            startIcon={<RestaurantIcon />}
                            sx={{
                              bgcolor: LOGIN_COLORS.primary,
                              "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
                              fontWeight: 800,
                              px: 1.5,
                              py: 0.8,
                              borderRadius: 2,
                              fontSize: "0.8rem",
                              boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            PREPARAR
                          </Button>
                        )}
                        {stationStatus === "preparing" && (
                          <Button
                            size="medium"
                            variant="contained"
                            color="success"
                            onClick={() =>
                              onUpdateStatus(
                                order.id,
                                "ready",
                                undefined,
                                undefined,
                                sentAtTimestampMs,
                                selectedKitchenId,
                                item.id,
                              )
                            }
                            startIcon={<CheckCircleIcon />}
                            sx={{
                              fontWeight: 800,
                              px: 2,
                              py: 0.8,
                              borderRadius: 2,
                              fontSize: "0.8rem",
                              boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            LISTO
                          </Button>
                        )}
                        {stationStatus === "ready" && (
                          <Button
                            size="medium"
                            variant="outlined"
                            color="info"
                            onClick={() =>
                              onUpdateStatus(
                                order.id,
                                "delivered",
                                undefined,
                                undefined,
                                sentAtTimestampMs,
                                selectedKitchenId,
                                item.id,
                              )
                            }
                            sx={{
                              fontWeight: 800,
                              px: 1.5,
                              py: 0.8,
                              borderRadius: 2,
                              fontSize: "0.8rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            ENTREGAR
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              }

              // Vista general "Todas las áreas de cocina"
              const allUniqueKitchenNames = Array.from(
                new Set(enrichedSelections.map((s) => s.resolvedKitchenName).filter(Boolean)),
              );

              return (
                <Box
                  key={idx}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: item.note ? "rgba(255, 193, 7, 0.12)" : "action.hover",
                    border: "1px solid",
                    borderColor: item.note ? "#ffc107" : "divider",
                    borderLeft: `5px solid ${LOGIN_COLORS.primary}`,
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1} flexWrap="wrap">
                        <Typography variant="body1" fontWeight="900" color="text.primary">
                          <Box component="span" sx={{ color: LOGIN_COLORS.primary, mr: 0.5 }}>
                            {item.quantity}x
                          </Box>
                          {formatItemName(item.name, item.size)}
                        </Typography>
                        <Chip
                          label="COMBO"
                          size="small"
                          sx={{
                            bgcolor: LOGIN_COLORS.primary,
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: "0.65rem",
                            height: 20,
                          }}
                        />
                        {allUniqueKitchenNames.length > 0 && (
                          <Chip
                            label={`📍 ${allUniqueKitchenNames.join(" + ")}`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.68rem",
                              height: 20,
                              bgcolor: "rgba(0,0,0,0.06)",
                            }}
                          />
                        )}
                      </Stack>

                      {/* Desglose ordenado con Categoría y Cocina */}
                      <Stack spacing={0.8} sx={{ pl: 1, borderLeft: "3px solid", borderColor: LOGIN_COLORS.primary }}>
                        {enrichedSelections.map((sel, selIdx) => {
                          const sizeText =
                            sel.size && sel.size !== "único" ? ` (${sel.size})` : "";
                          return (
                            <Box
                              key={selIdx}
                              sx={{
                                p: 0.8,
                                borderRadius: 1.5,
                                bgcolor: "background.paper",
                                border: "1px solid rgba(0,0,0,0.06)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: 0.8,
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight="800"
                                color="text.primary"
                                sx={{ fontSize: "0.88rem" }}
                              >
                                ↳ {sel.quantity * item.quantity}x {sel.productName}
                                <Box component="span" sx={{ color: "text.secondary", fontWeight: 500, ml: 0.5 }}>
                                  {sizeText}
                                </Box>
                              </Typography>
                              <Stack direction="row" spacing={0.6} alignItems="center">
                                {sel.resolvedCategoryName && (
                                  <Chip
                                    label={`🏷️ ${sel.resolvedCategoryName}`}
                                    size="small"
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: "0.68rem",
                                      height: 20,
                                      bgcolor: "rgba(211, 47, 47, 0.08)",
                                      color: LOGIN_COLORS.primary,
                                      border: "1px solid rgba(211, 47, 47, 0.2)",
                                    }}
                                  />
                                )}
                                <Chip
                                  label={`📍 ${sel.resolvedKitchenName}`}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                    bgcolor: "rgba(0, 0, 0, 0.05)",
                                    color: "text.secondary",
                                  }}
                                />
                                {sel.kitchenStatus === "ready" ? (
                                  <Chip
                                    label="Listo"
                                    size="small"
                                    color="success"
                                    sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800 }}
                                  />
                                ) : sel.kitchenStatus === "preparing" ? (
                                  <Chip
                                    label="Preparando"
                                    size="small"
                                    color="primary"
                                    sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800 }}
                                  />
                                ) : sel.kitchenStatus === "delivered" ? (
                                  <Chip
                                    label="Entregado"
                                    size="small"
                                    sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800, bgcolor: "rgba(46, 125, 50, 0.2)", color: "#2e7d32" }}
                                  />
                                ) : (
                                  <Chip
                                    label="Pendiente"
                                    size="small"
                                    color="warning"
                                    sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800 }}
                                  />
                                )}
                              </Stack>
                            </Box>
                          );
                        })}
                      </Stack>

                      {item.note && (
                        <Box
                          sx={{
                            mt: 1,
                            p: 0.8,
                            bgcolor: "rgba(255, 193, 7, 0.15)",
                            borderRadius: 1.5,
                            borderLeft: "4px solid #ffc107",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <WarningAmberIcon sx={{ color: "#ffc107", fontSize: "1rem" }} />
                          <Typography variant="caption" fontWeight="700" color="text.primary">
                            NOTA: {item.note}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Acciones */}
                    <Box sx={{ flexShrink: 0 }}>
                      {status === "pending" && (
                        <Button
                          size="medium"
                          variant="contained"
                          onClick={() =>
                            onUpdateStatus(
                              order.id,
                              "preparing",
                              undefined,
                              undefined,
                              sentAtTimestampMs,
                              item.kitchenId,
                              item.id,
                            )
                          }
                          startIcon={<RestaurantIcon />}
                          sx={{
                            bgcolor: LOGIN_COLORS.primary,
                            "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
                            fontWeight: 800,
                            px: 1.5,
                            py: 0.8,
                            borderRadius: 2,
                            fontSize: "0.8rem",
                            boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          PREPARAR
                        </Button>
                      )}
                      {status === "preparing" && (
                        <Button
                          size="medium"
                          variant="contained"
                          color="success"
                          onClick={() =>
                            onUpdateStatus(
                              order.id,
                              "ready",
                              undefined,
                              undefined,
                              sentAtTimestampMs,
                              item.kitchenId,
                              item.id,
                            )
                          }
                          startIcon={<CheckCircleIcon />}
                          sx={{
                            fontWeight: 800,
                            px: 2,
                            py: 0.8,
                            borderRadius: 2,
                            fontSize: "0.8rem",
                            boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          LISTO
                        </Button>
                      )}
                      {status === "ready" && (
                        <Button
                          size="medium"
                          variant="outlined"
                          color="info"
                          onClick={() =>
                            onUpdateStatus(
                              order.id,
                              "delivered",
                              undefined,
                              undefined,
                              sentAtTimestampMs,
                              item.kitchenId,
                              item.id,
                            )
                          }
                          sx={{
                            fontWeight: 800,
                            px: 1.5,
                            py: 0.8,
                            borderRadius: 2,
                            fontSize: "0.8rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ENTREGAR
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            }

            // CASO 2: PRODUCTO ESTÁNDAR (NO COMBO)
            const resolvedCatName = resolveItemCategoryName(
              item.productId,
              item.name,
              undefined,
              item.categoryId,
            );
            const resolvedKId = resolveItemKitchenId(
              item.productId,
              item.name,
              item.kitchenId,
              item.categoryId,
            );
            const resolvedKName =
              kitchens.find((k) => k.id === resolvedKId)?.name || "Sin área";

            return (
              <Box
                key={idx}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: item.note ? "rgba(255, 193, 7, 0.12)" : "action.hover",
                  border: "1px solid",
                  borderColor: item.note ? "#ffc107" : "divider",
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={1.5}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box display="flex" alignItems="center" flexWrap="wrap" gap={0.8}>
                      <Typography
                        variant="body1"
                        fontWeight="800"
                        color="text.primary"
                        sx={{
                          fontSize: "0.98rem",
                          lineHeight: 1.25,
                          wordBreak: "break-word",
                        }}
                      >
                        <Box component="span" sx={{ color: LOGIN_COLORS.primary, fontWeight: 900, mr: 0.5 }}>
                          {item.quantity}x
                        </Box>
                        {formatItemName(item.name, item.size)}
                      </Typography>
                      {resolvedCatName && (
                        <Chip
                          label={`🏷️ ${resolvedCatName}`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.68rem",
                            height: 20,
                            bgcolor: "rgba(211, 47, 47, 0.08)",
                            color: LOGIN_COLORS.primary,
                            border: "1px solid rgba(211, 47, 47, 0.2)",
                          }}
                        />
                      )}
                    </Box>

                    {item.extras && item.extras.length > 0 && (
                      <Box sx={{ mt: 0.5, pl: 1 }}>
                        {item.extras.map((extra, eIdx) => (
                          <Typography
                            key={eIdx}
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", fontSize: "0.75rem" }}
                          >
                            + {extra.name}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.75rem", display: "block", mt: 0.4, fontWeight: 600 }}
                    >
                      📍 {resolvedKName}
                    </Typography>
                  </Box>

                  {/* Acciones */}
                  <Box sx={{ flexShrink: 0 }}>
                    {status === "pending" && (
                      <Button
                        size="medium"
                        variant="contained"
                        onClick={() =>
                          onUpdateStatus(
                            order.id,
                            "preparing",
                            undefined,
                            undefined,
                            sentAtTimestampMs,
                            resolvedKId,
                            item.id,
                          )
                        }
                        startIcon={<RestaurantIcon />}
                        sx={{
                          bgcolor: LOGIN_COLORS.primary,
                          "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
                          fontWeight: 800,
                          px: 1.5,
                          py: 0.8,
                          borderRadius: 2,
                          fontSize: "0.8rem",
                          boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        PREPARAR
                      </Button>
                    )}
                    {status === "preparing" && (
                      <Button
                        size="medium"
                        variant="contained"
                        color="success"
                        onClick={() =>
                          onUpdateStatus(
                            order.id,
                            "ready",
                            undefined,
                            undefined,
                            sentAtTimestampMs,
                            resolvedKId,
                            item.id,
                          )
                        }
                        startIcon={<CheckCircleIcon />}
                        sx={{
                          fontWeight: 800,
                          px: 2,
                          py: 0.8,
                          borderRadius: 2,
                          fontSize: "0.8rem",
                          boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        LISTO
                      </Button>
                    )}
                    {status === "ready" && (
                      <Button
                        size="medium"
                        variant="outlined"
                        color="info"
                        onClick={() =>
                          onUpdateStatus(
                            order.id,
                            "delivered",
                            undefined,
                            undefined,
                            sentAtTimestampMs,
                            resolvedKId,
                            item.id,
                          )
                        }
                        sx={{
                          fontWeight: 800,
                          px: 1.5,
                          py: 0.8,
                          borderRadius: 2,
                          fontSize: "0.8rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ENTREGAR
                      </Button>
                    )}
                  </Box>
                </Box>

                {item.note && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 0.8,
                      bgcolor: "rgba(255, 193, 7, 0.15)",
                      borderRadius: 1.5,
                      borderLeft: "4px solid #ffc107",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <WarningAmberIcon sx={{ color: "#ffc107", fontSize: "1rem" }} />
                    <Typography variant="caption" fontWeight="700" color="text.primary">
                      NOTA: {item.note}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};


import React from "react";
import {
  Autocomplete,
  Box,
  Chip,
  InputAdornment,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import {
  CustomerAutocomplete,
  type Customer,
} from "../../customers";
import type { OrderType } from "../../orders";
import type { UserAccount } from "../../accounts";
import type { DeliveryDriverStats } from "../api/checkoutGateway";
import type {
  DeliveryZone,
  DeliveryRulesConfig,
} from "../../delivery";

interface CustomerDeliverySectionProps {
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (value: string) => void;
  onCustomerSelect: (customer: Customer | null) => void;
  savedPhones?: string[];
  orderType: OrderType;
  onOrderTypeChange: (value: OrderType) => void;
  lockOrderType: boolean;
  hideDeliveryOption: boolean;
  customerAddress: string;
  onCustomerAddressChange: (value: string) => void;
  savedAddresses: string[];
  drivers: UserAccount[];
  driverStats: DeliveryDriverStats[];
  selectedDriverId: string;
  onDriverChange: (value: string) => void;
  deliveryCost: number;
  onDeliveryCostChange: (value: number) => void;
  deliveryPrices: string[];
  subTotal?: number;
  selectedZone?: DeliveryZone | null;
  onZoneChange?: (zone: DeliveryZone | null) => void;
  activeZones?: DeliveryZone[];
  deliveryRules?: DeliveryRulesConfig;
  isFreeDelivery?: boolean;
}

export default function CustomerDeliverySection({
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  onCustomerSelect,
  savedPhones = [],
  orderType,
  onOrderTypeChange,
  lockOrderType,
  hideDeliveryOption,
  customerAddress,
  onCustomerAddressChange,
  savedAddresses,
  drivers,
  driverStats,
  selectedDriverId,
  onDriverChange,
  deliveryCost,
  onDeliveryCostChange,
  deliveryPrices,
  subTotal,
  selectedZone,
  onZoneChange,
  activeZones = [],
  deliveryRules,
  isFreeDelivery = false,
}: CustomerDeliverySectionProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <CustomerAutocomplete
          value={customerName}
          onChange={onCustomerNameChange}
          onCustomerSelect={onCustomerSelect}
        />
      </Box>

      {savedPhones.length > 0 ? (
        <Autocomplete
          freeSolo
          options={savedPhones}
          inputValue={customerPhone}
          onInputChange={(_event, value) => onCustomerPhoneChange(value)}
          onChange={(_event, value) =>
            onCustomerPhoneChange(
              typeof value === "string" ? value : (value ?? ""),
            )
          }
          sx={{ mb: 2 }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              label="Teléfono del Cliente"
              placeholder="Ej: 7800-0000"
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      ) : (
        <TextField
          fullWidth
          label="Teléfono del Cliente"
          placeholder="Ej: 7800-0000"
          value={customerPhone}
          onChange={(event) => onCustomerPhoneChange(event.target.value)}
          size="small"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      )}

      {!lockOrderType && (
        <>
          <Typography
            variant="subtitle2"
            gutterBottom
            fontWeight="bold"
            sx={{ color: "text.secondary", mb: 1 }}
          >
            Tipo de Pedido:
          </Typography>
          <ToggleButtonGroup
            value={orderType}
            exclusive
            onChange={(_, value: OrderType | null) => {
              if (value) onOrderTypeChange(value);
            }}
            fullWidth
            color="error"
            size="small"
          >
            <ToggleButton value="local" sx={{ py: 1 }}>
              LOCAL
            </ToggleButton>
            <ToggleButton value="llevar" sx={{ py: 1 }}>
              LLEVAR
            </ToggleButton>
            {!hideDeliveryOption && (
              <ToggleButton value="delivery" sx={{ py: 1 }}>
                DELIVERY
              </ToggleButton>
            )}
          </ToggleButtonGroup>
        </>
      )}

      {orderType === "delivery" && (
        <Box sx={{ mt: 2 }}>
          {savedAddresses.length > 0 ? (
            <Autocomplete
              freeSolo
              options={savedAddresses}
              inputValue={customerAddress}
              onInputChange={(_event, value) =>
                onCustomerAddressChange(value)
              }
              onChange={(_event, value) =>
                onCustomerAddressChange(
                  typeof value === "string" ? value : (value ?? ""),
                )
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="O escribe una dirección nueva..."
                  placeholder="Ej: barrio la libertad, calle el sol, casa 5"
                  size="small"
                  required
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          ) : (
            <TextField
              fullWidth
              label="Dirección de Entrega"
              placeholder="Ej: barrio la libertad, calle el sol, casa número 5"
              value={customerAddress}
              onChange={(event) =>
                onCustomerAddressChange(event.target.value)
              }
              size="small"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {/* Banner indicador de Envío Gratis por consumo mínimo */}
          {isFreeDelivery && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 2,
                p: 1.2,
                bgcolor: "success.light",
                color: "success.contrastText",
                borderRadius: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocalShippingIcon fontSize="small" />
                <Typography variant="body2" fontWeight="bold">
                  ¡Envío Gratis aplicado!
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Consumo ≥ C${deliveryRules?.freeDeliveryMinAmount.toFixed(2)} (Costo asumido por el negocio)
              </Typography>
            </Box>
          )}

          {!isFreeDelivery &&
            deliveryRules?.freeDeliveryEnabled &&
            deliveryRules.freeDeliveryMinAmount > 0 &&
            subTotal !== undefined &&
            subTotal < deliveryRules.freeDeliveryMinAmount && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 1 }}>
                <LocalShippingIcon sx={{ fontSize: 16 }} color="action" />
                <Typography variant="caption" color="text.secondary">
                  Agrega C${(deliveryRules.freeDeliveryMinAmount - subTotal).toFixed(2)} más en productos para envío gratis
                </Typography>
              </Box>
            )}

          {/* Selector Rápido de Zonas de Cobertura */}
          {activeZones.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                sx={{ display: "block", mb: 0.8 }}
              >
                Zona de Entrega:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {activeZones.map((zone) => {
                  const isSelected = selectedZone?.id === zone.id;
                  return (
                    <Chip
                      key={zone.id}
                      icon={<TwoWheelerIcon fontSize="small" />}
                      label={`${zone.name} (C$${zone.price})`}
                      color={isSelected ? "primary" : "default"}
                      variant={isSelected ? "filled" : "outlined"}
                      onClick={() => onZoneChange?.(zone)}
                      clickable
                      sx={{
                        fontWeight: isSelected ? "bold" : "normal",
                        borderRadius: 2,
                        py: 2,
                        px: 0.5,
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
            <TextField
              select
              label="Motorizado"
              value={selectedDriverId}
              onChange={(event) => onDriverChange(event.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: 160 }}
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {drivers.map((driver) => {
                const deliveries =
                  driverStats.find((stat) => stat.userId === driver.id)
                    ?.todayDeliveries ?? 0;
                return (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.firstName} {driver.lastName}{" "}
                    {deliveries > 0 ? `(${deliveries})` : ""}
                  </MenuItem>
                );
              })}
            </TextField>

            {/* Selector de Zona de Entrega si hay zonas activas */}
            {activeZones.length > 0 ? (
              <TextField
                select
                label="Zona de Entrega"
                value={selectedZone?.id ?? ""}
                onChange={(event) => {
                  const targetZone =
                    activeZones.find((z) => z.id === event.target.value) || null;
                  onZoneChange?.(targetZone);
                }}
                size="small"
                sx={{ flex: 1, minWidth: 160 }}
              >
                {activeZones.map((zone) => (
                  <MenuItem key={zone.id} value={zone.id}>
                    {zone.name} (C${zone.price})
                  </MenuItem>
                ))}
              </TextField>
            ) : null}

            <TextField
              select={activeZones.length === 0}
              label="Transporte"
              value={isFreeDelivery ? "GRATIS" : deliveryCost === 0 ? "" : String(deliveryCost)}
              onChange={(event) => {
                if (!isFreeDelivery && activeZones.length === 0) {
                  onDeliveryCostChange(Number(event.target.value) || 0);
                }
              }}
              size="small"
              disabled={isFreeDelivery}
              InputProps={{
                readOnly: activeZones.length > 0,
              }}
              sx={{ width: 130 }}
            >
              {activeZones.length === 0 &&
                deliveryPrices.map((price) => (
                  <MenuItem key={price} value={price}>
                    C$ {price}
                  </MenuItem>
                ))}
            </TextField>
          </Box>

          {/* Resumen de flete / zona */}
          {selectedZone && (
            <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <TwoWheelerIcon sx={{ fontSize: 16 }} color="action" />
              <Typography variant="caption" color="text.secondary">
                {selectedZone.name}: Tarifa de entrega{" "}
                <b>{isFreeDelivery ? "C$0.00 (Gratis)" : `C$${selectedZone.price.toFixed(2)}`}</b>
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

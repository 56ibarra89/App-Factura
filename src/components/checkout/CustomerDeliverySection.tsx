import {
  Autocomplete,
  Box,
  InputAdornment,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import type { Customer } from "../../types/customer.types";
import type { OrderType } from "../../types/order.types";
import type { UserAccount } from "../../types/user";
import type { DeliveryDriverStats } from "../../services/checkout/checkoutGateway";
import CustomerAutocomplete from "../CustomerAutocomplete";

interface CustomerDeliverySectionProps {
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (value: string) => void;
  onCustomerSelect: (customer: Customer | null) => void;
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
}

export default function CustomerDeliverySection({
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  onCustomerSelect,
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

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              select
              label="Motorizado"
              value={selectedDriverId}
              onChange={(event) => onDriverChange(event.target.value)}
              size="small"
              sx={{ flex: 1 }}
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

            <TextField
              select
              label="Transporte"
              value={deliveryCost === 0 ? "" : String(deliveryCost)}
              onChange={(event) =>
                onDeliveryCostChange(Number(event.target.value) || 0)
              }
              size="small"
              sx={{ width: 120 }}
            >
              {deliveryPrices.map((price) => (
                <MenuItem key={price} value={price}>
                  C$ {price}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
      )}
    </Box>
  );
}

import { Box,} from "@mui/material";
import {
  CustomerFormModal,
  DeliveryCustomerDialog,
  type CustomerFormData,
} from "../../customers";
import { useDeliveryLogic } from "../hooks/useDeliveryLogic";
import DeliveryInfoPanel from "../ui/DeliveryInfoPanel";
import DeliveryKeypadPanel from "../ui/DeliveryKeypadPanel";

export default function DeliveryPage() {
  const {
    phoneInput,
    transporteInput,
    selectedCustomer,
    selectedAddress,
    searchDialogOpen,
    customerFormOpen,

    setPhoneInput,
    setTransporteInput,
    setSelectedCustomer,
    setSelectedAddress,
    setSearchDialogOpen,
    setCustomerFormOpen,
    drivers,
    stats,
    selectedDriverId,
    setSelectedDriverId,

    selectedZone,
    setSelectedZone,
    activeZones,
    deliveryRules,

    handleKeypadPress,
    handleConfirm,
    addAddress,
    removeAddress,
    updateCustomer
  } = useDeliveryLogic();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 2, boxSizing: "border-box" }}>
      <Box sx={{ display: "flex", gap: 2, height: "calc(100vh - 32px)", width: "100%" }}>
        <DeliveryInfoPanel
          phoneInput={phoneInput}
          transporteInput={transporteInput}
          selectedCustomer={selectedCustomer}
          selectedAddress={selectedAddress}
          setTransporteInput={setTransporteInput}
          setSearchDialogOpen={setSearchDialogOpen}
          setCustomerFormOpen={setCustomerFormOpen}
          setSelectedAddress={setSelectedAddress}
          drivers={drivers}
          stats={stats}
          selectedDriverId={selectedDriverId}
          setSelectedDriverId={setSelectedDriverId}
          selectedZone={selectedZone}
          onSelectZone={setSelectedZone}
          activeZones={activeZones}
          deliveryRules={deliveryRules}
        />

        <DeliveryKeypadPanel
          phoneInput={phoneInput}
          selectedCustomer={selectedCustomer}
          handleConfirm={handleConfirm}
          handleKeypadPress={handleKeypadPress}
        />
      </Box>

      {}
      <DeliveryCustomerDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        onConfirm={(customer, phone) => {
          setSelectedCustomer(customer);
          if (customer && customer.addresses?.length > 0) {
            setSelectedAddress(customer.addresses[0].address);
          } else {
            setSelectedAddress("");
          }
          if (phone) setPhoneInput(phone);
        }}
      />

      <CustomerFormModal
        open={customerFormOpen}
        customer={selectedCustomer}
        onClose={() => setCustomerFormOpen(false)}
        addAddress={addAddress}
        removeAddress={removeAddress}
        onSave={async (data: CustomerFormData) => {
           await updateCustomer(data);

           if (selectedCustomer) {
             const defaultPhone =
               data.phones.find((p) => p.isDefault)?.phone ||
               data.phones[0]?.phone ||
               data.phone ||
               undefined;

             setSelectedCustomer({
                ...selectedCustomer,
                name: data.name,
                phone: defaultPhone,
                phones: data.phones,
                addresses: data.addresses
             });

             if (defaultPhone) {
               setPhoneInput(defaultPhone);
             } else if (data.phones.length === 0) {
               setPhoneInput("");
             }

             if (data.addresses.length > 0 && (!selectedAddress || !data.addresses.some(a => a.address === selectedAddress))) {
                setSelectedAddress(data.addresses[0].address);
             } else if (data.addresses.length === 0) {
                setSelectedAddress("");
             }
           }
        }}
      />
    </Box>
  );
}


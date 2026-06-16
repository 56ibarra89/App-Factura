import { Box,} from "@mui/material";
import DeliveryCustomerDialog from "../components/DeliveryCustomerDialog";
import CustomerFormModal from "../components/Admin/Clientes/CustomerFormModal";
import { CustomerFormData } from "../hooks/useCustomers";
import { useDeliveryLogic } from "./Delivery/useDeliveryLogic";
import DeliveryInfoPanel from "./Delivery/DeliveryInfoPanel";
import DeliveryKeypadPanel from "./Delivery/DeliveryKeypadPanel";

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
        />
        
        <DeliveryKeypadPanel
          phoneInput={phoneInput}
          selectedCustomer={selectedCustomer}
          handleConfirm={handleConfirm}
          handleKeypadPress={handleKeypadPress}
        />
      </Box>

      {/* Dialogs */}
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
           // Refresh local selected customer state
           if (selectedCustomer) {
             setSelectedCustomer({
                ...selectedCustomer,
                name: data.name,
                phone: data.phone,
                addresses: data.addresses
             });
             
             // Update selected address if new or modified
             if (data.addresses.length > 0 && (!selectedAddress || !data.addresses.some(a => a.address === selectedAddress))) {
                setSelectedAddress(data.addresses[0].address);
             }
           }
        }}
      />
    </Box>
  );
}

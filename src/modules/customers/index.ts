export { useCustomerSearch } from "./hooks/useCustomerSearch";
export { useCustomers } from "./hooks/useCustomers";
export { default as CustomerAutocomplete } from "./ui/CustomerAutocomplete";
export { default as CustomerFormModal } from "./ui/CustomerFormModal";
export { default as DeliveryCustomerDialog } from "./ui/DeliveryCustomerDialog";
export { customerRepository } from "./api/customerRepository";
export type {
  Customer,
  CustomerAddress,
  CustomerFormData,
} from "./model/customer.types";

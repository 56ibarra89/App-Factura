import { AuthLayout } from "../ui/AuthLayout";
import { BrandingPanel } from "../ui/BrandingPanel";
import { ForgotPasswordForm } from "../ui/ForgotPasswordForm";

const ForgotPassword = () => {
  return (
    <AuthLayout>
      <BrandingPanel
        title={
          <>
            Sistema
            <br />
            de Facturación
          </>
        }
        subtitle="Administra todas tus ventas, inventarios y clientes de manera rápida y segura."
        compactMobile
      />
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPassword;

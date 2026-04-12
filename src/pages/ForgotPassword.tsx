import { AuthLayout } from "../components/auth/AuthLayout";
import { BrandingPanel } from "../components/auth/BrandingPanel";
import { ForgotPasswordForm } from "../components/auth/ForgotPasswordForm";

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

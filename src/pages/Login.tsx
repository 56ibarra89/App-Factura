import { useLogin } from "../hooks/useLogin";
import { AuthLayout } from "../components/auth/AuthLayout";
import { BrandingPanel } from "../components/auth/BrandingPanel";
import { LoginForm } from "../components/auth/LoginForm";

const Login = () => {
  const {
    credentials,
    showPassword,
    remember,
    error,
    loading,
    handleChange,
    handleLogin,
    setRemember,
    togglePasswordVisibility,
    clearError,
  } = useLogin();

  return (
    <AuthLayout error={error} onClearError={clearError}>
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
      <LoginForm
        credentials={credentials}
        showPassword={showPassword}
        remember={remember}
        loading={loading}
        handleChange={handleChange}
        handleLogin={handleLogin}
        setRemember={setRemember}
        togglePasswordVisibility={togglePasswordVisibility}
      />
    </AuthLayout>
  );
};

export default Login;

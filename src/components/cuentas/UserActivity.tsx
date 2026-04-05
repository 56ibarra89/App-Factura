import { Box, Typography, Stepper, Step, StepLabel, StepContent, Paper } from "@mui/material";
import { UserAccount } from "../../types/user";

interface UserActivityProps {
  user: UserAccount;
}

export function UserActivity({ user }: UserActivityProps) {
  // En un escenario real, esto vendría de un endpoint o del OrderContext filtrado.
  // Por ahora generaremos actividad simulada atractiva.
  const activities = [
    {
      date: new Date().toLocaleDateString() + " 10:30 AM",
      action: "Inició sesión en el sistema",
      description: "Acceso mediante PIN desde Caja Principal."
    },
    {
      date: new Date().toLocaleDateString() + " 11:15 AM",
      action: "Cobró Orden #ORD-8493",
      description: "Monto total: $45.50 (Pago Mixto)"
    },
    {
      date: new Date(Date.now() - 86400000).toLocaleDateString() + " 09:00 PM",
      action: "Cerró Turno de Caja",
      description: "Cierre exitoso con un desfase de $0.00"
    },
    {
      date: new Date(user.createdAt).toLocaleDateString(),
      action: "Cuenta Creada",
      description: `El usuario ${user.username} fue registrado en el sistema.`
    }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={1}>
        Bitácora de Actividad
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Últimos registros de acciones realizadas por <b>{user.firstName} {user.lastName}</b>.
      </Typography>

      <Paper elevation={0} sx={{ p: 3, bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
        <Stepper orientation="vertical">
          {activities.map((step, index) => (
            <Step key={index} active={true}>
              <StepLabel 
                StepIconProps={{ 
                  sx: { color: index === 0 ? "primary.main" : "grey.500" } 
                }}
              >
                <Typography component="span" fontWeight="bold" color={index === 0 ? "text.primary" : "text.secondary"}>
                  {step.action}
                </Typography>
                <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {step.date}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
}

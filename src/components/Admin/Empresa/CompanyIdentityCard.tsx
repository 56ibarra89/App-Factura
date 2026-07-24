import type { ChangeEvent, RefObject } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import type { EmpresaConfigState } from "../../../types/config";
import { LOGIN_COLORS } from "../../../theme/loginTheme";
import CompanyDetailsForm from "./CompanyDetailsForm";
import CompanyLogoEditor from "./CompanyLogoEditor";

interface CompanyIdentityCardProps {
  config: EmpresaConfigState;
  loading: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  onChange: (field: keyof EmpresaConfigState, value: string) => void;
  onLogoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
  onReset: () => void;
  onSave: () => void;
}

export default function CompanyIdentityCard({
  config,
  loading,
  fileInputRef,
  onChange,
  onLogoChange,
  onRemoveLogo,
  onReset,
  onSave,
}: CompanyIdentityCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "grey.200",
        boxShadow: "0 12px 40px rgba(0,0,0,0.04)",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          height: 120,
          background: `linear-gradient(135deg, #ef5350 0%, ${LOGIN_COLORS.primary} 100%)`,
        }}
      />

      <CardContent sx={{ p: { xs: 3, sm: 5 }, pt: 0, position: "relative" }}>
        <CompanyLogoEditor
          businessName={config.businessName}
          logoUrl={config.logoUrl}
          fileInputRef={fileInputRef}
          onLogoChange={onLogoChange}
          onRemoveLogo={onRemoveLogo}
        />

        <Divider sx={{ mb: 5 }} />

        <CompanyDetailsForm config={config} onChange={onChange} />

        <Box
          sx={{
            mt: 6,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            color="error"
            size="large"
            startIcon={<DeleteIcon />}
            onClick={onReset}
            disabled={loading}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            Restablecer / Eliminar
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={loading}
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 700,
              boxShadow: "0 6px 20px 0 rgba(229, 57, 53, 0.35)",
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(229, 57, 53, 0.45)",
              },
            }}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

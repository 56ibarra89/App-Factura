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
import type { EmpresaConfigState } from "../../model/settings.types";
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
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 }, position: "relative" }}>
        <CompanyLogoEditor
          businessName={config.businessName}
          logoUrl={config.logoUrl}
          fileInputRef={fileInputRef}
          onLogoChange={onLogoChange}
          onRemoveLogo={onRemoveLogo}
        />

        <Divider sx={{ mb: 4 }} />

        <CompanyDetailsForm config={config} onChange={onChange} />

        <Box
          sx={{
            mt: 4,
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
              boxShadow: "none",
              transition: "background-color 120ms ease-out",
              "&:hover": {
                boxShadow: "none",
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

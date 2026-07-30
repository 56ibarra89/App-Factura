import type { ChangeEvent, RefObject } from "react";
import {
  Box,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import StorefrontIcon from "@mui/icons-material/Storefront";

interface CompanyLogoEditorProps {
  businessName: string;
  logoUrl: string;
  fileInputRef: RefObject<HTMLInputElement>;
  onLogoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
}

export default function CompanyLogoEditor({
  businessName,
  logoUrl,
  fileInputRef,
  onLogoChange,
  onRemoveLogo,
}: CompanyLogoEditorProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: -7,
        mb: 4,
      }}
    >
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={onLogoChange}
      />
      <Box sx={{ position: "relative" }}>
        <Paper
          elevation={3}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            position: "relative",
            cursor: "pointer",
            overflow: "hidden",
            border: "4px solid",
            borderColor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              "& .upload-overlay": { opacity: 1 },
            },
          }}
        >
          {logoUrl ? (
            <Box
              component="img"
              src={logoUrl}
              alt="Logotipo"
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <StorefrontIcon sx={{ fontSize: 60, color: "grey.400" }} />
          )}

          <Box
            className="upload-overlay"
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.5)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
          >
            <PhotoCameraIcon sx={{ mb: 1 }} />
            <Typography variant="caption" fontWeight={600}>
              Subir Logo
            </Typography>
          </Box>
        </Paper>

        {logoUrl && (
          <Tooltip title="Eliminar logo" placement="top">
            <IconButton
              color="error"
              onClick={(event) => {
                event.stopPropagation();
                onRemoveLogo();
              }}
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                bgcolor: "background.paper",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                "&:hover": { bgcolor: "error.main", color: "white" },
              }}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
        {businessName || "Tu Empresa"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Haz clic en el círculo para cambiar el logotipo
      </Typography>
    </Box>
  );
}

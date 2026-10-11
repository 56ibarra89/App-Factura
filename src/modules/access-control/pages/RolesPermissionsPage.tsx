import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { BackButton, ConfirmDialog, PageHeader } from "../../../shared/ui";
import {
  PERMISSIONS,
  ROLE_LABELS,
  useAuth,
  type PermissionCode,
  type UserRole,
} from "../../auth";
import { useAccessControl } from "../hooks/useAccessControl";
import type {
  AccessPermission,
  AccessRole,
  AccessRoleDraft,
} from "../model/access-control.types";

const EMPTY_ROLE: AccessRoleDraft = {
  name: "",
  description: "",
  baseRole: "cajero",
  isActive: true,
  permissionCodes: [],
};

function toDraft(role: AccessRole): AccessRoleDraft {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description || "",
    baseRole: role.baseRole,
    isActive: role.isActive,
    isSystem: role.isSystem,
    permissionCodes: role.permissionCodes,
  };
}

export default function RolesPermissionsPage() {
  const access = useAccessControl();
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.ROLES_MANAGE);
  const [draft, setDraft] = useState<AccessRoleDraft>(EMPTY_ROLE);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const permissionsByModule = useMemo(() => {
    const groups = new Map<string, AccessPermission[]>();
    access.permissions.forEach((permission) => {
      groups.set(permission.module, [
        ...(groups.get(permission.module) || []),
        permission,
      ]);
    });
    return [...groups.entries()];
  }, [access.permissions]);

  const selectRole = (role: AccessRole) => {
    setDraft(toDraft(role));
    setMessage(null);
  };

  const togglePermission = (code: PermissionCode) => {
    if (draft.code === "admin") return;
    setDraft((current) => ({
      ...current,
      permissionCodes: current.permissionCodes.includes(code)
        ? current.permissionCodes.filter((item) => item !== code)
        : [...current.permissionCodes, code],
    }));
  };

  const save = async () => {
    if (!draft.name.trim()) return;
    const saved = await access.saveRole({ ...draft, name: draft.name.trim() });
    if (saved) {
      setDraft(toDraft(saved));
      setMessage("Rol y permisos guardados correctamente.");
    }
  };

  const remove = async () => {
    if (!draft.id || draft.isSystem) return;
    const removed = await access.deleteRole(draft.id);
    if (removed) {
      setDraft(EMPTY_ROLE);
      setMessage("Rol eliminado correctamente.");
    }
    setDeleteConfirmationOpen(false);
  };

  if (access.loading) {
    return (
      <Box minHeight="100vh" display="grid" sx={{ placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box minHeight="100vh" sx={{ bgcolor: "background.default", p: { xs: 2, md: 4 } }}>
      <PageHeader
        title="Roles y permisos"
        startContent={<BackButton to="/admin" />}
      />

      {(access.error || message) && (
        <Alert severity={access.error ? "error" : "success"} sx={{ mb: 2 }}>
          {access.error || message}
        </Alert>
      )}

      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "300px 1fr" }} gap={2}>
        <Paper sx={{ p: 2, alignSelf: "start" }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!canManage}
            onClick={() => setDraft({ ...EMPTY_ROLE })}
          >
            Crear rol
          </Button>
          <List sx={{ mt: 1 }}>
            {access.roles.map((role) => (
              <ListItemButton
                key={role.id}
                selected={draft.id === role.id}
                onClick={() => selectRole(role)}
              >
                <ListItemText
                  primary={role.name}
                  secondary={`${ROLE_LABELS[role.baseRole]} · ${role.userCount} usuario(s)`}
                />
                {role.isSystem && <Chip label="Sistema" size="small" />}
              </ListItemButton>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Box display="flex" justifyContent="space-between" gap={2} flexWrap="wrap">
            <Box>
              <Typography variant="h5" fontWeight={800}>
                {draft.id ? "Editar rol" : "Nuevo rol"}
              </Typography>
              <Typography color="text.secondary">
                El perfil base mantiene las reglas operativas; los permisos determinan el acceso.
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={draft.isActive}
                  disabled={!canManage || draft.isSystem}
                  onChange={(_, checked) => setDraft((current) => ({ ...current, isActive: checked }))}
                />
              }
              label="Rol activo"
            />
          </Box>

          <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "2fr 1fr" }} gap={2} mt={3}>
            <TextField
              label="Nombre del rol"
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              required
              disabled={!canManage}
            />
            <TextField
              select
              label="Perfil operativo base"
              value={draft.baseRole}
              disabled={!canManage || Boolean(draft.id)}
              onChange={(event) => setDraft((current) => ({ ...current, baseRole: event.target.value as UserRole }))}
            >
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                <MenuItem key={role} value={role}>{ROLE_LABELS[role]}</MenuItem>
              ))}
            </TextField>
          </Box>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Descripción"
            value={draft.description}
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
            sx={{ mt: 2 }}
            disabled={!canManage}
          />

          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" fontWeight={800}>Permisos</Typography>
          {draft.code === "admin" && (
            <Alert severity="info" sx={{ mt: 1 }}>
              El rol Administrador conserva todos los permisos para evitar bloquear la administración del sistema.
            </Alert>
          )}

          <Box display="grid" gridTemplateColumns={{ xs: "1fr", lg: "repeat(2, 1fr)" }} gap={2} mt={2}>
            {permissionsByModule.map(([moduleName, permissions]) => (
              <Paper key={moduleName} variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={800} mb={1}>{moduleName}</Typography>
                {permissions.map((permission) => (
                  <FormControlLabel
                    key={permission.id}
                    sx={{ display: "flex", alignItems: "flex-start", mx: 0, mb: 0.5 }}
                    control={
                      <Checkbox
                        checked={draft.permissionCodes.includes(permission.code)}
                        disabled={!canManage || draft.code === "admin"}
                        onChange={() => togglePermission(permission.code)}
                      />
                    }
                    label={
                      <Box pt={0.75}>
                        <Typography variant="body2" fontWeight={700}>{permission.action}</Typography>
                        <Typography variant="caption" color="text.secondary">{permission.description}</Typography>
                      </Box>
                    }
                  />
                ))}
              </Paper>
            ))}
          </Box>

          <Box display="flex" justifyContent="space-between" gap={2} mt={3} flexWrap="wrap">
            <Box display="flex" gap={1}>
              {canManage && draft.id && (
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => setDraft({
                    ...draft,
                    id: undefined,
                    code: undefined,
                    isSystem: false,
                    name: `Copia de ${draft.name}`,
                  })}
                >
                  Clonar
                </Button>
              )}
              {canManage && draft.id && !draft.isSystem && (
                <Button color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteConfirmationOpen(true)} disabled={access.saving}>
                  Eliminar
                </Button>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={!canManage || access.saving || !draft.name.trim()}
              onClick={save}
            >
              Guardar cambios
            </Button>
          </Box>
        </Paper>
      </Box>
      <ConfirmDialog
        open={deleteConfirmationOpen}
        title="Eliminar rol"
        message={`¿Deseas eliminar el rol “${draft.name}”? Esta acción solo se permite cuando no tiene usuarios asignados.`}
        onClose={() => setDeleteConfirmationOpen(false)}
        onConfirm={() => void remove()}
      />
    </Box>
  );
}

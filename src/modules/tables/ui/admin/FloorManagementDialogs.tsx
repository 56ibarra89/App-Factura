import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

interface FloorDialogCandidate {
  id: number;
  name: string;
}

interface FloorManagementDialogsProps {
  deleteCandidate: FloorDialogCandidate | null;
  editCandidate: FloorDialogCandidate | null;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onCancelEdit: () => void;
  onConfirmEdit: () => void;
  onEditNameChange: (name: string) => void;
}

export default function FloorManagementDialogs({
  deleteCandidate,
  editCandidate,
  onCancelDelete,
  onConfirmDelete,
  onCancelEdit,
  onConfirmEdit,
  onEditNameChange,
}: FloorManagementDialogsProps) {
  return (
    <>
      <Dialog
        open={deleteCandidate !== null}
        onClose={onCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas eliminar la planta{" "}
            <strong>"{deleteCandidate?.name}"</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onCancelDelete} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={onConfirmDelete}
            color="error"
            variant="contained"
            disableElevation
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editCandidate !== null}
        onClose={onCancelEdit}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Editar Nombre de Planta
        </DialogTitle>
        <DialogContent>
          <DialogContentText mb={2}>
            Ingresa el nuevo nombre para esta planta:
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            value={editCandidate?.name ?? ""}
            onChange={(event) => onEditNameChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onConfirmEdit();
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onCancelEdit} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={onConfirmEdit}
            color="primary"
            variant="contained"
            disableElevation
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

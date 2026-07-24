import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import type { UserAccount } from "../../types/user";

interface AccountManagementDialogsProps {
  deletion: {
    open: boolean;
    user: UserAccount | null;
    confirm(): void;
    cancel(): void;
  };
  feedback: {
    error: string | null;
    success: string | null;
    closeError(): void;
    closeSuccess(): void;
  };
}

export function AccountManagementDialogs({
  deletion,
  feedback,
}: AccountManagementDialogsProps) {
  return (
    <>
      <Dialog
        open={deletion.open}
        onClose={deletion.cancel}
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1,
            maxWidth: 440,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "900",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <DeleteForeverIcon
            color="error"
            sx={{ fontSize: 28 }}
          />
          Eliminar Usuario
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Estás a punto de eliminar permanentemente la
            cuenta de{" "}
            <strong>
              {deletion.user?.firstName}{" "}
              {deletion.user?.lastName}
            </strong>{" "}
            (@{deletion.user?.username}).
            <br />
            <br />
            Esta acción{" "}
            <strong>no se puede deshacer</strong>.
            Considera suspender la cuenta si deseas
            conservar el historial.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={deletion.cancel}
            variant="outlined"
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={deletion.confirm}
            variant="contained"
            color="error"
            startIcon={<DeleteForeverIcon />}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Eliminar Permanentemente
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!feedback.error}
        autoHideDuration={6000}
        onClose={feedback.closeError}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={feedback.closeError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {feedback.error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!feedback.success}
        autoHideDuration={6000}
        onClose={feedback.closeSuccess}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={feedback.closeSuccess}
          severity="success"
          sx={{ width: "100%" }}
        >
          {feedback.success}
        </Alert>
      </Snackbar>
    </>
  );
}

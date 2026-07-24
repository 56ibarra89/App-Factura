import { Alert, Box, Grid, Snackbar } from "@mui/material";
import { BackButton } from "../../components/BackButton";
import PageHeader from "../../components/PageHeader";
import EmployeeScheduleEditor from "../../components/Admin/Horarios/EmployeeScheduleEditor";
import EmployeeScheduleList from "../../components/Admin/Horarios/EmployeeScheduleList";
import { useAdminSchedules } from "../../hooks/useAdminSchedules";

export default function AdminHorarios() {
  const schedule = useAdminSchedules();

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        pt: 2,
        pb: 4,
        px: { xs: 2, md: 6 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PageHeader
        title="Horarios de Empleados"
        startContent={<BackButton to="/admin" />}
      />

      <Grid container spacing={2} sx={{ mt: 1, flex: 1 }}>
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <EmployeeScheduleList
            employees={schedule.employees}
            loading={schedule.loading}
            selectedUserId={schedule.selectedUserId}
            stats={schedule.stats}
            onSelect={schedule.selectUser}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <EmployeeScheduleEditor
            user={schedule.selectedUser}
            workDays={schedule.currentWorkDays}
            pastExtraDays={schedule.pastExtraDays}
            hasExtraDayToday={schedule.hasExtraDayToday}
            loading={schedule.loading}
            onToggleWorkDay={schedule.toggleWorkDay}
            onToggleExtraDay={schedule.toggleExtraDay}
            onSave={schedule.saveSchedule}
          />
        </Grid>
      </Grid>

      <Snackbar
        open={schedule.toast.open}
        autoHideDuration={4000}
        onClose={schedule.closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={schedule.closeToast}
          severity={schedule.toast.severity}
          sx={{ width: "100%", fontSize: "1.1rem" }}
          variant="filled"
        >
          {schedule.toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

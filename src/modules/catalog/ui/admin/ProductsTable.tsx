
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Paper, IconButton, Typography, Box, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Category, Product } from "../../model/catalog.types";
import { RoleGuard } from "../../../auth";
import { LOGIN_COLORS } from "../../../../shared/theme";
import React from 'react';

interface ProductsTableProps {
  categories: Category[];
  onEdit: (product: Product, category: string) => void;
  onDelete: (name: string, category: string) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  categories,
  onEdit,
  onDelete,
}) => {
  const rows = categories.flatMap((cat, iCat) =>
    cat.items.map((product, iProd) => ({
      id: `${iCat}-${iProd}`,
      name: product.name,
      description: product.description || "",
      category: cat.label,
      prices: product.isCombo
        ? `Precio Combo: C$${(product.comboPrice ?? product.prices[0]?.price ?? 0).toFixed(2)} (${product.comboGroups?.length || 0} componentes)`
        : product.prices
            .map((p) =>
              p.size === "único"
                ? `C$${p.price.toFixed(2)}`
                : `${p.size}: C$${p.price.toFixed(2)}`
            )
            .join(" | "),
      rawProduct: product,
    }))
  );

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nombre",
      flex: 1.2,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1} height="100%">
          <Typography variant="body2" fontWeight={params.row.rawProduct.isCombo ? 700 : 400}>
            {params.value}
          </Typography>
          {params.row.rawProduct.isCombo && (
            <Chip
              label="COMBO"
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                fontWeight: 800,
                bgcolor: "rgba(207, 31, 46, 0.12)",
                color: LOGIN_COLORS.primary,
                border: "1px solid rgba(207, 31, 46, 0.3)",
              }}
            />
          )}
        </Box>
      ),
    },
    { field: "description", headerName: "Descripción", flex: 1.5 },
    { field: "category", headerName: "Categoría", flex: 1 },
    { field: "prices", headerName: "Precios", flex: 2 },

    {
      field: "acciones",
      headerName: "Acciones",
      sortable: false,
      width: 150,
      renderCell: (params) => (
        <>
        <RoleGuard allowedRoles={["admin"]}>
          <IconButton
            color="primary"
            onClick={(e) => {
              (e.currentTarget as HTMLButtonElement).blur();
              onEdit(params.row.rawProduct, params.row.category);
            }}
          >
            <EditIcon />
          </IconButton>

          <IconButton
            color="error"
            onClick={(e) => {
              (e.currentTarget as HTMLButtonElement).blur();
              onDelete(params.row.name, params.row.category);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </RoleGuard>
        </>
      ),
    },
  ];

  return (
    <>
      <Typography variant="h6" mb={2} mt={4} align="center">
        Lista de productos
      </Typography>

      <Paper sx={{ height: 420, width: "100%", mb: 3 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
          localeText={{
            // Column menu
          columnMenuUnsort: "Quitar orden",
          columnMenuSortAsc: "Ordenar ASC",
          columnMenuSortDesc: "Ordenar DESC",
          columnMenuFilter: "Filtrar",
          columnMenuHideColumn: "Ocultar columna",
          columnMenuShowColumns: "Administrar columnas",
          columnMenuManageColumns: "Administrar columnas",

          // Filter panel
          filterPanelAddFilter: "Agregar filtro",
          filterPanelRemoveAll: "Eliminar todos",
          filterPanelDeleteIconLabel: "Eliminar",
          filterPanelColumns: "Columnas",
          filterPanelInputLabel: "Valor",
          filterPanelInputPlaceholder: "Valor del filtro",

          // Filter operators
          filterOperatorContains: "Contiene",
          filterOperatorDoesNotContain: "No contiene",
          filterOperatorEquals: "Igual a",
          filterOperatorDoesNotEqual: "No es igual a",
          filterOperatorStartsWith: "Empieza con",
          filterOperatorEndsWith: "Termina con",
          filterOperatorIsEmpty: "Está vacío",
          filterOperatorIsNotEmpty: "No está vacío",
          filterOperatorIsAnyOf: "Es uno de",

          // Filter operators extra
          filterOperatorAfter: "Después de",
          filterOperatorOnOrAfter: "En o después de",
          filterOperatorBefore: "Antes de",
          filterOperatorOnOrBefore: "En o antes de",
          filterOperatorIs: "Es",
          filterOperatorNot: "No es",

          // No rows & errors
          noRowsLabel: "No hay datos",

          // Pagination
          footerRowSelected: (count) =>
            count !== 1 ? `${count} filas seleccionadas` : `${count} fila seleccionada`,
          footerTotalRows: "Filas totales:",
          paginationRowsPerPage: "Filas por página:",

          // Density selector
          toolbarDensity: "Densidad",
          toolbarDensityComfortable: "Cómoda",
          toolbarDensityStandard: "Estándar",
          toolbarDensityCompact: "Compacta",

          // Toolbar
          toolbarFilters: "Filtros",
          toolbarFiltersLabel: "Mostrar filtros",
          toolbarFiltersTooltipHide: "Ocultar filtros",
          toolbarFiltersTooltipShow: "Mostrar filtros",
          }}
          sx={{ border: 0 }}
        />
      </Paper>
    </>
  );
};

export default ProductsTable;


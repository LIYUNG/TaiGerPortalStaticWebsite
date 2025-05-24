import {
    Box
    //  Button, Stack
} from '@mui/material';
import {
    MRT_GlobalFilterTextField as MRTGlobalFilterTextField,
    MRT_ToggleFiltersButton as MRTToggleFiltersButton
} from 'material-react-table';
// import PersonAddIcon from '@mui/icons-material/PersonAdd';

// import { useTranslation } from 'react-i18next';

export const TopToolbar = ({ table, toolbarStyle }) => {
    // const { t } = useTranslation();
    return (
        <Box sx={toolbarStyle}>
            <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <MRTGlobalFilterTextField table={table} />
                <MRTToggleFiltersButton sx={{ height: '40px' }} table={table} />
            </Box>
            {/* <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button
                    color="success"
                    disabled={table.getSelectedRowModel().rows?.length === 0}
                    onClick={onAssignClick}
                    startIcon={<PersonAddIcon />}
                    sx={{ mr: 1 }}
                    variant="contained"
                >
                    {t('Assign', { ns: 'common' })}
                </Button>
            </Stack> */}
        </Box>
    );
};

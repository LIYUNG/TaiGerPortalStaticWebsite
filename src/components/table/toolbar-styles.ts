export const useTableStyles = () => {
    return {
        tableHeadCellStyle: {
            py: 2,
            px: 1,
            '& .MuiInputAdornment-root': {
                height: 32
            },
            '& .MuiSvgIcon-root': {
                fontSize: 20
            }
        },
        toolbarStyle: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 'fit-content',
            pb: 1,
            flexWrap: 'wrap',
            bgcolor: 'transparent'
        }
    };
};

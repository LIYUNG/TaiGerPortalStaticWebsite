import React from 'react';
import {
    Box,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Divider,
    Grid
} from '@mui/material';

// Generic field renderer for view mode
const ViewField = ({ field, lead }) => {
    const value = field.accessor ? field.accessor(lead) : lead[field.key];

    if (field.type === 'chip') {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                    color={field.color ? field.color(value) : 'default'}
                    label={value || 'Unknown'}
                    size="small"
                />
                {field.additionalContent && field.additionalContent(lead)}
            </Box>
        );
    }

    if (field.type === 'custom') {
        return field.render(lead);
    }

    return (
        <Typography variant="body1" sx={field.sx}>
            {value || field.defaultValue || 'N/A'}
        </Typography>
    );
};

// Generic field renderer for edit mode
const EditField = ({ field, formData, onFieldChange }) => {
    const value = formData[field.key] || '';

    // Use editField config if available, otherwise use the field itself
    const editConfig = field.editField || field;

    if (editConfig.type === 'select') {
        return (
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                    label={field.label}
                    onChange={(e) => onFieldChange(field.key, e.target.value)}
                    value={value}
                >
                    {editConfig.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }

    return (
        <TextField
            fullWidth
            label={field.label}
            multiline={editConfig.multiline}
            onChange={(e) => onFieldChange(field.key, e.target.value)}
            rows={editConfig.rows}
            sx={{ mb: 2 }}
            type={editConfig.inputType || field.inputType}
            value={value}
        />
    );
};

// Generic Card Content Component
export const GenericCardContent = ({
    config,
    lead,
    isEditing,
    formData,
    onFieldChange
}) => {
    if (!isEditing) {
        return (
            <>
                {config.layout === 'grid' ? (
                    <>
                        <Grid container spacing={2}>
                            {config.sections.map((section, sectionIndex) => (
                                <Grid
                                    item
                                    key={sectionIndex}
                                    md={section.gridSize || 4}
                                    xs={12}
                                >
                                    {section.title && (
                                        <Typography
                                            fontWeight="bold"
                                            variant="subtitle2"
                                        >
                                            {section.title}
                                        </Typography>
                                    )}
                                    {section.fields.map((field, fieldIndex) => (
                                        <Box
                                            key={fieldIndex}
                                            sx={{
                                                mb:
                                                    field.type === 'title'
                                                        ? 1
                                                        : 2
                                            }}
                                        >
                                            {field.type !== 'custom' &&
                                                field.type !== 'chip' && (
                                                    <Typography
                                                        color="text.secondary"
                                                        variant="body2"
                                                    >
                                                        {field.label}
                                                    </Typography>
                                                )}
                                            <ViewField
                                                field={field}
                                                lead={lead}
                                            />
                                        </Box>
                                    ))}
                                </Grid>
                            ))}
                        </Grid>
                        {/* Render additional fields if they exist */}
                        {config.fields &&
                            config.fields.map((field, index) => (
                                <Box key={`additional-${index}`} sx={{ mb: 2 }}>
                                    {field.type !== 'custom' &&
                                        field.type !== 'chip' && (
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                {field.label}
                                            </Typography>
                                        )}
                                    <ViewField field={field} lead={lead} />
                                </Box>
                            ))}
                    </>
                ) : (
                    config.fields.map((field, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                            {field.type !== 'custom' &&
                                field.type !== 'chip' && (
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        {field.label}
                                    </Typography>
                                )}
                            <ViewField field={field} lead={lead} />
                        </Box>
                    ))
                )}
                {config.divider && <Divider sx={{ my: 2 }} />}
                {config.additionalContent && config.additionalContent(lead)}
            </>
        );
    }

    return (
        <>
            {config.layout === 'grid' ? (
                <>
                    <Grid container spacing={2}>
                        {config.sections.map((section, sectionIndex) => (
                            <Grid
                                item
                                key={sectionIndex}
                                md={section.gridSize || 4}
                                xs={12}
                            >
                                {section.title && (
                                    <Typography
                                        fontWeight="bold"
                                        sx={{ mb: 1 }}
                                        variant="subtitle2"
                                    >
                                        {section.title}
                                    </Typography>
                                )}
                                {section.fields.map((field, fieldIndex) => (
                                    <EditField
                                        key={fieldIndex}
                                        field={field}
                                        formData={formData}
                                        onFieldChange={onFieldChange}
                                    />
                                ))}
                            </Grid>
                        ))}
                    </Grid>
                    {/* Render additional fields if they exist */}
                    {config.fields &&
                        config.fields.map((field, index) => (
                            <EditField
                                key={`additional-${index}`}
                                field={field}
                                formData={formData}
                                onFieldChange={onFieldChange}
                            />
                        ))}
                </>
            ) : (
                config.fields.map((field, index) => (
                    <EditField
                        key={index}
                        field={field}
                        formData={formData}
                        onFieldChange={onFieldChange}
                    />
                ))
            )}
            {config.divider && <Divider sx={{ my: 2 }} />}
            {config.editAdditionalContent &&
                config.editAdditionalContent(formData, onFieldChange)}
        </>
    );
};

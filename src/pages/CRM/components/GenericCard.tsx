import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
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
    Grid,
    SxProps,
    Theme
} from '@mui/material';

interface SelectOption {
    value: string;
    label: string;
}

interface FieldEditConfig {
    type?: string;
    multiline?: boolean;
    rows?: number;
    inputType?: string;
    options?: SelectOption[];
    renderEdit?: (args: {
        field: FieldConfig;
        formData: Record<string, unknown>;
        onFieldChange: (key: string, value: string) => void;
    }) => ReactNode;
}

interface FieldConfig {
    key: string;
    label?: string;
    type?: string;
    sx?: SxProps<Theme>;
    defaultValue?: string;
    inputType?: string;
    multiline?: boolean;
    rows?: number;
    accessor?: (record: Record<string, unknown>) => unknown;
    color?: (
        value: unknown
    ) =>
        | 'default'
        | 'primary'
        | 'secondary'
        | 'error'
        | 'info'
        | 'success'
        | 'warning';
    additionalContent?: (record: Record<string, unknown>) => ReactNode;
    render?: (record: Record<string, unknown>) => ReactNode;
    renderEdit?: (args: {
        field: FieldConfig;
        formData: Record<string, unknown>;
        onFieldChange: (key: string, value: string) => void;
    }) => ReactNode;
    editField?: FieldEditConfig;
    options?: SelectOption[];
}

interface SectionConfig {
    title?: string;
    gridSize?: number;
    fields: FieldConfig[];
}

interface CardConfig {
    layout?: string;
    sections?: SectionConfig[];
    fields?: FieldConfig[];
    divider?: boolean;
    additionalContent?: (record: Record<string, unknown>) => ReactNode;
    editAdditionalContent?: (
        formData: Record<string, unknown>,
        onFieldChange: (key: string, value: string) => void
    ) => ReactNode;
}

interface ViewFieldProps {
    field: FieldConfig;
    lead: Record<string, unknown>;
    t: TFunction;
}

interface EditFieldProps {
    field: FieldConfig;
    formData: Record<string, unknown>;
    onFieldChange: (key: string, value: string) => void;
}

interface GenericCardContentProps {
    config: CardConfig;
    lead: Record<string, unknown>;
    isEditing: boolean;
    formData: Record<string, unknown>;
    onFieldChange: (key: string, value: string) => void;
}

// Generic field renderer for view mode
const ViewField = ({ field, lead, t }: ViewFieldProps) => {
    const value = field.accessor ? field.accessor(lead) : lead[field.key];
    const displayValue =
        value == null || value === ''
            ? null
            : Array.isArray(value)
              ? value.join(', ')
              : `${value}`;

    if (field.type === 'chip') {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                    color={field.color ? field.color(value) : 'default'}
                    label={displayValue ?? t('common.unknown', { ns: 'crm' })}
                    size="small"
                />
                {field.additionalContent && field.additionalContent(lead)}
            </Box>
        );
    }

    if (field.type === 'custom') {
        return field.render ? field.render(lead) : null;
    }

    return (
        <Typography sx={field.sx} variant="body1">
            {displayValue ||
                field.defaultValue ||
                t('common.na', { ns: 'crm' })}
        </Typography>
    );
};

// Generic field renderer for edit mode
const EditField = ({ field, formData, onFieldChange }: EditFieldProps) => {
    const rawValue = formData[field.key];
    let value = typeof rawValue === 'string' ? rawValue : `${rawValue ?? ''}`;

    if (Array.isArray(rawValue)) {
        if (rawValue.length > 0 && typeof rawValue[0] === 'object') {
            value = rawValue
                .map((item) => {
                    if (!item || typeof item !== 'object')
                        return `${item ?? ''}`;
                    const obj = item as Record<string, unknown>;
                    const candidate =
                        obj.note ??
                        obj.tag ??
                        obj.label ??
                        obj.value ??
                        obj.name;
                    return `${candidate ?? ''}`.trim();
                })
                .filter(Boolean)
                .join('\n');
        } else {
            value = rawValue.map((item) => `${item ?? ''}`).join(', ');
        }
    }

    // Use editField config if available, otherwise use the field itself
    const editConfig = field.editField || field;

    if (
        editConfig.type === 'custom' &&
        typeof editConfig.renderEdit === 'function'
    ) {
        return editConfig.renderEdit({ field, formData, onFieldChange });
    }

    if (editConfig.type === 'select') {
        return (
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                    label={field.label}
                    onChange={(e) => onFieldChange(field.key, e.target.value)}
                    value={value}
                >
                    {(editConfig.options ?? []).map((option: SelectOption) => (
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
    formData: rawFormData,
    onFieldChange
}: GenericCardContentProps) => {
    const formData = (rawFormData ?? {}) as Record<string, string>;
    const { t } = useTranslation();
    if (!isEditing) {
        return (
            <>
                {config.layout === 'grid' ? (
                    <>
                        <Grid container spacing={2}>
                            {(config.sections ?? []).map(
                                (section, sectionIndex) => (
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
                                        {section.fields.map(
                                            (field, fieldIndex) => (
                                                <Box
                                                    key={fieldIndex}
                                                    sx={{
                                                        mb:
                                                            field.type ===
                                                            'title'
                                                                ? 1
                                                                : 2
                                                    }}
                                                >
                                                    {field.type !== 'custom' &&
                                                        field.type !==
                                                            'chip' && (
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
                                                        t={t}
                                                    />
                                                </Box>
                                            )
                                        )}
                                    </Grid>
                                )
                            )}
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
                                    <ViewField
                                        field={field}
                                        lead={lead}
                                        t={t}
                                    />
                                </Box>
                            ))}
                    </>
                ) : (
                    (config.fields ?? []).map((field, index) => (
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
                            <ViewField field={field} lead={lead} t={t} />
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
                        {(config.sections ?? []).map(
                            (section, sectionIndex) => (
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
                                            field={field}
                                            formData={formData}
                                            key={fieldIndex}
                                            onFieldChange={onFieldChange}
                                        />
                                    ))}
                                </Grid>
                            )
                        )}
                    </Grid>
                    {/* Render additional fields if they exist */}
                    {config.fields &&
                        config.fields.map((field, index) => (
                            <EditField
                                field={field}
                                formData={formData}
                                key={`additional-${index}`}
                                onFieldChange={onFieldChange}
                            />
                        ))}
                </>
            ) : (
                (config.fields ?? []).map((field, index) => (
                    <EditField
                        field={field}
                        formData={formData}
                        key={index}
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

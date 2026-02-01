import React from 'react';
import { Autocomplete, TextField, Chip, Box } from '@mui/material';

export interface SearchableMultiSelectOption {
    label: string;
    color?: string;
}

export type SearchableMultiSelectData =
    | Record<string, SearchableMultiSelectOption>
    | string[];

export interface SearchableMultiSelectProps {
    data: SearchableMultiSelectData;
    value: string[];
    setValue: (newValue: string[]) => void;
    label?: string;
    [key: string]: unknown;
}

/**
 * A searchable multi-select dropdown component built with Material-UI's Autocomplete.
 * Supports single-column or multi-column data representation with customizable colors and labels.
 */
const SearchableMultiSelect = ({
    data,
    value,
    setValue,
    label = 'Select Options',
    ...props
}: SearchableMultiSelectProps) => {
    const handleValueChange = (
        _event: React.SyntheticEvent,
        newValue: string[]
    ) => {
        setValue(newValue);
    };

    const options = Array.isArray(data) ? data : Object.keys(data);

    const getOptionLabel = (option: string) =>
        Array.isArray(data)
            ? option
            : ((data as Record<string, SearchableMultiSelectOption>)[option]
                  ?.label ?? option);

    return (
        <div>
            <Autocomplete
                disableCloseOnSelect
                filterOptions={(
                    optionsList: string[],
                    { inputValue }: { inputValue: string }
                ) => {
                    const searchString = inputValue.toLowerCase();
                    const getSearchTarget = (option: string) =>
                        Array.isArray(data)
                            ? option
                            : option.concat(
                                  (
                                      data as Record<
                                          string,
                                          SearchableMultiSelectOption
                                      >
                                  )[option]?.label ?? ''
                              );

                    const filteredSelected =
                        value?.filter((option) =>
                            getSearchTarget(option)
                                ?.toLowerCase()
                                .includes(searchString)
                        ) ?? [];

                    const filteredUnselected =
                        optionsList?.filter(
                            (option) =>
                                !value?.includes(option) &&
                                getSearchTarget(option)
                                    .toLowerCase()
                                    .includes(searchString)
                        ) ?? [];

                    return [...filteredSelected, ...filteredUnselected];
                }}
                id="searchable-multi-select"
                multiple
                onChange={handleValueChange}
                options={options}
                renderInput={(params) => (
                    <TextField {...params} label={label} />
                )}
                renderOption={(props, option) => {
                    const { key, ...rest } = props;
                    const isSelected = value?.includes(option);
                    const dataRecord = Array.isArray(data)
                        ? null
                        : (data as Record<string, SearchableMultiSelectOption>)[
                              option
                          ];

                    return (
                        <li
                            key={key}
                            {...rest}
                            style={{
                                fontWeight: isSelected ? 700 : 400,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px',
                                gap: '16px'
                            }}
                        >
                            {dataRecord?.label != null ? (
                                <span>{dataRecord.label}</span>
                            ) : null}
                            <span>{option}</span>
                        </li>
                    );
                }}
                renderTags={(tagValue, getTagProps) => (
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5
                        }}
                    >
                        {tagValue.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({
                                index
                            });
                            const chipColor = Array.isArray(data)
                                ? 'primary'
                                : ((
                                      data as Record<
                                          string,
                                          SearchableMultiSelectOption
                                      >
                                  )[option]?.color ?? 'primary');
                            return (
                                <Chip
                                    key={key}
                                    label={option}
                                    sx={{
                                        backgroundColor: Array.isArray(data)
                                            ? 'primary'
                                            : ((
                                                  data as Record<
                                                      string,
                                                      SearchableMultiSelectOption
                                                  >
                                              )[option]?.color ?? 'primary')
                                    }}
                                    {...tagProps}
                                />
                            );
                        })}
                    </Box>
                )}
                value={value}
                {...props}
            />
        </div>
    );
};

export default SearchableMultiSelect;

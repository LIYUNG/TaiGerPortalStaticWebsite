import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';

export interface BreadcrumbItem {
    label: string;
    link: string;
}

interface BreadcrumbsNavigationProps {
    items: BreadcrumbItem[];
}

export const BreadcrumbsNavigation = ({
    items
}: BreadcrumbsNavigationProps): JSX.Element => {
    return (
        <Breadcrumbs aria-label="breadcrumb">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return isLast ? (
                    <Typography color="text.primary" key={index}>
                        {item.label}
                    </Typography>
                ) : (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        key={index}
                        to={item.link}
                        underline="hover"
                    >
                        {item.label}
                    </Link>
                );
            })}
        </Breadcrumbs>
    );
};

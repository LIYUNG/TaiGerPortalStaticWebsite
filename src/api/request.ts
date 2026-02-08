import axios, { type AxiosRequestConfig } from 'axios';
import { baseUrl, tenantId as envTenantId } from '../env';

export const BASE_URL = baseUrl;

const tenantId = envTenantId;

const request = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        tenantId: tenantId ?? ''
    },
    withCredentials: true,
    validateStatus: (status) => status < 500
});

export const postData = async <T = unknown>(
    url: string,
    payload: unknown
): Promise<T> => {
    try {
        const response = await request.post<T>(url, payload);
        if (response.status >= 400) {
            throw new Error(
                (response.data as { message?: string })?.message ||
                    'An unknown error occurred'
            );
        }
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const putData = async <T = unknown>(
    url: string,
    payload: unknown
): Promise<T> => {
    try {
        const response = await request.put<T>(url, payload);
        if (response.status >= 400) {
            throw new Error(
                (response.data as { message?: string })?.message ||
                    'An unknown error occurred'
            );
        }
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getData = async <T = unknown>(url: string): Promise<T> => {
    try {
        const response = await request.get<T>(url);
        if (response.status >= 400) {
            throw new Error(
                (response.data as { message?: string })?.message ||
                    'An unknown error occurred'
            );
        }
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getDataBlob = async <T = Blob>(
    url: string,
    config?: AxiosRequestConfig
): Promise<T> => {
    try {
        const response = await request.get<T>(url, config);
        if (response.status >= 400) {
            throw new Error(
                (response.data as { message?: string })?.message ||
                    'An unknown error occurred'
            );
        }
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const deleteData = async <T = unknown>(url: string): Promise<T> => {
    try {
        const response = await request.delete<T>(url);
        if (response.status >= 400) {
            throw new Error(
                (response.data as { message?: string })?.message ||
                    'An unknown error occurred'
            );
        }
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export { request };

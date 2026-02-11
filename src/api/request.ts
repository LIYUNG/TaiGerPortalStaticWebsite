import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
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

const DEFAULT_ERROR_MESSAGE = 'An unknown error occurred';

type ErrorResponseBody = { message?: string };

function getErrorMessage(data: unknown): string {
    return (data as ErrorResponseBody)?.message ?? DEFAULT_ERROR_MESSAGE;
}

async function executeRequest<T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<T> {
    try {
        const response = await requestFn();
        if (response.status >= 400) {
            throw new Error(getErrorMessage(response.data));
        }
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const postData = async <T = unknown>(
    url: string,
    payload: unknown
): Promise<T> => executeRequest(() => request.post<T>(url, payload));

export const putData = async <T = unknown>(
    url: string,
    payload: unknown
): Promise<T> => executeRequest(() => request.put<T>(url, payload));

export const getData = async <T = unknown>(url: string): Promise<T> =>
    executeRequest(() => request.get<T>(url));

export const getDataBlob = async <T = Blob>(
    url: string,
    config?: AxiosRequestConfig
): Promise<T> => executeRequest(() => request.get<T>(url, config));

export const deleteData = async <T = unknown>(url: string): Promise<T> =>
    executeRequest(() => request.delete<T>(url));

export { request };

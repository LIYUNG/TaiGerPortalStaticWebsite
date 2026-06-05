import axios, {
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig
} from 'axios';
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

/**
 * Multipart uploads must NOT carry the instance's default
 * `Content-Type: application/json`. axios 0.x stripped it automatically for
 * FormData bodies; axios 1.x sends the pre-set default verbatim, so the request
 * goes out without a `multipart/form-data; boundary=...` header and the backend
 * (multer `.array('files')`) parses zero files — which broke multi-file uploads.
 *
 * Deleting the header here lets axios/the browser set multipart with the correct
 * boundary. Exported for unit testing. Cross-version safe: axios 1.x headers are
 * an `AxiosHeaders` instance (`.delete()`); 0.x headers are a plain object.
 */
export const stripJsonContentTypeForFormData = (
    config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
        const headers = config.headers as unknown as {
            delete?: (name: string) => void;
            [key: string]: unknown;
        };
        if (headers) {
            if (typeof headers.delete === 'function') {
                headers.delete('Content-Type');
            } else {
                delete headers['Content-Type'];
            }
        }
    }
    return config;
};

request.interceptors.request.use(stripJsonContentTypeForFormData);

const DEFAULT_ERROR_MESSAGE = 'An unknown error occurred';

type ErrorResponseBody = { message?: string };

function getErrorMessage(data: unknown): string {
    return (data as ErrorResponseBody)?.message ?? DEFAULT_ERROR_MESSAGE;
}

async function executeRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>
): Promise<T> {
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

export const patchData = async <T = unknown>(
    url: string,
    payload: unknown
): Promise<T> => executeRequest(() => request.patch<T>(url, payload));

export const getData = async <T = unknown>(url: string): Promise<T> =>
    executeRequest(() => request.get<T>(url));

export const getDataBlob = async <T = Blob>(
    url: string,
    config?: AxiosRequestConfig
): Promise<T> => executeRequest(() => request.get<T>(url, config));

export const deleteData = async <T = unknown>(url: string): Promise<T> =>
    executeRequest(() => request.delete<T>(url));

export { request };

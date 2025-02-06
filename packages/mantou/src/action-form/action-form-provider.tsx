import React, { createContext, type ReactNode, useContext } from 'react';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

interface ActionFormProviderProps {
    client?: AxiosInstance | ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>);
    onResponse?: (response: Response | AxiosResponse) => void | Promise<void>;
    onError?: (error: any) => void | Promise<void>;
    children: ReactNode;
}

interface ActionFormContext {
    client: AxiosInstance | ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>);
    onResponse?: (response: Response | AxiosResponse) => void | Promise<void>;
    onError?: (error: any) => void | Promise<void>;
}

const ActionFormContext = createContext<ActionFormContext | undefined>(undefined);

export const ActionFormProvider: React.FC<ActionFormProviderProps> = ({ client = axios, onResponse, onError, children }) => {
    return (
        <ActionFormContext.Provider value={{
            client,
            onResponse,
            onError,
        }}>
            {children}
        </ActionFormContext.Provider>
    );
};

export const useActionForm = (): ActionFormContext  => {
    const context = useContext(ActionFormContext);
    if (context === undefined) {
        throw new Error('useActionForm must be used within an ActionFormProvider');
    }
    return context;
};
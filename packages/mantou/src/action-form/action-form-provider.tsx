import React, { createContext, type ReactNode, useContext } from 'react';
import bunios, { type BuniosInstance, type BuniosResponse } from 'bunios';

interface ActionFormProviderProps {
    client?: BuniosInstance | ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>);
    onResponse?: (response: Response | BuniosResponse) => void | Promise<void>;
    onError?: (error: any) => void | Promise<void>;
    baseActionUrl?: string;
    children: ReactNode;
}

interface ActionFormContext {
    client: BuniosInstance | ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>);
    onResponse?: (response: Response | BuniosResponse) => void | Promise<void>;
    onError?: (error: any) => void | Promise<void>;
    baseActionUrl?: string;
}

const ActionFormContext = createContext<ActionFormContext | undefined>(undefined);

export const ActionFormProvider: React.FC<ActionFormProviderProps> = ({ client = bunios, onResponse, onError, children, baseActionUrl }) => {
    return (
        <ActionFormContext.Provider value={{
            client,
            onResponse,
            onError,
            baseActionUrl,
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
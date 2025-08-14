import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Status = 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export type Application = {
    id: string;
    company: string;
    position: string;
    status: Status;
    dateApplied: string;
    notes?: string;
};

type ApplicationsContextType = {
    applications: Application[];
    addApplication: (app: Application) => void;
    updateApplication: (id: string, updated: Partial<Application>) => void;
    deleteApplication: (id: string) => void;
};

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

export const ApplicationsProvider = ({ children }: { children: ReactNode }) => {
    const [applications, setApplications] = useState<Application[]>([]);

    const addApplication = (app: Application) => {
        setApplications(prev => [...prev, app]);
    };

    const updateApplication = (id: string, updated: Partial<Application>) => {
        setApplications(prev =>
            prev.map(app => (app.id === id ? { ...app, ...updated } : app))
        );
    };

    const deleteApplication = (id: string) => {
        setApplications(prev => prev.filter(app => app.id !== id));
    };

    return (
        <ApplicationsContext.Provider
            value={{ applications, addApplication, updateApplication, deleteApplication }}
        >
            {children}
        </ApplicationsContext.Provider>
    );
};

export const useApplications = () => {
    const context = useContext(ApplicationsContext);
    if (!context) throw new Error('useApplications must be used inside ApplicationsProvider');
    return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    addApplication: (app: Application) => Promise<void>;
    updateApplication: (id: string, updated: Partial<Application>) => Promise<void>;
    deleteApplication: (id: string) => Promise<void>;
};

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

const STORAGE_KEY = '@applications';

export const ApplicationsProvider = ({ children }: { children: ReactNode }) => {
    const [applications, setApplications] = useState<Application[]>([]);

    // Load on mount
    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setApplications(JSON.parse(stored));
                }
            } catch (error) {
                console.error('Failed to load applications:', error);
            }
        })();
    }, []);

    const saveApplications = async (apps: Application[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
        } catch (error) {
            console.error('Failed to save applications:', error);
        }
    };

    const addApplication = async (app: Application) => {
        const updated = [...applications, app];
        setApplications(updated);
        await saveApplications(updated);
    };

    const updateApplication = async (id: string, updated: Partial<Application>) => {
        const updatedApps = applications.map(app => {
            if (app.id !== id) return app;

            let newStatus: Status = app.status;
            if (updated.status && ['Applied', 'Interview', 'Offer', 'Rejected'].includes(updated.status)) {
                newStatus = updated.status as Status;
            }

            return { ...app, ...updated, status: newStatus };
        });

        setApplications(updatedApps);
        await saveApplications(updatedApps);
    };

    const deleteApplication = async (id: string) => {
        const updated = applications.filter(app => app.id !== id);
        setApplications(updated);
        await saveApplications(updated);
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

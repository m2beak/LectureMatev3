import React, { createContext, useContext, useState, ReactNode } from "react";

interface FocusContextType {
    isFocusMode: boolean;
    toggleFocusMode: () => void;
    setFocusMode: (value: boolean) => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider = ({ children }: { children: ReactNode }) => {
    const [isFocusMode, setIsFocusMode] = useState(false);

    const toggleFocusMode = () => setIsFocusMode((prev) => !prev);
    const setFocusMode = (value: boolean) => setIsFocusMode(value);

    return (
        <FocusContext.Provider value={{ isFocusMode, toggleFocusMode, setFocusMode }}>
            {children}
        </FocusContext.Provider>
    );
};

export const useFocusMode = () => {
    const context = useContext(FocusContext);
    if (context === undefined) {
        throw new Error("useFocusMode must be used within a FocusProvider");
    }
    return context;
};

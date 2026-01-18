import { useState, useCallback } from "react";

type SettingsOption = "account" | "profile" | "manage" | "logout";

interface UseSettingsMenuReturn {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    handleOptionClick: (option: SettingsOption) => void;
}

const useSettingsMenu = (
    onOptionSelect?: (option: SettingsOption) => void
): UseSettingsMenuReturn => {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    const handleOptionClick = useCallback(
        (option: SettingsOption) => {
            onOptionSelect?.(option);
            close();
        },
        [onOptionSelect, close]
    );

    return { isOpen, open, close, toggle, handleOptionClick };
};

export default useSettingsMenu;

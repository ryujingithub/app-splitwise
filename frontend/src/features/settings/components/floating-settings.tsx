import { useNavigate } from "react-router";
import { useState } from "react";
import {
    Settings,
    User,
    UserCircle,
    SlidersHorizontal,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/auth/hooks/use-auth";

interface SettingsMenuItem {
    id: "account" | "profile" | "manage" | "logout";
    label: string;
    icon: React.ReactNode;
    variant?: "default" | "destructive";
}

const menuItems: SettingsMenuItem[] = [
    { id: "account", label: "Account", icon: <User className="h-5 w-5" /> },
    {
        id: "profile",
        label: "Profile",
        icon: <UserCircle className="h-5 w-5" />,
    },
    {
        id: "manage",
        label: "Manage",
        icon: <SlidersHorizontal className="h-5 w-5" />,
    },
    {
        id: "logout",
        label: "Logout",
        icon: <LogOut className="h-5 w-5" />,
        variant: "destructive",
    },
];

const FloatingSettings = () => {
    const navigate = useNavigate();
    const { logout: onLogout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionClick = (id: SettingsMenuItem["id"]) => {
        setIsOpen(false);
        if (id === "logout") {
            onLogout?.();
        } else {
            navigate(`/settings/${id}`);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 sm:h-12 sm:w-12"
                        aria-label="Open settings menu">
                        <Settings className="h-6 w-6 sm:h-5 sm:w-5" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    side="top"
                    align="end"
                    sideOffset={12}
                    className="w-56 p-2 sm:w-48">
                    <nav className="flex flex-col gap-1">
                        {menuItems.map((item) => (
                            <Button
                                key={item.id}
                                variant="ghost"
                                className={`h-12 w-full justify-start gap-3 px-3 text-base sm:h-10 sm:text-sm ${
                                    item.variant === "destructive"
                                        ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        : ""
                                }`}
                                onClick={() => handleOptionClick(item.id)}>
                                {item.icon}
                                {item.label}
                            </Button>
                        ))}
                    </nav>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default FloatingSettings;

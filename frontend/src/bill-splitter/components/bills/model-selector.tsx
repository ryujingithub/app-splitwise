import React, { useEffect, useMemo } from "react";
import { Bot, RefreshCw, Cpu, DollarSign } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useModels } from "@/bill-splitter/hooks/use-models";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
    value: string;
    onValueChange: (value: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
    value,
    onValueChange,
}) => {
    const { models, isLoading, isSyncing, syncModels } = useModels();

    // Find the currently selected model object to render custom trigger view
    const selectedModel = useMemo(
        () => models.find((m) => m.id === value),
        [models, value]
    );

    // Auto-select Default Logic
    useEffect(() => {
        if (!value && models.length > 0) {
            const defaultModel = models.find(
                (m) => m.id === "gemini-2.5-flash"
            );
            // Fallback to the first model if the specific default isn't found
            onValueChange(defaultModel ? defaultModel.id : models[0].id);
        }
    }, [models, value, onValueChange]);

    return (
        <div className="flex gap-2 items-center w-full sm:w-auto">
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger className="w-full sm:w-[320px] h-10 bg-background text-sm">
                    {/*
            FIX: We pass children to SelectValue.
            This overrides the default behavior of rendering the massive SelectItem content.
          */}
                    <SelectValue placeholder="Select a model">
                        {selectedModel ? (
                            <div className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        "flex items-center justify-center w-5 h-5 rounded-md",
                                        selectedModel.isCheapest
                                            ? "bg-green-100 text-green-700"
                                            : "bg-indigo-100 text-indigo-700"
                                    )}>
                                    <Bot className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-medium truncate">
                                    {selectedModel.name}
                                </span>
                                {selectedModel.isCheapest && (
                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold leading-none ml-auto sm:ml-0">
                                        ECONOMY
                                    </span>
                                )}
                            </div>
                        ) : (
                            "Select a model"
                        )}
                    </SelectValue>
                </SelectTrigger>

                <SelectContent className="max-h-[400px]">
                    {isLoading ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                            Loading models...
                        </div>
                    ) : (
                        models.map((model) => (
                            <SelectItem
                                key={model.id}
                                value={model.id}
                                className="py-3 border-b last:border-0 cursor-pointer">
                                <div className="flex items-start gap-3">
                                    {/* Detailed View in Dropdown */}
                                    <div
                                        className={cn(
                                            "mt-0.5 p-1.5 rounded-md shrink-0 transition-colors",
                                            model.isCheapest
                                                ? "bg-green-100 text-green-700 group-hover:bg-green-200"
                                                : "bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200"
                                        )}>
                                        <Bot className="w-4 h-4" />
                                    </div>

                                    <div className="flex flex-col gap-1 text-left max-w-[260px]">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-sm leading-none">
                                                {model.name}
                                            </span>
                                            {model.isCheapest && (
                                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                                                    ECONOMY
                                                </span>
                                            )}
                                        </div>

                                        <span className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                                            {model.description ||
                                                "No description available."}
                                        </span>

                                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground/80 font-mono">
                                            {model.limit && (
                                                <span className="flex items-center gap-1">
                                                    <Cpu className="w-3 h-3" />
                                                    {(
                                                        model.limit / 1000
                                                    ).toFixed(0)}
                                                    k ctx
                                                </span>
                                            )}
                                            {model.price && (
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="w-3 h-3" />
                                                    {model.price.includes(
                                                        "Free"
                                                    )
                                                        ? "Free Tier"
                                                        : "Standard"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => syncModels()}
                disabled={isSyncing}
                title="Sync models from server"
                className="h-10 w-10 shrink-0 border border-input bg-background hover:bg-accent">
                <RefreshCw
                    className={cn(
                        "w-4 h-4 text-muted-foreground",
                        isSyncing && "animate-spin"
                    )}
                />
            </Button>
        </div>
    );
};

export default ModelSelector;

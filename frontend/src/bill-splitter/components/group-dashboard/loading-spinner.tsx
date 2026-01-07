import { Loader2 } from "lucide-react";

const LoadingSpinner = () => (
    <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
);
export default LoadingSpinner;

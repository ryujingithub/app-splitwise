import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ocrApi } from "../api/ocr";

type ScanBillVariables = {
    file: File;
    model: string;
};

export const useBillScanner = () => {
    return useMutation({
        mutationFn: ({ file, model }: ScanBillVariables) =>
            ocrApi.parseBill(file, model),
        onError: (error) => {
            const msg = error instanceof Error ? error.message : "Scan failed";
            toast.error(msg);
        },
        onSuccess: () => {
            toast.success("Bill scanned successfully!");
        },
    });
};

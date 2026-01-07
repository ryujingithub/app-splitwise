import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { FileText, Loader2, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseMarkdownTable } from "@/bill-splitter/lib/markdown-parser";
import {
    ReviewItem,
    parserSchema,
    ParsedMarkdownItem,
} from "@/bill-splitter/types";
import { useBillScanner } from "@/bill-splitter/hooks/use-bill-scanner";
import FileUploadZone from "./file-upload";
import ModelSelector from "./model-selector";

interface BillParserFormProps {
    onParseSuccess: (items: ReviewItem[], rawMarkdown: string) => void;
}

const BillParserForm: React.FC<BillParserFormProps> = ({ onParseSuccess }) => {
    // State for the selected model (Defaulting to gpt-4o or your preferred default)
    const [selectedModel, setSelectedModel] = useState<string>("gpt-4o");

    const { mutateAsync: scanBill, isPending } = useBillScanner();

    const form = useForm<z.infer<typeof parserSchema>>({
        resolver: zodResolver(parserSchema),
        defaultValues: {
            markdown: `| Item Name | Qty | Price | Total Price |  `,
        },
    });

    const handleFileUpload = async (file: File) => {
        try {
            // Pass both file and the selected model to the mutation
            const markdown = await scanBill({
                file,
                model: selectedModel,
            });

            if (markdown) {
                form.setValue("markdown", markdown);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCopyOcrInstructions = async () => {
        const instructions = `Extract items: | Item Name | Qty | Price | Total Price |`;
        await navigator.clipboard.writeText(instructions);
        toast.success("Instructions copied");
    };

    const onSubmit = (data: z.infer<typeof parserSchema>) => {
        try {
            const parsed = parseMarkdownTable(
                data.markdown
            ) as ParsedMarkdownItem[];

            if (!parsed?.length) throw new Error("No items found.");

            const items: ReviewItem[] = parsed.map((p) => ({
                id: uuidv4(),
                description: p.description,
                quantity: p.quantity || 1,
                amount: p.amount,
                selectedMemberIds: [],
            }));

            onParseSuccess(items, data.markdown);
            toast.success("Parsed successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Parse failed. Check format.");
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Import Bill
                </CardTitle>
                <CardDescription>
                    Configure your scanner and upload a receipt.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Toolbar Area: Separated from Header for better UI */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-end border-b pb-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            AI Model
                        </label>
                        <ModelSelector
                            value={selectedModel}
                            onValueChange={setSelectedModel}
                        />
                    </div>

                    <Button
                        variant="secondary"
                        onClick={handleCopyOcrInstructions}
                        size="default"
                        className="shrink-0"
                        type="button">
                        <ClipboardCopy className="w-4 h-4 mr-2" />
                        Copy System Prompt
                    </Button>
                </div>

                {/* Upload Zone */}
                <div
                    className={
                        isPending ? "opacity-50 pointer-events-none" : ""
                    }>
                    <FileUploadZone onFileSelect={handleFileUpload} />
                </div>

                {isPending && (
                    <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground py-4 bg-muted/30 rounded-lg animate-pulse">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <p>Analyzing receipt with {selectedModel}...</p>
                    </div>
                )}

                {/* Manual Edit / Result Area */}
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Markdown Result
                        </label>
                        <Textarea
                            {...form.register("markdown")}
                            className="min-h-[200px] font-mono text-sm"
                            disabled={isPending}
                            placeholder="| Item Name | Qty | Price | Total Price |"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending}
                        size="lg">
                        Parse Table & Continue
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default BillParserForm;

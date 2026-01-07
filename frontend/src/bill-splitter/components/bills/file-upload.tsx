import React, { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface FileUploadZoneProps {
    onFileSelect: (file: File) => void;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);

    const validateAndEmit = (file: File) => {
        const validTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "text/plain",
            "text/markdown",
        ];

        // Check mime type OR extension for markdown (some browsers don't detect .md mime correctly)
        const isMarkdown = file.name.endsWith(".md");
        const isValidType = validTypes.includes(file.type) || isMarkdown;

        if (!isValidType) {
            toast.error("Please upload an image or markdown file");
            return;
        }

        onFileSelect(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) validateAndEmit(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) validateAndEmit(file);
    };

    return (
        <div
            className={`group relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                isDragging
                    ? "border-primary bg-primary/5 scale-[0.99]"
                    : "border-muted hover:border-primary/50"
            }`}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}>
            <input
                type="file"
                accept=".md,.txt,.png,.jpg,.jpeg,.webp"
                className="hidden"
                id="file-upload"
                onChange={handleChange}
            />

            <div className="flex flex-col items-center pointer-events-none">
                <Upload
                    className={`w-10 h-10 mb-4 transition-colors ${
                        isDragging ? "text-primary" : "text-muted-foreground"
                    }`}
                />
                <span className="text-sm font-medium text-foreground">
                    Drop Receipt Image or Markdown file
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                    Supports .png, .jpg, .md, .txt
                </span>
            </div>
        </div>
    );
};

export default FileUploadZone;

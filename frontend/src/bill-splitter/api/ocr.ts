export const ocrApi = {
    parseBill: async (file: File, model: string): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("model", model);

        const response = await fetch(`/api/ocr/process`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to process image");
        }

        const data = await response.json();
        return data.markdown;
    },
};

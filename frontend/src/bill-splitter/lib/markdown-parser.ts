export interface ParsedItem {
    description: string;
    quantity?: number;
    amount: number; // Cents
}

/**
 * Parses a markdown table or tab-separated values (TSV) with the format:
 * Markdown:
 * | Description | Quantity | Price | Total Price |
 * |-------------|----------|-------|-------------|
 * | Burger | 2 | 12.50 | 25.00 |
 * | Fries | 1 | 4.00 | 4.00 |
 *
 * TSV:
 * Description	Quantity	Price	Total Price
 * Burger	2	12.50	25.00
 * Fries	1	4.00	4.00
 *
 * - Description: Required, cannot be empty
 * - Quantity: Optional, defaults to undefined (treated as 1 by caller)
 * - Price: Required, converts string decimal to integer cents (e.g. 12.50 -> 1250)
 * - Total Price: Ignored (calculated from Quantity * Price)
 */
export function parseMarkdownTable(markdown: string): ParsedItem[] {
    // Trim and split lines, removing empty lines
    const lines = markdown
        .trim()
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length === 0) {
        throw new Error("No data rows found");
    }

    // Detect format: check first line for pipes
    const firstLine = lines[0];
    const isPipeFormat = firstLine.includes("|");
    const isTabFormat = !isPipeFormat && firstLine.includes("\t");

    if (!isPipeFormat && !isTabFormat) {
        throw new Error(
            "Input must be pipe-separated (markdown) or tab-separated format"
        );
    }

    // Filter out markdown separator lines if pipe format
    const dataLines = isPipeFormat
        ? lines.filter((line) => !/^\|[-\s|]+\|$/.test(line))
        : lines;

    if (dataLines.length === 0) {
        throw new Error("No data rows found");
    }

    // Header Detection: Check if first line has numeric values
    const firstLineParts = splitLine(dataLines[0], isPipeFormat);
    const hasNumericValue = firstLineParts.some((part) => /\d/.test(part));
    const rowsToParse = hasNumericValue ? dataLines : dataLines.slice(1);

    if (rowsToParse.length === 0) {
        throw new Error("No data rows found");
    }

    return rowsToParse.map((line, index) => {
        const parts = splitLine(line, isPipeFormat);

        // Expect at least 3 columns: Description, Quantity, Price
        if (parts.length < 3) {
            throw new Error(
                `Invalid row ${
                    index + 1
                }: "${line}". Expected at least 3 columns (Description, Quantity, Price)`
            );
        }

        const [description, quantityStr, amountStr] = parts;

        // 1. Validate Description
        if (!description) {
            throw new Error(
                `Invalid row ${index + 1}: Description cannot be empty`
            );
        }

        // 2. Parse Quantity (Optional, default to undefined)
        let quantity: number | undefined;
        if (quantityStr && /^\d+$/.test(quantityStr)) {
            const parsed = parseInt(quantityStr, 10);
            if (parsed > 0) quantity = parsed;
        }

        // 3. Parse Amount to Cents (Integer Math Safe)
        const cleanPrice = amountStr.replace(/[^0-9.]/g, "");

        if (!cleanPrice || cleanPrice === ".") {
            throw new Error(
                `Invalid row ${index + 1}: Invalid price "${amountStr}"`
            );
        }

        let amount = 0;

        if (cleanPrice.includes(".")) {
            const [dollarsStr, centsStr] = cleanPrice.split(".");

            const dollars = dollarsStr ? parseInt(dollarsStr, 10) : 0;
            const normalizedCentsStr = (centsStr || "")
                .substring(0, 2)
                .padEnd(2, "0");
            const cents = parseInt(normalizedCentsStr, 10);

            amount = dollars * 100 + cents;
        } else {
            amount = parseInt(cleanPrice, 10) * 100;
        }

        if (amount <= 0) {
            throw new Error(
                `Invalid row ${index + 1}: Price must be greater than 0`
            );
        }

        return {
            description,
            quantity,
            amount,
        };
    });
}

function splitLine(line: string, isPipeFormat: boolean): string[] {
    const delimiter = isPipeFormat ? "|" : "\t";
    let parts = line.split(delimiter).map((p) => p.trim());

    // For pipe format, remove empty first/last elements from leading/trailing pipes
    if (isPipeFormat) {
        if (parts[0] === "") parts = parts.slice(1);
        if (parts[parts.length - 1] === "") parts = parts.slice(0, -1);
    }

    return parts;
}

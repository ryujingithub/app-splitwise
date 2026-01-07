export interface AIModel {
    id: string;
    name: string;
    description?: string;
    limit?: number;
    price?: string;
    isCheapest?: boolean;
}

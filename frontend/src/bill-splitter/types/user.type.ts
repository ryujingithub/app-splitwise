export interface User {
    id: number;
    username: string;
    email: string;
    default_group_id?: number | null;
    created_at: string;
}

export interface CreateUserRequest {
    username: string;
    email: string;
    default_group_id?: number | null;
}

export interface UpdateUserRequest {
    username?: string;
    email?: string;
    default_group_id?: number | null;
}

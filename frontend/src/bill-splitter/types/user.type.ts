export interface CreateUserRequest {
    name: string;
    username: string;
    email: string;
    default_group_id?: number | null;
}

export interface UpdateUserRequest {
    name?: string;
    username?: string;
    email?: string;
    default_group_id?: number | null;
}

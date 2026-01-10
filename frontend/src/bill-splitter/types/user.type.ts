import { ConvexDefaultProps } from "./index.type";

export interface User extends ConvexDefaultProps {
    username: string;
    email: string;
    default_group_id?: number | null;
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

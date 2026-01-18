export interface UpdateUsernamePayload {
    username: string;
}

export interface UpdateEmailPayload {
    email: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateMemberRolePayload {
    memberId: string;
    role: "admin" | "member";
}

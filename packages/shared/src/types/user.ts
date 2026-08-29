export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  user: User;
}

export interface RegisterResponse {
  user: User;
  accessToken?: string;
  verificationRequired: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

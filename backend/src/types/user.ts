export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface UpdateUserRequest {
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
}

export * from "./user.ts";

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiError {
  sucess: false;
  error: string;
  code?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

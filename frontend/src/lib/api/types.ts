export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, any>;
  error?: ApiError;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  has_next: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginatedMeta;
}

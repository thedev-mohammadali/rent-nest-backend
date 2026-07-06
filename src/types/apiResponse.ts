interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SuccessResponse<T> {
  statusCode: number;
  success: true;
  message: string;
  meta?: PaginationMeta;
  data?: T;
}

export interface ErrorResponse {
  statusCode: number;
  success: false;
  message: string;
  errorDetails: string;
  errorStack?: string;
}

export interface RegisterDto {
  firstName: string;
  lastName?: string | undefined;
  email: string;
  password: string;
}

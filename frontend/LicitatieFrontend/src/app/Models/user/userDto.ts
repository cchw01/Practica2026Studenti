import { RoleEnum } from "./user";

export interface UserReadDto {
  ID: number;
  UserName: string;
  Name: string;
  Email: string;
  Role: RoleEnum;
  Rating: number;
  Password?: string;
  avatarUrl? : string;
  profilePictureName?: string;
}

export interface UserUpdateDto{
    UserName: string;
    Name: string;
}
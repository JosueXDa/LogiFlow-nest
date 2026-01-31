import { IsOptional, IsString, IsUUID } from 'class-validator';

export class FindZonasDto {
    @IsString()
    @IsOptional()
    nombre?: string;
}

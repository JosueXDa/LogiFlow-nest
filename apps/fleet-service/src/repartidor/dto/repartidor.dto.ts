import {
    IsString,
    IsNotEmpty,
    IsEmail,
    IsEnum,
    IsUUID,
    IsOptional,
    Matches,
    MinLength,
    MaxLength,
} from 'class-validator';
import { TipoLicencia, EstadoRepartidor } from '../../common/enums';

export class CreateRepartidorDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    apellido: string;

    @IsString()
    @Matches(/^\d{10}$/, { message: 'Cédula debe tener 10 dígitos' })
    cedula: string;

    @IsString()
    @Matches(/^\+593\d{9}$/, {
        message: 'Teléfono debe tener formato +593XXXXXXXXX',
    })
    telefono: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    licencia: string;

    @IsEnum(TipoLicencia)
    tipoLicencia: TipoLicencia;

    @IsUUID()
    zonaId: string;

    @IsOptional()
    @IsUUID()
    vehiculoId?: string;
}

export class UpdateRepartidorDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    nombre?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    apellido?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\+593\d{9}$/, {
        message: 'Teléfono debe tener formato +593XXXXXXXXX',
    })
    telefono?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    licencia?: string;

    @IsOptional()
    @IsEnum(TipoLicencia)
    tipoLicencia?: TipoLicencia;

    @IsOptional()
    @IsUUID()
    zonaId?: string;

    @IsOptional()
    @IsUUID()
    vehiculoId?: string;
}

export class FindRepartidoresDto {
    @IsOptional()
    @IsEnum(EstadoRepartidor)
    estado?: EstadoRepartidor;

    @IsOptional()
    @IsUUID()
    zonaId?: string;
}

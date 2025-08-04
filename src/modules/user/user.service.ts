import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../../dto/user-dto/create-user.dto';
import { CreateAdminUserDto } from '../../dto/user-dto/create-admin-user.dto';
import { UpdateUserDto } from '../../dto/user-dto/update-user.dto';
import { FilterUsersDto } from '../../dto/user-dto/filter-users.dto';
import { User } from '../../interfaces/user.interface';
import { Role } from '../../enum/role.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  // Crear usuario cliente (usado en registro público)
  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Intentando crear usuario cliente: ${createUserDto.email}`);

    try {
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          role: Role.CLIENT, // Siempre será CLIENT
        },
      });

      this.logger.log(`Usuario cliente creado exitosamente: ID ${user.id}`);
      return user as User;
    } catch (error) {
      this.logger.error(
        `Error al crear usuario cliente: ${createUserDto.email}`,
        error,
      );

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = error.meta?.target as string[];
          const fieldName = field?.includes('email') ? 'email' : 'DNI';
          throw new ConflictException(`El ${fieldName} ya está registrado`);
        }
      }

      throw new InternalServerErrorException('Error interno al crear el usuario');
    }
  }

  // Crear usuario por admin (puede asignar cualquier rol)
  async createByAdmin(createAdminUserDto: CreateAdminUserDto): Promise<User> {
    this.logger.log(
      `Admin creando usuario: ${createAdminUserDto.email} con rol ${createAdminUserDto.role}`,
    );

    try {
      const user = await this.prisma.user.create({
        data: createAdminUserDto,
      });

      this.logger.log(`Usuario creado por admin exitosamente: ID ${user.id}`);
      return user as User;
    } catch (error) {
      this.logger.error(
        `Error al crear usuario por admin: ${createAdminUserDto.email}`,
        error,
      );

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = error.meta?.target as string[];
          const fieldName = field?.includes('email') ? 'email' : 'DNI';
          throw new ConflictException(`El ${fieldName} ya está registrado`);
        }
      }

      throw new InternalServerErrorException('Error interno al crear el usuario');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Buscando usuario por email: ${email}`);

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
          deletedAt: null, // Solo usuarios activos
        },
      });

      if (user) {
        this.logger.log(`Usuario encontrado: ID ${user.id}`);
      } else {
        this.logger.log(`Usuario no encontrado para email: ${email}`);
      }

      return user as User | null;
    } catch (error) {
      this.logger.error(`Error al buscar usuario por email: ${email}`, error);
      throw new InternalServerErrorException('Error interno al buscar el usuario');
    }
  }

  async findOne(id: number): Promise<User> {
    this.logger.log(`Buscando usuario por ID: ${id}`);

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
          deletedAt: null, // Solo usuarios activos
        },
      });

      if (!user) {
        this.logger.warn(`Usuario no encontrado: ID ${id}`);
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      this.logger.log(`Usuario encontrado: ID ${user.id}`);
      return user as User;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error al buscar usuario por ID: ${id}`, error);
      throw new InternalServerErrorException('Error interno al buscar el usuario');
    }
  }

  async findAll(filterDto: FilterUsersDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, ...filters } = filterDto;
    const skip = (page - 1) * limit;

    this.logger.log(
      `Obteniendo usuarios - Página: ${page}, Límite: ${limit}, Filtros: ${JSON.stringify(
        filters,
      )}`,
    );

    try {
      // Construir filtros dinámicos
      const where: Prisma.UserWhereInput = {
        deletedAt: null, // Solo usuarios activos
      };

      if (filters.firstName) {
        where.firstName = {
          contains: filters.firstName,
          mode: 'insensitive',
        };
      }

      if (filters.lastName) {
        where.lastName = {
          contains: filters.lastName,
          mode: 'insensitive',
        };
      }

      if (filters.dni) {
        where.dni = {
          contains: filters.dni,
        };
      }

      if (filters.email) {
        where.email = {
          contains: filters.email,
          mode: 'insensitive',
        };
      }

      if (filters.phone) {
        where.phone = {
          contains: filters.phone,
        };
      }

      if (filters.role) {
        where.role = filters.role;
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      this.logger.log(`Usuarios obtenidos: ${users.length} de ${total} total`);

      return {
        users: users as User[],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Error al obtener usuarios', error);
      throw new InternalServerErrorException('Error interno al obtener los usuarios');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Actualizando usuario ID: ${id}`);

    // Verificar que el usuario existe y no está eliminado
    await this.findOne(id);

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });

      this.logger.log(`Usuario actualizado exitosamente: ID ${id}`);
      return user as User;
    } catch (error) {
      this.logger.error(`Error al actualizar usuario ID: ${id}`, error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = error.meta?.target as string[];
          const fieldName = field?.includes('email') ? 'email' : 'DNI';
          throw new ConflictException(`El ${fieldName} ya está en uso por otro usuario`);
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
      }

      throw new InternalServerErrorException('Error interno al actualizar el usuario');
    }
  }

  async softDelete(id: number): Promise<User> {
    this.logger.log(`Eliminando lógicamente usuario ID: ${id}`);

    // Verificar que el usuario existe y no está eliminado
    await this.findOne(id);

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      this.logger.log(`Usuario eliminado lógicamente: ID ${id}`);
      return user as User;
    } catch (error) {
      this.logger.error(`Error al eliminar usuario ID: ${id}`, error);

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      throw new InternalServerErrorException('Error interno al eliminar el usuario');
    }
  }

  async recover(id: number): Promise<User> {
    this.logger.log(`Recuperando usuario eliminado ID: ${id}`);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        this.logger.warn(`Usuario no encontrado para recuperar: ID ${id}`);
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      if (!user.deletedAt) {
        this.logger.warn(`Intento de recuperar usuario no eliminado: ID ${id}`);
        throw new BadRequestException('El usuario no está eliminado');
      }

      const recoveredUser = await this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: null,
        },
      });

      this.logger.log(`Usuario recuperado exitosamente: ID ${id}`);
      return recoveredUser as User;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Error al recuperar usuario ID: ${id}`, error);
      throw new InternalServerErrorException('Error interno al recuperar el usuario');
    }
  }

  async findDeleted(filterDto: FilterUsersDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, ...filters } = filterDto;
    const skip = (page - 1) * limit;

    this.logger.log(
      `Obteniendo usuarios eliminados - Página: ${page}, Límite: ${limit}`,
    );

    try {
      // Construir filtros dinámicos
      const where: Prisma.UserWhereInput = {
        deletedAt: { not: null }, // Solo usuarios eliminados
      };

      if (filters.firstName) {
        where.firstName = {
          contains: filters.firstName,
          mode: 'insensitive',
        };
      }

      if (filters.lastName) {
        where.lastName = {
          contains: filters.lastName,
          mode: 'insensitive',
        };
      }

      if (filters.dni) {
        where.dni = {
          contains: filters.dni,
        };
      }

      if (filters.email) {
        where.email = {
          contains: filters.email,
          mode: 'insensitive',
        };
      }

      if (filters.phone) {
        where.phone = {
          contains: filters.phone,
        };
      }

      if (filters.role) {
        where.role = filters.role;
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            deletedAt: 'desc',
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Usuarios eliminados obtenidos: ${users.length} de ${total} total`,
      );

      return {
        users: users as User[],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Error al obtener usuarios eliminados', error);
      throw new InternalServerErrorException('Error interno al obtener los usuarios eliminados');
    }
  }
}

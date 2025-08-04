import {
  Controller,
  Post,
  Body,
  Get,
  UsePipes,
  ValidationPipe,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  Patch,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from '../../dto/user-dto/create-user.dto';
import { CreateAdminUserDto } from '../../dto/user-dto/create-admin-user.dto';
import { UpdateUserDto } from '../../dto/user-dto/update-user.dto';
import { FilterUsersDto } from '../../dto/user-dto/filter-users.dto';
import {
  UserResponseDto,
  ApiResponseDto,
} from '../../dto/user-dto/user-response.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { GetUser } from '../../decorators/get-user.decorator';
import { Role } from '../../enum/role.enum';
import { ApiPaginationResponse } from '../../common/swagger/api-pagination-response';
import type { AuthenticatedUser } from '../../interfaces/auth.interface';

@ApiTags('Usuarios')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearerAuth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Crear usuario cliente (Solo Admins)',
    description:
      'Permite a un administrador crear un nuevo usuario con rol de CLIENT.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Datos del usuario a crear',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario creado exitosamente',
    type: ApiResponseDto<UserResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El email o DNI ya está registrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para realizar esta acción',
  })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.userService.create(createUserDto);
    return {
      success: true,
      message: 'Usuario creado exitosamente',
      data: user as UserResponseDto,
    };
  }

  @Post('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Crear usuario por administrador',
    description:
      'Permite a un administrador crear usuarios con cualquier rol (ADMIN o CLIENT).',
  })
  @ApiBody({
    type: CreateAdminUserDto,
    description: 'Datos del usuario a crear con rol específico',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario creado exitosamente por administrador',
    type: ApiResponseDto<UserResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El email o DNI ya está registrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para realizar esta acción',
  })
  async createByAdmin(
    @Body() createAdminUserDto: CreateAdminUserDto,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.userService.createByAdmin(createAdminUserDto);
    return {
      success: true,
      message: 'Usuario creado exitosamente por administrador',
      data: user as UserResponseDto,
    };
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener usuarios activos (Solo Admins)',
    description:
      'Obtiene una lista paginada de usuarios activos con filtros opcionales. Solo accesible por administradores.',
  })
  @ApiQuery({
    name: 'firstName',
    required: false,
    description: 'Filtrar por nombre',
    example: 'Juan',
  })
  @ApiQuery({
    name: 'lastName',
    required: false,
    description: 'Filtrar por apellido',
    example: 'Pérez',
  })
  @ApiQuery({
    name: 'dni',
    required: false,
    description: 'Filtrar por DNI',
    example: '12345678',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Filtrar por email',
    example: 'juan@email.com',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    description: 'Filtrar por teléfono',
    example: '+54 9 11 1234-5678',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['ADMIN', 'CLIENT'],
    description: 'Filtrar por rol',
    example: 'CLIENT',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por página',
    example: 10,
  })
  @ApiPaginationResponse(UserResponseDto)
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para realizar esta acción',
  })
  async findAll(@Query() filterDto: FilterUsersDto) {
    const result = await this.userService.findAll(filterDto);
    return {
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: result,
    };
  }

  @Get('deleted')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener usuarios eliminados (Solo Admins)',
    description:
      'Obtiene una lista paginada de usuarios eliminados lógicamente. Solo accesible por administradores.',
  })
  @ApiQuery({
    name: 'firstName',
    required: false,
    description: 'Filtrar por nombre',
    example: 'Juan',
  })
  @ApiQuery({
    name: 'lastName',
    required: false,
    description: 'Filtrar por apellido',
    example: 'Pérez',
  })
  @ApiQuery({
    name: 'dni',
    required: false,
    description: 'Filtrar por DNI',
    example: '12345678',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Filtrar por email',
    example: 'juan@email.com',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    description: 'Filtrar por teléfono',
    example: '+54 9 11 1234-5678',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['ADMIN', 'CLIENT'],
    description: 'Filtrar por rol',
    example: 'CLIENT',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por página',
    example: 10,
  })
  @ApiPaginationResponse(UserResponseDto)
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para realizar esta acción',
  })
  async findDeleted(@Query() filterDto: FilterUsersDto) {
    const result = await this.userService.findDeleted(filterDto);
    return {
      success: true,
      message: 'Usuarios eliminados obtenidos exitosamente',
      data: result,
    };
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Obtener mi perfil',
    description:
      'Obtiene el perfil del usuario autenticado. Accesible por cualquier usuario autenticado.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Perfil obtenido exitosamente',
    type: ApiResponseDto<UserResponseDto>,
  })
  getMyProfile(
    @GetUser() user: AuthenticatedUser,
  ): ApiResponseDto<UserResponseDto> {
    return {
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: user.localUser as UserResponseDto,
    };
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener usuario por ID (Solo Admins)',
    description:
      'Obtiene un usuario específico por su ID. Solo accesible por administradores.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del usuario',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario obtenido exitosamente',
    type: ApiResponseDto<UserResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para realizar esta acción',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOne(id);
    return {
      success: true,
      message: 'Usuario obtenido exitosamente',
      data: user,
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description:
      'Actualiza los datos de un usuario. Los administradores pueden actualizar cualquier usuario, los clientes solo su propio perfil.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del usuario a actualizar',
    example: 1,
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Datos del usuario a actualizar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario actualizado exitosamente',
    type: ApiResponseDto<UserResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para actualizar este usuario',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    // Verificar permisos: Admin puede actualizar cualquier usuario, Cliente solo su propio perfil
    this.validateUserPermissions(currentUser, id);

    const user = await this.userService.update(id, updateUserDto);
    return {
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: user as UserResponseDto,
    };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Eliminar usuario (Solo Admins)',
    description:
      'Realiza una eliminación lógica del usuario. Solo accesible por administradores.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del usuario a eliminar',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario eliminado exitosamente',
    type: ApiResponseDto<UserResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para realizar esta acción',
  })
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.softDelete(id);
    return {
      success: true,
      message: 'Usuario eliminado exitosamente',
      data: user,
    };
  }

  @Patch(':id/recover')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Recuperar usuario eliminado (Solo Admins)',
    description:
      'Restaura un usuario que fue eliminado lógicamente. Solo accesible por administradores.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del usuario a recuperar',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario recuperado exitosamente',
    type: ApiResponseDto<UserResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para realizar esta acción',
  })
  async recover(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.recover(id);
    return {
      success: true,
      message: 'Usuario recuperado exitosamente',
      data: user,
    };
  }

  /**
   * Valida si el usuario tiene permisos para realizar la acción sobre otro usuario
   * @private
   */
  private validateUserPermissions(
    currentUser: AuthenticatedUser,
    targetUserId: number,
  ): void {
    if (currentUser.role !== Role.ADMIN && currentUser.id !== targetUserId) {
      throw new ForbiddenException(
        'No tienes permisos para realizar esta acción sobre este usuario',
      );
    }
  }
}

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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from '../../dto/user-dto/create-user.dto';
import { CreateAdminUserDto } from '../../dto/user-dto/create-admin-user.dto';
import { UpdateUserDto } from '../../dto/user-dto/update-user.dto';
import { FilterUsersDto } from '../../dto/user-dto/filter-users.dto';
import {
  UserResponseDto,
  PaginatedUsersResponseDto,
  ApiResponseDto,
} from '../../dto/user-dto/user-response.dto';

@ApiTags('Usuarios')
@Controller('users')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear usuario cliente',
    description: 'Crea un nuevo usuario con rol de CLIENT. Este endpoint es para registro público.',
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
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      success: true,
      message: 'Usuario creado exitosamente',
      data: user,
    };
  }

  @Post('admin')
  @ApiOperation({
    summary: 'Crear usuario por administrador',
    description: 'Permite a un administrador crear usuarios con cualquier rol (ADMIN o CLIENT).',
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
  async createByAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    const user = await this.userService.createByAdmin(createAdminUserDto);
    return {
      success: true,
      message: 'Usuario creado exitosamente por administrador',
      data: user,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener usuarios activos',
    description: 'Obtiene una lista paginada de usuarios activos con filtros opcionales.',
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de usuarios obtenida exitosamente',
    type: ApiResponseDto<PaginatedUsersResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de consulta inválidos',
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
  @ApiOperation({
    summary: 'Obtener usuarios eliminados',
    description: 'Obtiene una lista paginada de usuarios eliminados lógicamente.',
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de usuarios eliminados obtenida exitosamente',
    type: ApiResponseDto<PaginatedUsersResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de consulta inválidos',
  })
  async findDeleted(@Query() filterDto: FilterUsersDto) {
    const result = await this.userService.findDeleted(filterDto);
    return {
      success: true,
      message: 'Usuarios eliminados obtenidos exitosamente',
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Obtiene un usuario específico por su ID (solo usuarios activos).',
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
    status: HttpStatus.BAD_REQUEST,
    description: 'ID de usuario inválido',
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
    description: 'Actualiza los datos de un usuario existente.',
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
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El email o DNI ya está en uso por otro usuario',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.update(id, updateUserDto);
    return {
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: user,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar usuario (soft delete)',
    description: 'Realiza una eliminación lógica del usuario. El usuario se marca como eliminado pero no se borra de la base de datos.',
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
    status: HttpStatus.BAD_REQUEST,
    description: 'ID de usuario inválido',
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
  @ApiOperation({
    summary: 'Recuperar usuario eliminado',
    description: 'Restaura un usuario que fue eliminado lógicamente.',
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
    status: HttpStatus.BAD_REQUEST,
    description: 'El usuario no está eliminado o ID inválido',
  })
  async recover(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.recover(id);
    return {
      success: true,
      message: 'Usuario recuperado exitosamente',
      data: user,
    };
  }
}

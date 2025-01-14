import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'محمد' })
  firstName: string;

  @ApiProperty({ example: 'أحمد' })
  lastName: string;

  @ApiProperty({ example: true })
  isEmailVerified: boolean;

  @ApiProperty({ example: '2024-01-07T13:44:22.835Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-07T13:44:22.835Z' })
  updatedAt: Date;
} 
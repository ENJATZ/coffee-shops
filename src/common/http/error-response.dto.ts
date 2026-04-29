import { ApiProperty } from '@nestjs/swagger';

class ErrorDetailsDto {
  @ApiProperty({ example: 'INVALID_QUERY_PARAMETERS' })
  code!: string;

  @ApiProperty({ example: 'One or more query parameters are invalid' })
  message!: string;
}

export class ErrorResponseDto {
  @ApiProperty({ type: ErrorDetailsDto })
  error!: ErrorDetailsDto;
}

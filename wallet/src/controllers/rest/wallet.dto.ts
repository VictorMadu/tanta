import { NotificationType } from 'src/features/notification/notification-type';
import { IsNotEmpty, IsString, IsInt, Min, IsEnum, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FundWalletBodyDto {
  @IsNotEmpty()
  @IsString()
  wallet_id: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  amount_in_kobo: number;
}

export class GetWalletQueryDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  limit: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number;
}

export class TransferBodyDto {
  @IsNotEmpty()
  @IsString()
  receiver_wallet_id: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  amount_in_kobo: number;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  notification_type: NotificationType;
}

export class TransferParamDto {
  @IsNotEmpty()
  @IsString()
  sender_wallet_id: string;
}

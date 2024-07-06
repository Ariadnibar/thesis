import { Module } from '@nestjs/common';
import { EncryptionService } from '~/modules/encryption/encryption.service';

@Module({
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptionModule {}

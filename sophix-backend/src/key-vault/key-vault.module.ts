import { Module } from '@nestjs/common';
import { KeyVaultService } from './key-vault.service';

@Module({
  providers: [KeyVaultService],
  exports: [KeyVaultService],
})
export class KeyVaultModule {}
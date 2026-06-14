import { Module } from '@nestjs/common';
import { QdrantService } from './qdrant.service';
import { KeyVaultModule } from 'src/key-vault/key-vault.module';

@Module({
  providers: [QdrantService],
  exports: [QdrantService],
  imports: [KeyVaultModule],
})
export class VectorModule {}

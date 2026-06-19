import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeyVaultService } from 'src/key-vault/key-vault.service';

@Injectable()
export class EmbeddingsService {

  constructor(
    private readonly configService:
      ConfigService,
      private readonly keyVault: KeyVaultService,
  ) {}

  async createEmbedding(
  text: string,
  task:
    'retrieval.passage'
    | 'retrieval.query' =
      'retrieval.passage',
): Promise<number[]> {

    const response = await fetch(
      'https://api.jina.ai/v1/embeddings',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await this.keyVault.getSecret('JINAAPIKEY')}`,
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
  model: 'jina-embeddings-v5-text-small',
  task,
  normalized: true,
  input: [text],
}),
      },
    );

    const data =
      await response.json();

    return data.data[0].embedding;

  }

}
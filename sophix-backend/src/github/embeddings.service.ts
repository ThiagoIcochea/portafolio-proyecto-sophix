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
      | 'retrieval.passage'
      | 'retrieval.query' =
        'retrieval.passage',
  ): Promise<number[]> {

    if (!text?.trim()) {
      throw new Error(
        'Intentando generar embedding de texto vacío',
      );
    }

    const apiKey =
      await this.keyVault.getSecret(
        'JINAAPIKEY',
      );

    const response = await fetch(
      'https://api.jina.ai/v1/embeddings',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'jina-embeddings-v5-text-small',
          task,
          normalized: true,
          input: [text],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {

      console.error(
        'JINA HTTP ERROR:',
        JSON.stringify(
          data,
          null,
          2,
        ),
      );

      throw new Error(
        `Jina API Error (${response.status})`,
      );
    }

    if (
      !data ||
      !data.data ||
      !Array.isArray(data.data) ||
      data.data.length === 0 ||
      !data.data[0]?.embedding
    ) {

      console.error(
        'JINA INVALID RESPONSE:',
        JSON.stringify(
          data,
          null,
          2,
        ),
      );

      throw new Error(
        'Jina devolvió una respuesta inválida',
      );
    }

    return data.data[0].embedding;
  }

}
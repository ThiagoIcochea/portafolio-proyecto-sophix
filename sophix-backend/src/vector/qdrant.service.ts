

import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { randomUUID } from 'crypto';
import { KeyVaultService } from 'src/key-vault/key-vault.service';

@Injectable()
export class QdrantService implements OnModuleInit {

  private client!: QdrantClient;

  constructor(
    private readonly configService:
      ConfigService,
    private readonly keyVault: KeyVaultService,
  ) {

   

  }

  async onModuleInit() {
    const apiKey = await this.keyVault.getSecret('QDRANTAPIKEY');
  
   this.client =
      new QdrantClient({
        url:
          this.configService.get(
            'QDRANT_URL',
          ),
        apiKey:
          apiKey,
      });
  }

  async createCollection() {

  const collections =
    await this.client.getCollections();

  const exists =
    collections.collections.some(
      collection =>
        collection.name ===
        'repository_chunks',
    );

  if (!exists) {

    await this.client.createCollection(
      'repository_chunks',
      {
        vectors: {
          size: 1024,
          distance: 'Cosine',
        },
      },
    );

  }

 
  try {
    await this.client.createPayloadIndex(
      'repository_chunks',
      {
        field_name: 'owner',
        field_schema: 'keyword',
      },
    );
  } catch {}

  try {
    await this.client.createPayloadIndex(
      'repository_chunks',
      {
        field_name: 'repository',
        field_schema: 'keyword',
      },
    );
  } catch {}

}


async storeChunk(
  owner: string,
  repository: string,
  path: string,
  content: string,
  embedding: number[],
) {

  await this.client.upsert(
    'repository_chunks',
    {
      wait: true,
      points: [
        {
          id: randomUUID(),
          vector: embedding,
          payload: {
  owner,
  repository,
  path,
  content,
},
        },
      ],
    },
  );

}

async deleteByOwnerAndRepository(
  owner: string,
  repository: string,
) {
  await this.client.delete(
    'repository_chunks',
    {
      wait: true,
      filter: {
        must: [
          {
            key: 'owner',
            match: {
              value: owner,
            },
          },
          {
            key: 'repository',
            match: {
              value: repository,
            },
          },
        ],
      },
    },
  );
}

async search(
  repository: string,
  embedding: number[],
) {

  console.log(
  'QUESTION EMBEDDING SIZE:',
  embedding.length,
);

  return this.client.search(
    'repository_chunks',
    {
      vector: embedding,
      limit: 10,
     
      filter: {
        must: [
          {
            key: 'repository',
            match: {
              value: repository,
            },
          },
        ],
      },
    },
  );

}

async debugRepository(
  owner: string,
  repository: string,
) {
  return this.client.scroll(
    'repository_chunks',
    {
      limit: 20,
      with_payload: true,
      filter: {
        must: [
          {
            key: 'owner',
            match: {
              value: owner,
            },
          },
          {
            key: 'repository',
            match: {
              value: repository,
            },
          },
        ],
      },
    },
  );
}

async searchByOwnerAndRepository(
  owner: string,
  repository: string,
  embedding: number[],
) {

  return this.client.search(
    'repository_chunks',
    {
      vector: embedding,
      limit: 10,
     
      filter: {
        must: [
          {
            key: 'owner',
            match: {
              value: owner,
            },
          },
          {
            key: 'repository',
            match: {
              value: repository,
            },
          },
        ],
      },
    },
  );

}

}

import { Injectable, OnModuleInit } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { KeyVaultService } from 'src/key-vault/key-vault.service';


@Injectable()
export class FoundryProvider implements OnModuleInit {

  private client!: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly keyVault: KeyVaultService,
  ) {
    

  }

  async onModuleInit() {
  const apiKey =
  
    await this.keyVault.getSecret('AZUREAIKEY');

  this.client = new OpenAI({
    apiKey,
    baseURL: this.configService.get<string>('AZURE_AI_ENDPOINT'),
  });
}

  async generateResponse(messages: any[]): Promise<string> {

  const completion = await this.client.chat.completions.create({
    model: this.configService.get<string>('AZURE_AI_DEPLOYMENT')!,
    messages,
  });

  return completion.choices[0]?.message?.content ?? 'No se obtuvo respuesta.';
}

}
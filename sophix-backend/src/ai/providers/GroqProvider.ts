import { Injectable, OnModuleInit } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { KeyVaultService } from 'src/key-vault/key-vault.service';

@Injectable()
export class GroqProvider implements OnModuleInit {
  private client!: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly keyVault: KeyVaultService,
  ) {}

  async onModuleInit() {
    const apiKey = await this.keyVault.getSecret('GROQAPIKEY');

    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async generateResponse(messages: any[]): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.configService.get<string>('GROQMODEL') ?? 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.2,
    });

    return completion.choices[0]?.message?.content ?? 'No response from Groq';
  }
}
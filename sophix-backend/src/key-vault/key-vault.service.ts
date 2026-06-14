import { Injectable } from '@nestjs/common';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

@Injectable()
export class KeyVaultService {
  private client?: SecretClient;

  constructor() {
    if (process.env.KEY_VAULT_URL) {
      this.client = new SecretClient(
        process.env.KEY_VAULT_URL,
        new DefaultAzureCredential(),
      );
    }
  }

  async getSecret(name: string): Promise<string | undefined> {
    if (!this.client) {
      return process.env[name.toUpperCase()] ?? process.env[name];
    }

    try {
      const secret = await this.client.getSecret(name);
      return secret.value;
    } catch {
      return process.env[name.toUpperCase()] ?? process.env[name];
    }
  }
}
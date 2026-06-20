import { Injectable } from "@nestjs/common";
import { FoundryProvider } from "./providers/foundry.provider";
import { GroqProvider } from "./providers/GroqProvider";

@Injectable()
export class AiModelFactory {
  constructor(
    private readonly foundry: FoundryProvider,
    private readonly groq: GroqProvider,
  ) {}

  get(model: string) {
    switch (model) {
      case 'groq':
        return this.groq;

      case 'foundry':
      case 'azure':
      default:
        return this.foundry;
    }
  }
}
export interface AiProvider {

  generateResponse(
    prompt: string,
  ): Promise<string>;

}
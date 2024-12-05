import { RestService } from './restService';

export interface Token {
  id?: string;
  token: string;
  region: string;
}

export class TokenService extends RestService<Token> {
  public constructor(baseUrl: string, baseRoute: string) {
    super(baseUrl, baseRoute);
  }
}

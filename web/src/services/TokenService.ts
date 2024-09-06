import { RestService } from './restService';
import Cookie from 'universal-cookie';


export interface Token {
    id?: string
    token: string
    region: string
}

export class TokenService extends RestService<Token> {
    public constructor(baseUrl: string, baseRoute: string) {
        super(baseUrl, baseRoute);
    }


    
}
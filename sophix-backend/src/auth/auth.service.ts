import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { GithubAuthDto } from './dto/github-auth.dto';
import { KeyVaultService } from 'src/key-vault/key-vault.service';

type GithubTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GithubUserResponse = {
  id: number;
  login: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly keyVault: KeyVaultService
  ) {}

  async githubLogin(githubAuthDto: GithubAuthDto) {
    
    const accessToken = await this.getGithubAccessToken(
      githubAuthDto.code,
      githubAuthDto.codeVerifier
    );
   console.log('ENTRO A githubLogin');
  console.log(githubAuthDto);
    const githubUser = await this.getGithubUser(
      accessToken,
    );

    const githubId = String(githubUser.id);
    let user = await this.usersService.findByGithubId(githubId);

    if (user) {
      user = await this.usersService.update(user.id, {
        githubId,
        githubUsername: githubUser.login,
      });
    } else {
      user = await this.usersService.create({
        githubId,
        githubUsername: githubUser.login,
      });
    }

    if (!user) {
      throw new BadRequestException(
        'No se pudo iniciar sesion con GitHub',
      );
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      githubId: user.githubId,
      githubUsername: user.githubUsername,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        githubId: user.githubId,
        githubUsername: user.githubUsername,
      },
    };
  }

private async getGithubAccessToken(
  code: string,
  codeVerifier: string,
){

  
    const clientId = this.configService.get<string>(
      'GITHUB_CLIENT_ID',
    );
   
    const clientSecret =
      (await this.keyVault.getSecret('GITHUBCLIENTSECRET'));

    if (!clientId || !clientSecret) {
      throw new BadRequestException(
        'Faltan credenciales OAuth de GitHub',
      );
    }


    console.log('CANJEANDO CODE');
console.log({
  code,
  codeVerifier,
});

    const response = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
       body: JSON.stringify({
  client_id: clientId,
  client_secret: clientSecret,
  code,
  code_verifier: codeVerifier,
}),
      },
    );

    const data =
      await response.json() as GithubTokenResponse;
    console.log('RESPUESTA GITHUB');
    console.log(data);
    if (!response.ok || !data.access_token) {
      throw new BadRequestException(
        data.error_description ??
        data.error ??
        'No se pudo autenticar con GitHub',
      );
    }

    return data.access_token;
  }

  private async getGithubUser(accessToken: string) {
    const response = await fetch(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException(
        'No se pudo obtener el usuario de GitHub',
      );
    }

    return await response.json() as GithubUserResponse;
  }
}

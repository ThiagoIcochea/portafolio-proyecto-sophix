import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findByGithubId(githubId: string) {
    return this.userRepository.findOne({
      where: { githubId }
    });
  }

  create(user: Partial<User>) {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async update(
    id: string,
    user: Partial<User>,
  ) {
    await this.userRepository.update(id, user);

    return this.userRepository.findOne({
      where: { id }
    });
  }
}

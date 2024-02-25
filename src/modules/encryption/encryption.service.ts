import { Injectable } from '@nestjs/common';
import { hash as bcryptHash, compare as bcryptCompare } from 'bcrypt';

@Injectable()
export class EncryptionService {
  constructor() {}

  public async hash(item: string) {
    return await bcryptHash(item, 10);
  }

  public async compare(item: string, hash: string) {
    return await bcryptCompare(item, hash);
  }
}

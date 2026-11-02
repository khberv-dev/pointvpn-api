import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Node } from './entities/node.entity.js';

@Injectable()
export class NodesService {
  constructor(
    @InjectRepository(Node) private readonly nodesRepository: Repository<Node>,
  ) {}

  findAll(): Promise<Node[]> {
    return this.nodesRepository.find({ order: { region: 'ASC', name: 'ASC' } });
  }

  /** Returns the node including its management API key. */
  findByIdWithApiKey(id: string): Promise<Node | null> {
    return this.nodesRepository
      .createQueryBuilder('node')
      .addSelect('node.apiKey')
      .where('node.id = :id', { id })
      .getOne();
  }
}

import { NumberFieldOptional } from '../decorators/field.decorators.js';

export class PageOptionsDto {
  @NumberFieldOptional({ int: true, min: 1, default: 1 })
  readonly page: number = 1;

  @NumberFieldOptional({ int: true, min: 1, max: 100, default: 10 })
  readonly take: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}

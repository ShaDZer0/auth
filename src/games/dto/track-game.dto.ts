import { NumberField } from '../../common/decorators/field.decorators.js';

export class TrackGameDto {
  @NumberField({ int: true, isPositive: true })
  gameId: number;

  @NumberField({ isPositive: true })
  score: number;
}

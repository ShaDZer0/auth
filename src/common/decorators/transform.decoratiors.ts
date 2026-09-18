import { Transform } from 'class-transformer';

/** Прибирає пробіли з початку і кінця рядка */
export function Trim(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

/** Приводить рядок до нижнього регістру (зручно для email) */
export function ToLowerCase(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  );
}

/** Приводить рядок до верхнього регістру */
export function ToUpperCase(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  );
}

/** Гарантує, що значення завжди масив (корисно для query-параметрів) */
export function ToArray(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    Array.isArray(value) ? value : [value],
  );
}

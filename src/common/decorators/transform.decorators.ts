import { Transform } from 'class-transformer';

export function Trim(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

export function ToLowerCase(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  );
}

export function ToUpperCase(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  );
}

export function ToArray(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    Array.isArray(value) ? value : [value],
  );
}

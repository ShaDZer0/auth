import { applyDecorators } from '@nestjs/common';
import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Trim, ToLowerCase } from './transform.decorators.js';

interface Swagger {
  swagger?: boolean;
}

interface StringFieldOptions extends Swagger {
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
}

export function StringField(
  options: Omit<ApiPropertyOptions, 'type'> & StringFieldOptions = {},
): PropertyDecorator {
  const decorators: PropertyDecorator[] = [IsString(), Trim()];
  if (options.required !== false) {
    decorators.push(IsNotEmpty());
  }
  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: String, ...options } as ApiPropertyOptions));
  }
  if (options.minLength) {
    decorators.push(MinLength(options.minLength));
  }
  if (options.maxLength) {
    decorators.push(MaxLength(options.maxLength));
  }
  if (options.toLowerCase) {
    decorators.push(ToLowerCase());
  }
  return applyDecorators(...decorators);
}

export function StringFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & StringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    StringField({ required: false, ...options }),
  );
}

export function EmailField(
  options: Omit<ApiPropertyOptions, 'type'> & Swagger = {},
): PropertyDecorator {
  const decorators: PropertyDecorator[] = [IsEmail(), Trim(), ToLowerCase()];
  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({ type: String, example: 'user@example.com', ...options } as ApiPropertyOptions),
    );
  }
  return applyDecorators(...decorators);
}

export function EmailFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & Swagger = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    EmailField({ required: false, ...options }),
  );
}

interface NumberFieldOptions extends Swagger {
  min?: number;
  max?: number;
  int?: boolean;
  isPositive?: boolean;
}

export function NumberField(
  options: Omit<ApiPropertyOptions, 'type'> & NumberFieldOptions = {},
): PropertyDecorator {
  const decorators: PropertyDecorator[] = [Type(() => Number)];
  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: Number, ...options } as ApiPropertyOptions));
  }
  decorators.push(options.int ? IsInt() : IsNumber());
  if (typeof options.min === 'number') {
    decorators.push(Min(options.min));
  }
  if (typeof options.max === 'number') {
    decorators.push(Max(options.max));
  }
  if (options.isPositive) {
    decorators.push(IsPositive());
  }
  return applyDecorators(...decorators);
}

export function NumberFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & NumberFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    NumberField({ required: false, ...options }),
  );
}

export function BooleanField(
  options: Omit<ApiPropertyOptions, 'type'> & Swagger = {},
): PropertyDecorator {
  const decorators: PropertyDecorator[] = [IsBoolean()];

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: Boolean, ...options } as ApiPropertyOptions));
  }

  return applyDecorators(...decorators);
}

export function BooleanFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & Swagger = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    BooleanField({ required: false, ...options }),
  );
}

export function PasswordField(
  options: Omit<ApiPropertyOptions, 'type' | 'minLength'> & StringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    StringField({ minLength: 8, example: 'Str0ngPass!', ...options }),
    Matches(/^(?=.*\d)(?=.*\D)([\D\d]+)$/, {
      message: 'Пароль має містити цифри та літери',
    }),
    Matches(/[^\dA-Za-z]|[A-Z]/, {
      message: 'Пароль має містити велику літеру або спецсимвол',
    }),
  );
}

export function PasswordFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'minLength'> &
    StringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    PasswordField({ required: false, ...options }),
  );
}

export function EnumField<TEnum extends object>(
  enumType: TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'enum'> & Swagger = {},
): PropertyDecorator {
  const decorators: PropertyDecorator[] = [IsEnum(enumType)];

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ enum: enumType, ...options } as ApiPropertyOptions));
  }

  return applyDecorators(...decorators);
}

export function EnumFieldOptional<TEnum extends object>(
  enumType: TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'enum' | 'required'> & Swagger = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    EnumField(enumType, { required: false, ...options }),
  );
}

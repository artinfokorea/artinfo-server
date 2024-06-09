import { ValidationArguments, IsEmail, IsNotEmpty, registerDecorator, IsArray, ValidationOptions } from 'class-validator';

export function NotBlank() {
  return IsNotEmpty({ message: (args: ValidationArguments) => `${args.property}은(는) 필수 값입니다.` });
}

export function Email() {
  return IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' });
}

export function ArrayType() {
  return IsArray({ message: (args: ValidationArguments) => `${args.property}은(는) 배열 값 이어야 합니다.` });
}

export function NumberArray(): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'NumberArray',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any, _: ValidationArguments) {
          return Array.isArray(value) && value.every(item => !isNaN(Number(item)));
        },
        defaultMessage() {
          return '카테고리 아이디 목록의 모든 요소는 숫자여야 합니다.';
        },
      },
    });
  };
}

export function EnumNullableArray(enumType: object, validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'EnumArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [enumType],
      validator: {
        validate(value: any, args: ValidationArguments) {
          console.log(value.length);
          const [enumType] = args.constraints;
          if (value.length > 0) {
            return Array.isArray(value) && value.every(item => Object.values(enumType).includes(item));
          } else {
            return true;
          }
        },
        defaultMessage(args: ValidationArguments) {
          const [enumType] = args.constraints;
          const enumValues = Object.values(enumType).join(', ');
          return `${args.property} 필드는 배열 형태로 아래와 같은 값을 포함해야합니다. [${enumValues}]`;
        },
      },
    });
  };
}

export function Enum(entity: object): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEnum',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any) {
          return Object.values(entity).includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property}필드 상수값이 올바르지 않습니다.`;
        },
      },
    });
  };
}

export function IsPhone(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (value === null) {
            return true;
          }
          const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
          return typeof value === 'string' && phoneRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 필드값이 유효하지 않습니다. 예) 010-4028-7451`;
        },
      },
    });
  };
}

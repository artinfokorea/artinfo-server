import { ValidationArguments, IsEmail, IsNotEmpty, registerDecorator } from 'class-validator';

export function NotBlank() {
  return IsNotEmpty({ message: (args: ValidationArguments) => `${args.property}은(는) 필수 값입니다.` });
}

export function Email() {
  return IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' });
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

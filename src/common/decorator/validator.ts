import { ValidationArguments, IsEmail, IsNotEmpty, registerDecorator, ValidationOptions } from 'class-validator';

export function NotBlank() {
  return IsNotEmpty({ message: (args: ValidationArguments) => `${args.property}은(는) 필수 값입니다.` });
}
export function Email() {
  return IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' });
}

export function Enum(entity: object, validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEnum',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return Object.values(entity).includes(value);
        },
      },
    });
  };
}

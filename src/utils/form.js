import * as Validator from './validator';

export const FormInputError = ({field}) => {
    if (field.required && !field.value) {
        switch (field.name) {
        case 'name':
            return `Introduce tu nombre`;

        case 'email':
            return `Pon tu dirección de correo electrónico`;

        default:
            return `Por favor escribe ${field.name}`;
        }
    }

    if (field.type === 'email' && !Validator.isValidEmail(field.value)) {
        return `La dirección de correo electrónico no válida`;
    }
    return null;
};

export const ValidateInputForm = ({fields}) => {
    const errors = {};
    fields.forEach((field) => {
        const name = field.name;
        const fieldError = FormInputError({field});
        errors[name] = fieldError;
    });
    return errors;
};

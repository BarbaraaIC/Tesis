"use strict";
import Joi from "joi";

export const registroValidation = Joi.object({
    nombre: Joi.string()
    .min(3)
    .max(50)
    .required()
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$/)
    .messages({
        "string.empty": "El nombre es obligatorio.",
        "string.min": "El nombre debe tener un minimo de 3 caracteres.",
        "string.max": "El nombre debe tener un máximo de 50 caracteres.",
        "string.pattern.base": "El nombre no puede incluir simbolos ni números."
    }),

    apellido: Joi.string()
    .min(3)
    .max(50)
    .required()
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$/)
    .messages({
        "string.empty": "El/los apellido son obligatorio.",
        "string.min": "El apellido debe tener un minimo de 3 caracteres.",
        "string.max": "El apellido debe tener un máximo de 50 caracteres.",
        "string.pattern.base": "El apellido no puede incluir simbolos ni números."
    }),

    rut: Joi.string()
    .min(9)
    .max(12)
    .required()
    .pattern(/^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]{1}$/) 
    .messages({
        "string.empty": "El RUT es obligatorio.",
        "string.min": "El RUT no puede ser menor a 9 digitos.",
        "string.max": "El RUT puede tener un máximo de 12 caracteres.",
        "string.pattern.base": "El RUT debe tener formato xx.xxx.xxx-x",
    }),

    correo: Joi.string()
    .trim()                     
    .lowercase()                
    .email({ 
        minDomainSegments: 2,  
        tlds: { allow: ['com', 'net', 'org', 'cl', 'edu'] } 
    })
    .required()
    .messages({
        "string.empty": "El correo electrónico es obligatorio.",
        "string.email": "Por favor, ingresa un correo electrónico válido (ejemplo@dominio.com).",
        "any.required": "El correo electrónico es un campo requerido."
    }),

    telefono: Joi.string()
    .trim()
    .pattern(/^(?:\+?56)?9[0-9]{8}$/) 
    .required()
    .custom((value) => {
        const digitosPuros = value.replace(/^(\+?56)/, '');
        
        // Le anteponemos obligatoriamente el '+56'
        return `+56${digitosPuros}`;
    })
    .messages({
        "string.empty": "El teléfono celular es obligatorio.",
        "string.pattern.base": "Formato de celular inválido. Ingrese los 9 dígitos (ej: 912345678) o con +569.",
        "any.required": "El teléfono celular es un campo requerido."
    }),

    password: Joi.string()
    .min(8)
    .max(30)
    .pattern(/^(?=.*\d)[^.,?= \s]{8,30}$/)
    .required()
    .messages({
        "string.empty": "La contraseña es obligatoria.",
        "string.min": "La contraseña debe tener al menos {#limit} caracteres.",
        "string.max": "La contraseña no puede superar los {#limit} caracteres.",
        "string.pattern.base": "La contraseña debe incluir al menos un número. No se permiten espacios ni los caracteres: . , ? =",
        "any.required": "La contraseña es un campo requerido."
    }),

    edad: Joi.number()
    .integer()
    .min(1)
    .max(99)
    .required()
    .messages({
        "number.base": "La edad debe ser un número",
        "number.integer": "La edad no puede tener decimales",
        "any.required": "La edad es obligatoria",
        "number.min": "La edad debe mínima debe ser 1",
        "number.max": "La edad no puede superar los 110",
    }),
    ocupacion: Joi.string()
    .trim()                     
    .min(3)                     
    .max(50)                    
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\/\-\.]+$/)
    .required()
    .messages({
        "string.empty": "La ocupación es obligatoria.",
        "string.min": "La ocupación debe tener al menos 3 caracteres.",
        "string.max": "La ocupación no puede superar los 50 caracteres.",
        "string.pattern.base": "La ocupación solo puede contener letras, espacios y caracteres como / o - (ej: 'Dueño/a').",
        "any.required": "La ocupación es un campo requerido."
    }),

    direccion: Joi.string()
    .trim()                     
    .min(5)                     
    .max(100)                
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\.,#\-]+(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\.,#\-]+)*$/)
    .required()
    .messages({
        "string.empty": "La dirección es obligatoria.",
        "string.min": "La dirección es demasiado corta mínimo 5 caracteres.",
        "string.max": "La dirección no puede exceder los 100 caracteres.",
        "string.pattern.base": "La dirección contiene caracteres no permitidos (solo se aceptan letras, números, espacios y símbolos.",
        "any.required": "La dirección es un campo requerido."
    }),
    enfermedades: Joi.string()
        .trim()
        .max(500)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.,;\-\/]+$/)
        .optional() 
        .allow('', null)
        .messages({
            "string.max": "El campo de enfermedades no puede superar los 500 caracteres.",
            "string.pattern.base": "El texto contiene caracteres no permitidos. Solo se aceptan letras, números, espacios, comas, puntos y guiones.",
        }),

    medicamentos: Joi.string()
        .trim()
        .max(100)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\,\-]+$/)
        .optional() 
        .allow('', null)
        .messages({
            "string.max": "El nombre de los medicamentos no puede superar los 100 caracteres.",
            "string.pattern.base": "En este campo solo debes ingresar el nombre de los medicamentos (letras, espacios o comas). No incluyas números ni dosis.",
    })

})
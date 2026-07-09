"use strict";
import Joi from "joi";

export const crearServicioValidation = Joi.object({
    tipo_servicio: Joi.string()
        .min(3)
        .max(50)
        .required()
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$/)
        .messages({
            "string.empty": "El tipo de servicio es obligatorio.",
            "string.min": "El tipo de servicio debe tener un minimo de 3 caracteres.",
            "string.max": "El tipo de servicio debe tener un máximo de 50 caracteres.",
            "string.pattern.base": "El servicio no puede incluir simbolos ni números."
        }),
    descripcion: Joi.string()
        .min(3)
        .max(100)
        .required()
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\p{P}]+(?:\s[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\p{P}]+)*$/u)
        .messages({
            "string.empty": "La descripción es obligatoria para una mejor idetificación.",
            "string.min": "La descripción tener un minimo de 3 caracteres.",
            "string.max": "La descripción debe tener un máximo de 100 caracteres.",
            "string.pattern.base": "La descripción no puede incluir simbolos ni números."
        }),
    
})
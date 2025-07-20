import createHttpError from 'http-errors';

export const validateBody = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    //   const errors = createHttpError(404, 'Bad Request', { errors: error.details });
    const errors = error.details.map((datail) => datail.message);
    next(new createHttpError.BadRequest(errors));
  }
};

import { Response } from 'express';

// TODO: use middleware for better error handling
export const handleError = (res: Response, err: any) => {
  console.error('An error occurred!', err);

  return res.status(500).send({ status: 500, error: err.message });
};

export default {
  handleError
};

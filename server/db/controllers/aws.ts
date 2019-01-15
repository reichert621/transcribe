import { Request, Response } from 'express';
import { sign } from '../../aws';
import { handleError } from './utils';

export default {
  getSignedUrl(req: Request, res: Response) {
    const { fileName, contentType } = req.query;

    return sign(fileName, contentType)
      .then(signedUrl => res.json({ signedUrl }))
      .catch(err => handleError(res, err));
  }
};

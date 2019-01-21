import { Request, Response } from 'express';
import { fetchAudioUrl } from '../../ny';
import { handleError } from './utils';

export default {
  getAudioUrl(req: Request, res: Response) {
    const { articleUrl } = req.query;

    return fetchAudioUrl(articleUrl)
      .then(url => res.json({ url }))
      .catch(err => handleError(res, err));
  }
};

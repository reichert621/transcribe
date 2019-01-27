import { Request, Response } from 'express';
import {
  sign,
  getSignedDownloadUrl,
  formatFileName,
  listTranscriptionJobs
} from '../../aws';
import { handleError } from './utils';

export default {
  getSignedUrl(req: Request, res: Response) {
    const { fileName, contentType } = req.query;
    const name = formatFileName(fileName);
    console.log('Getting signed upload url for:', { name, contentType });

    return sign(name, contentType)
      .then(signedUrl => res.json({ signedUrl }))
      .catch(err => handleError(res, err));
  },

  getSignedDownloadUrl(req: Request, res: Response) {
    const { fileName } = req.query;
    const name = formatFileName(fileName);
    console.log('Getting signed download url for:', { name });

    return getSignedDownloadUrl(name)
      .then(signedUrl => res.json({ signedUrl }))
      .catch(err => handleError(res, err));
  },

  listTranscriptionJobs(req: Request, res: Response) {
    const { name } = req.query;

    return listTranscriptionJobs(name)
      .then(jobs => res.json({ jobs }))
      .catch(err => handleError(res, err));
  }
};

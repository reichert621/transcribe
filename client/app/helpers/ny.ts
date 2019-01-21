import * as request from 'superagent';

export const fetchAudioUrl = (articleUrl: string): Promise<any> => {
  return request
    .get('/api/scraper/audio')
    .query({ articleUrl })
    .then(res => res.body.url);
};

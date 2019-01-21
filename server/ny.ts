import * as request from 'superagent';
import * as cheerio from 'cheerio';

const AUDM_API = 'https://audm.herokuapp.com/parse/classes/ArticleVersion';
const AUDM_APP_ID = 'M2PeWDdRSFsl28CzdYlAjG2mZGCdhSvosTQGBJhI';

const getNewYorkerPublisherId = url => {
  return request
    .get(url)
    .then(res => res.text)
    .then(html => {
      const $ = cheerio.load(html);
      const publisherId = $('meta[name=id]').attr('content');

      return publisherId || null;
    });
};

const getArticleAudio = publisherId => {
  return request
    .post(AUDM_API)
    .send({
      where: {
        publisherUniqueID: publisherId
      },
      limit: 1,
      _method: 'GET',
      _ApplicationId: AUDM_APP_ID
    })
    .then(res => res.body.results[0]);
};

export const fetchNewYorkerArticleAudioUrl = url => {
  return getNewYorkerPublisherId(url)
    .then(publisherId => {
      if (!publisherId) return null;

      return getArticleAudio(publisherId);
    })
    .then(res => {
      const url = res && res.audioUrlM4a;

      return url || null;
    });
};

// TODO: clean up a bit
export const fetchAudioUrl = url => {
  console.log('Fetching audio url!', url);
  return request.get(url).then(res => {
    // If the url is already a valid audio file, just return the url
    if (res.type.startsWith('audio')) {
      console.log('Valid audio file!');
      return url;
    } else if (res.type === 'text/html') {
      // If the url from the New Yorker, handle special case
      if (url.includes('newyorker')) {
        console.log('Fetching New Yorker article!');
        return fetchNewYorkerArticleAudioUrl(url);
      }

      // Otherwise, just scrape the html for audio tags
      console.log('Scraping html for audio!');
      const html = res.text;
      const $ = cheerio.load(html);
      const audio = $('audio')
        .filter((i, el) => !!$(el).attr('src'))
        .first()
        .attr('src');
      console.log('Found:', audio);

      return audio;
    } else {
      // Only handle audio and html files for now
      return null;
    }
  });
};

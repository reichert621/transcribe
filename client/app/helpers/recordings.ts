import * as request from 'superagent';

export type TranscriptionStatus = 'IN_PROGRESS' | 'FAILED' | 'COMPLETED';

export type Recording = {
  id: number;
  name: string;
  status?: TranscriptionStatus;
  timestamp?: any;
  transcription?: Transcription;
  paid?: boolean;
};

export type Transcription = {
  transcript: string;
  textByTime: {
    startTime: string | number;
    endTime?: string | number;
    text: string;
  }[];
};

export const formatFileName = (fileName: string) => {
  return fileName
    .trim()
    .split(' ')
    .filter(str => str && str.length)
    .join('-');
};

export const formatFullTranscript = (text: string) => {
  let current: string[] = [];
  let paragraphs: string[] = [];
  let count = 0;
  let sentences = text.split('.');

  for (let sentence of sentences) {
    const words = count + sentence.length;

    if (words > 250) {
      const paragraph = current
        .concat(sentence)
        .join('.')
        .concat('.');

      paragraphs.push(paragraph);
      current = [];
      count = 0;
    } else {
      current.push(sentence);
      count = words;
    }
  }

  if (current.length) {
    const paragraph = current.join('.');

    paragraphs.push(paragraph);
  }

  return paragraphs;
};

export const formatTimestamp = (seconds: string | number) => {
  const num = Math.floor(Number(seconds));
  // const hours = // TODO
  const mins = Math.floor(num / 60);
  const secs = num % 60;
  const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
  const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;

  return `${formattedMins}:${formattedSecs}`;
};

export const fetchRecordings = (): Promise<Recording[]> => {
  return request.get('/api/recordings').then(res => res.body.recordings);
};

export const getSignedUrl = (
  fileName: string,
  contentType: string
): Promise<string> => {
  return request
    .get('/api/signed-url')
    .query({ fileName, contentType })
    .then(res => res.body.signedUrl);
};

export const getSignedDownloadUrl = (fileName: string): Promise<any> => {
  return request
    .get('/api/signed-download-url')
    .query({ fileName })
    .then(res => res.body.signedUrl);
};

export const uploadToS3 = (s3Url: string, file: File) => {
  return request
    .put(s3Url)
    .set('Content-Type', file.type)
    .send(file);
};

export const fetchTranscriptionJobStatuses = (
  fileName?: string
): Promise<Recording[]> => {
  return request
    .get('/api/recordings')
    .query({ fileName })
    .then(res => res.body.recordings);
};

// TODO: more consistent naming (RESTful)
export const createTranscriptionJob = (
  fileName: string
): Promise<Recording> => {
  return request
    .post('/api/recordings')
    .send({ fileName })
    .then(res => res.body);
};

export const fetchRecording = (recordingId: number): Promise<Recording> => {
  return request
    .get(`/api/recordings/${recordingId}`)
    .then(res => res.body.recording);
  // const response: Recording = {
  //   id: 2,
  //   name: '20190101-recording.mp3',
  //   status: 'COMPLETED',
  //   transcription: {
  //     fullText: 'this is a fake transcription',
  //     textByTime: [
  //       { startTime: 0, endTime: 2, text: 'this is a' },
  //       { startTime: 2, endTime: 3, text: 'fake transcription' }
  //     ]
  //   }
  // };

  // return Promise.resolve(response);
};

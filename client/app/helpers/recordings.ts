import * as request from 'superagent';

export type TranscriptionStatus = 'IN_PROGRESS' | 'FAILED' | 'COMPLETED';

export type Recording = {
  id: number;
  name: string;
  status?: TranscriptionStatus;
  timestamp?: any;
  transcription?: Transcription;
};

export type Transcription = {
  transcript: string;
  textByTime: { startTime: number; endTime?: number; text: string }[];
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

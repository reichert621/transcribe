import * as request from 'superagent';

export type Recording = {
  id: number;
  name: string;
  timestamp: any;
  transcription: any;
};

export type TranscriptionJob = {
  name: string;
  createdAt: any;
  status: 'IN_PROGRESS' | 'FAILED' | 'COMPLETED';
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
): Promise<TranscriptionJob[]> => {
  return request
    .get('/api/transcription-statuses')
    .query({ fileName })
    .then(res => res.body.jobs);
};

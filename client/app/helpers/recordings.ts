import * as request from 'superagent';

export type Recording = {
  id: number;
  name: string;
  status?: 'in_progress' | 'error' | 'finished';
  timestamp?: any;
  transcription?: any;
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
  // return request.get(`/api/recordings/${recordingId}`).then(res => res.body);
  const response: Recording = {
    id: 2,
    name: '20190101-recording.mp3',
    status: 'finished',
    transcription: {
      fullText: 'this is a fake transcription',
      textByTime: [
        { startTime: 0, endTime: 2, text: 'this is a' },
        { startTime: 2, endTime: 3, text: 'fake transcription' }
      ]
    }
  };

  return Promise.resolve(response);
};

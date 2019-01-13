import * as request from 'superagent';

export type Recording = {
  id: number;
  name: string;
  timestamp: any;
  transcription: any;
};

export const fetchRecordings = (): Promise<Recording[]> => {
  return request.get('/api/recordings').then(res => res.body.recordings);
};

export const upload = (file: File) => {
  // const data = file;

  return (
    request
      .post('/api/upload')
      // .set('Content-Type', 'application/octet-stream')
      // .send(file);
      .attach('recording', file)
  );
};

namespace M {
  export type User = {
    id: number;
    email: string;
    password: string;
    salt: string;
  };

  type Transcription = {
    jobName: string;
    transcript: string;
    textByTime: {
      startTime: string;
      endTime: string;
      text: string;
    }[];
  };

  export type Recording = {
    id: number;
    name: string;
    timestamp: any;
    transcription?: Transcription;
    userId: number;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  };
}

export default M;

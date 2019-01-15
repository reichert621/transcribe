namespace M {
  export type User = {
    id: number;
    email: string;
    password: string;
    salt: string;
  };

  export type Recording = {
    id: number;
    name: string;
    timestamp: any;
    transcription?: any;
    userId: number;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  };
}

export default M;

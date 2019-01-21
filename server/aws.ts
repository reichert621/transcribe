import * as AWS from 'aws-sdk';
import * as Bluebird from 'bluebird';
import { chunk, first, last, isObject } from 'lodash';

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;

// Create an S3 client
const s3 = new AWS.S3({ region: 'us-west-2' });

const bucketName = 'audio-search-kam';
const finishedTranscriptionBucket = 'finished-transcription';
const awsPath = 'https://s3-us-west-2.amazonaws.com/';

const transcribeService = new AWS.TranscribeService({
  apiVersion: '2017-10-26',
  region: 'us-west-2',
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY
});

// TODO: check if this type definition already exists on AWS
export type AwsTranscription = {
  results: {
    transcripts: {
      transcript: any;
    }[];
    items: {
      start_time: string;
      end_time: string;
      alternatives: { confidence: string; content: string }[];
      type: string;
    }[];
  };
  jobName: string;
};

// fileUri format: 1547344263217-podcast-snippet.mp3
export function startTranscription(fileName: string) {
  const fileUri = `${awsPath + bucketName}/${fileName}`;
  const fileSplit = fileName.split('.');
  const mediaFormat = fileSplit[fileSplit.length - 1];
  const params = {
    LanguageCode: 'en-US',
    Media: {
      /* required */
      MediaFileUri: fileUri
    },
    MediaFormat: mediaFormat,
    TranscriptionJobName: fileName,
    MediaSampleRateHertz: 44100,
    OutputBucketName: finishedTranscriptionBucket
  };

  return transcribeService.startTranscriptionJob(params).promise();
}

export function listTranscriptionJobs(
  fileName?: string
): Promise<AWS.TranscribeService.TranscriptionJobSummary[]> {
  const params = {
    JobNameContains: fileName,
    MaxResults: 100
  };

  return transcribeService
    .listTranscriptionJobs(params)
    .promise()
    .then(res => res.TranscriptionJobSummaries);
}

export function isValidTranscription(awsTranscription: any) {
  if (!isObject(awsTranscription)) {
    return false;
  }

  const { results, jobName } = awsTranscription;

  if (!isObject(results) || !jobName) {
    return false;
  }

  const { transcripts, items } = results;

  return transcripts && transcripts.length && items && items.length;
}

export function parseTranscription(
  awsTranscription: AwsTranscription,
  numWordsPerTimestamp = 10
) {
  if (!isValidTranscription(awsTranscription)) {
    return null;
  }

  const { results, jobName } = awsTranscription;
  const { transcripts, items } = results;
  const { transcript } = transcripts[0];
  const chunks = chunk(items, numWordsPerTimestamp);

  return {
    jobName,
    transcript,
    textByTime: chunks.map(group => {
      // TODO Handle punctuations better
      const text = group.map(item => item.alternatives[0].content).join(' ');

      // Punctuations do not have start or end time
      const words = group.filter(item => item.type === 'pronunciation');
      console.log('Words:', words);
      const firstWord = first(words);
      const lastWord = last(words);
      const startTime = firstWord && firstWord.start_time;
      const endTime = lastWord && lastWord.end_time;

      return { startTime, endTime, text };
    })
  };
}

export function getTranscription(fileName: string) {
  const bucket = 'finished-transcription';
  const params = { Bucket: bucket, Key: `${fileName}.json` };

  return new Bluebird((resolve, reject) => {
    s3.getObject(params)
      .on('success', response => {
        const body = response.data && response.data.Body;
        const json = JSON.parse(body.toString());

        resolve(json);
      })
      .on('error', error => {
        reject(error);
      })
      .send();
  });

  // TODO: promisify!
  // return s3
  //   .getObject(params)
  //   .promise()
  //   .then(res => {
  //     console.log({ body: res.Body });
  //     return JSON.parse(res.Body.toString());
  //   });
}

export function sign(filename: string, contentType: string) {
  const params = {
    Bucket: bucketName,
    Key: filename,
    Expires: 3600,
    ContentType: contentType
  };

  return new Bluebird((resolve, reject) => {
    s3.getSignedUrl('putObject', params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  // TODO: promisify!
  // return s3
  //   .getSignedUrl('putObject', params)
  //   .promise()
}

export default {
  sign,
  listTranscriptionJobs,
  startTranscription,
  getTranscription,
  isValidTranscription,
  parseTranscription
};

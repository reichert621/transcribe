const AWS = require('aws-sdk');
const { chunk, last } = require('lodash');

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

// fileUri format: 1547344263217-podcast-snippet.mp3
function startTranscription(fileName) {
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

function listTranscriptionJobs(fileName) {
  const params = {
    JobNameContains: fileName,
    MaxResults: 100
  };

  return transcribeService.listTranscriptionJobs(params).promise();
}

function parseTranscription(awsTranscription) {
  if (!awsTranscription) {
    return null;
  }
  const numWordsPerTimestamp = 10;
  const { transcripts, items } = awsTranscription.results;

  const result = {};
  result.jobName = awsTranscription.jobName;
  result.transcript = transcripts[0].transcript;

  const chunks = chunk(items, numWordsPerTimestamp);
  result.textByTime = chunks.map(group => {
    const text = group
      //TODO Handle punctuations better;
      .map(item => item.alternatives[0].content)
      .join(' ');

    // Punctuations do not have start or end time
    const words = group.filter(item => item.type === 'pronunciation');
    const startTime = words[0].start_time;
    const endTime = last(words).end_time;

    return {
      startTime,
      endTime,
      text
    };
  });

  return result;
}

function getTranscription(fileName) {
  const bucket = 'finished-transcription';
  const params = { Bucket: bucket, Key: `${fileName}.json` };

  return new Promise((resolve, reject) => {
    s3.getObject(params)
      .on('success', response => {
        const json = JSON.parse(response.data.Body);

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
  //   .then(res => JSON.parse(res.data.Body));
}

function sign(filename, contentType) {
  const params = {
    Bucket: bucketName,
    Key: filename,
    Expires: 3600,
    ContentType: contentType
  };

  return new Promise((resolve, reject) => {
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

module.exports = {
  sign,
  listTranscriptionJobs,
  startTranscription,
  getTranscription,
  parseTranscription
};

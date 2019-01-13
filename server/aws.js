// Load the SDK and UUID
const AWS = require('aws-sdk');
const uuid = require('node-uuid');
const fs = require('fs');

// Create an S3 client
const s3 = new AWS.S3({ region: 'us-west-2' });

// Create a bucket and upload something into it
const bucketName = 'audio-search-kam';
const transcribeService = new AWS.TranscribeService({
  apiVersion: '2017-10-26',
  region: 'us-west-2'
});

function uploadVideo(filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err;
    }
    const base64data = new Buffer(data, 'binary');

    s3.putObject(
      {
        Bucket: bucketName,
        Key: filePath,
        Body: base64data
      },
      (err, resp) => {
        if (err) {
          console.log(err);
        } else {
          console.log(
            `Successfully uploaded data to ${bucketName}/${filePath}`
          );
        }
      }
    );
  });
}

function startTranscription(fileUri, fileName) {
  const fileSplit = fileUri.split('.');
  const mediaFormat = fileSplit[fileSplit.length - 1];
  console.log('File URI:', fileUri);
  const jobName = `${uuid.v4()}-${fileName}`;
  const params = {
    LanguageCode: 'en-US',
    Media: {
      /* required */
      MediaFileUri: fileUri
    },
    MediaFormat: mediaFormat,
    TranscriptionJobName: jobName,
    MediaSampleRateHertz: 44100,
    OutputBucketName: 'finished-transcription',
    Settings: {
      // ChannelIdentification: true,
      // MaxSpeakerLabels: 0,
      // ShowSpeakerLabels: true,
    }
  };

  transcribeService.startTranscriptionJob(params, (err, data) => {
    if (err) {
      // an error occurred
      console.log(err, err.stack);
    } else {
      // successful response
      console.log(data);
    }
  });

  return { jobName };
}

function getTranscription(fileName, callback) {
  const bucket = 'finished-transcription';
  const params = {
    Bucket: bucket,
    Key: `${fileName}.json`
  };

  s3.getObject(params)
    .on('success', response => {
      callback(JSON.parse(response.data.Body));
    })
    .on('error', error => {
      console.log(error);
    })
    .send();
}

function sign(filename, contentType) {
  const params = {
    Bucket: bucketName,
    Key: filename,
    Expires: 60000,
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
}

module.exports = {
  sign
};

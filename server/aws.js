// Load the SDK and UUID
const AWS = require('aws-sdk');
const uuid = require('node-uuid');
const fs = require('fs');

// Create an S3 client
const s3 = new AWS.S3({ region: 'us-west-2' });

const fileName = 'sample.mp4';

// const fileName = new Date().getTime() + filePath;
// Create a bucket and upload something into it
const bucketName = 'audio-search-kam';
const transcribeService = new AWS.TranscribeService({
  apiVersion: '2017-10-26',
  region: 'us-west-2'
});

function uploadVideo(filePath, callback) {
  fs.readFile(filePath, function (err, data) {
    if (err) {
      throw err;
    }
    const base64data = new Buffer(data, 'binary');
    s3.putObject({
      Bucket: bucketName,
      Key: filePath,
      Body: base64data
    }, function (err, resp) {
      if (err) {
        console.log(err);
      } else {
        console.log(`Successfully uploaded data to ${bucketName}/${filePath}`);
      }
    });
  });
}

// uploadVideo('sample.mp4')

const fileUri = `https://s3-us-west-2.amazonaws.com/${bucketName}/${fileName}`;

function startTranscription(fileUri, fileName) {
  const fileSplit = fileUri.split('.');
  const mediaFormat = fileSplit[fileSplit.length - 1];
  console.log(fileUri);

  const jobName = uuid.v4() + '-' + fileName;
  var params = {
    LanguageCode: 'en-US',
    Media: { /* required */
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
  transcribeService.startTranscriptionJob(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
    }// an error occurred
    else {
      console.log(data);
    }           // successful response
  });
  return { jobName };
}

function getTranscription(fileName, callback) {
  const bucket = 'finished-transcription';
  const params = {
    Bucket: bucket,
    Key: fileName + '.json'
  };
  s3.getObject(params)
    .on('success', function (response) {
      callback(JSON.parse(response.data.Body));
    })
    .on('error', function (error) {
      console.log(error);
    })
    .send();
}

function sign(filename) {
  const params = {
    Bucket: bucketName,
    Key: filename,
    Expires: 60
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', params, (err, data) => {
      if (err) {
        reject(err);
        return err;
      } else {
        resolve(data);
      }
    });
  });
}


module.exports = {
  sign,
};
// uploadVideo(filePath);
// console.log(startTranscription(fileUri, fileName))
// sign(uuid.v4() + fileName);

// console.log(getTranscription('1547337870630sample.mp4'))

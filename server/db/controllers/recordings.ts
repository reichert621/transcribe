import { Request, Response } from 'express';
import { first } from 'lodash';
import { M, Recording, User } from '../index';
import {
  AwsTranscription,
  formatFileName,
  startTranscription,
  listTranscriptionJobs,
  getTranscription,
  isValidTranscription,
  parseTranscription
} from '../../aws';
import { handleError } from './utils';

const getInProgressJobs = (recordings: M.Recording[]) => {
  const promises = recordings
    .filter(({ status }) => status === 'IN_PROGRESS')
    .map(({ name }) => listTranscriptionJobs(name));

  return Promise.all(promises).then(results => {
    return results.reduce((acc, jobs) => {
      const job = first(jobs);

      return job ? acc.concat(job) : acc;
    }, []);
  });
};

const getCompletedTranscriptions = (
  jobs: AWS.TranscribeService.TranscriptionJobSummary[]
) => {
  const promises = jobs.reduce((acc, job) => {
    const { TranscriptionJobName: name, TranscriptionJobStatus: status } = job;

    if (status === 'COMPLETED') {
      return acc.concat(getTranscription(name));
    } else {
      return acc;
    }
  }, []);

  return Promise.all(promises);
};

const updateRecordingTranscriptions = (transcriptions: AwsTranscription[]) => {
  const promises = transcriptions
    .filter(transcription => isValidTranscription(transcription))
    .map(transcription => {
      const parsed = parseTranscription(transcription);
      const { jobName: name } = parsed;

      return Recording.updateByName(name, {
        transcription: parsed,
        status: 'COMPLETED'
      });
    });

  return Promise.all(promises);
};

export default {
  async fetch(req: Request, res: Response) {
    try {
      // const { fileName, status } = req.query;
      const { id: userId } = req.user;
      const currentRecordings = await Recording.fetch({ userId });
      console.log({ currentRecordings });
      const jobs = await getInProgressJobs(currentRecordings);
      console.log({ jobs });
      const completed = await getCompletedTranscriptions(jobs);
      console.log({ completed });
      const updates = await updateRecordingTranscriptions(completed);
      console.log({ updates });

      const recordings = await Recording.fetch({ userId });

      return res.json({ recordings });
    } catch (err) {
      return handleError(res, err);
    }
  },

  async findById(req: Request, res: Response) {
    try {
      const { id: recordingId } = req.params;
      const { id: userId, credits } = req.user;
      const recording = await Recording.findById(recordingId);

      if (recording.paid) {
        console.log('Already paid! Returning recording.');
        return res.json({ recording });
      } else {
        const duration = Recording.calculateDuration(recording);
        const cost = User.convertSecondsToCredits(duration);
        console.log({ duration, credits, cost });

        if (credits >= cost) {
          console.log(
            `Deducting ${cost} credits from ${credits} and marking recording as paid!`
          );
          await User.deductCredit(userId, cost);
          const result = await Recording.update(recordingId, { paid: true });

          return res.json({ recording: result });
        }

        return res.json({
          recording: { ...recording, transcription: null }
        });
      }
    } catch (err) {
      handleError(res, err);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { id: userId } = req.user;
      const { fileName } = req.body;
      const name = formatFileName(fileName);
      // TODO should check start transcription for status
      const recording = await Recording.create({
        name,
        userId,
        status: 'IN_PROGRESS'
      });
      await startTranscription(name);
      res.json({ recording });
    } catch (err) {
      handleError(res, err);
    }
  }
};

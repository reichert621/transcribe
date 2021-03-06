import { first, last } from 'lodash';
import knex from '../knex';
import M from './types';

type RecordingParams = {
  id?: number;
  name?: string;
  timestamp?: any;
  transcription?: any;
  userId?: number;
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  paid?: boolean;
};

const Recording = () => knex('recordings');

const fetch = (where: any = {}) => {
  return Recording()
    .select()
    .where(where)
    .orderBy('timestamp', 'desc');
};

const findOne = (where: any = {}) => {
  return fetch(where).first();
};

const findById = (id: number, where: any = {}) => {
  return findOne({ ...where, id });
};

const create = (params: RecordingParams) => {
  return Recording()
    .returning('id')
    .insert(params)
    .then(first)
    .then((id: number) => findById(id));
};

const update = (id: number, params: RecordingParams) => {
  return findById(id)
    .update(params)
    .then(count => count > 0)
    .then(() => findById(id));
};

const findByName = (name: string, where: any = {}) => {
  return findOne({ ...where, name });
};

const updateByName = (name: string, params: RecordingParams) => {
  return findByName(name)
    .update(params)
    .then(count => count > 0)
    .then(() => findByName(name));
};

const destroy = (id: number) => {
  return findById(id).delete();
};

const calculateDuration = (recording: M.Recording) => {
  if (!recording || !recording.transcription) {
    return 0;
  }
  const { transcription } = recording;
  const { textByTime } = transcription;
  const times = textByTime
    .map(({ endTime }) => Number(endTime))
    .sort((a, b) => a - b);

  return last(times);
};

export default {
  fetch,
  findById,
  create,
  update,
  destroy,
  findOne,
  updateByName,
  calculateDuration
};

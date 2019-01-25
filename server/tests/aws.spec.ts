import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getTestTranscription } from './utils';
import { formatFileName, parseTranscription } from '../aws';

describe('aws', () => {
  describe('formatFileName', () => {
    it('formats file names correctly', () => {
      const f1 = '123-podcast.mp3';
      const f2 = '123 podcast.mp3';
      const f3 = '   123   podcast.mp3   ';
      const expected = '123-podcast.mp3';

      assert.equal(formatFileName(f1), expected);
      assert.equal(formatFileName(f2), expected);
      assert.equal(formatFileName(f3), expected);
    });
  });

  describe('parseTranscription', () => {
    it('parses valid transcriptions', () => {
      const text = 'This is a test. Hello world!';
      const transcription = getTestTranscription(text);
      const parsed = parseTranscription(transcription, 2);
      const expected = {
        textByTime: [
          { startTime: '0.10', endTime: '0.60', text: 'This is' },
          { startTime: '0.70', endTime: '1.20', text: 'a test' },
          { startTime: '1.30', endTime: '1.80', text: 'Hello world' }
        ]
      };

      assert.equal(parsed.jobName, transcription.jobName);
      assert.equal(parsed.transcript, text);
      assert.deepEqual(parsed.textByTime, expected.textByTime);
    });

    it('parses weird transcriptions', () => {
      const text = 'ThisTran Scription is! All. Sorts of... messed up    .';
      const transcription = getTestTranscription(text);
      const parsed = parseTranscription(transcription, 2);
      const expected = {
        textByTime: [
          {
            startTime: '0.10',
            endTime: '0.60',
            text: 'ThisTran Scription'
          },
          { startTime: '0.70', endTime: '1.20', text: 'is All' },
          { startTime: '1.30', endTime: '1.80', text: 'Sorts of' },
          { startTime: '1.90', endTime: '2.40', text: 'messed up' }
        ]
      };

      assert.equal(parsed.jobName, transcription.jobName);
      assert.equal(parsed.transcript, text);
      assert.deepEqual(parsed.textByTime, expected.textByTime);
    });

    it('handles invalid transcriptions', () => {
      assert.isNull(parseTranscription(null));
    });
  });
});

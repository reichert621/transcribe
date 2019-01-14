const { describe, it } = require('mocha');
const { assert } = require('chai');
const { getTestTranscription } = require('./utils');
const { parseTranscription } = require('../aws');

describe('aws', () => {
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
      assert.isNull(parseTranscription());
      assert.isNull(parseTranscription(null));
      assert.isNull(parseTranscription({}));
      assert.isNull(parseTranscription([]));
      assert.isNull(parseTranscription({ foo: 'bar' }));
      assert.isNull(parseTranscription({ results: [], jobName: 'foo' }));
    });
  });
});

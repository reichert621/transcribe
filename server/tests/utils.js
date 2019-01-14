const generateTestTranscriptionItems = transcript => {
  return transcript
    .split(' ')
    .map(word => word.replace(/\W+/g, ''))
    .filter(word => word && word.length)
    .map((word, index) => {
      const start = 0.1 + index * 0.3;
      const end = start + 0.2;

      return {
        start_time: start.toFixed(2),
        end_time: end.toFixed(2),
        alternatives: [{ confidence: '1.0', content: word }],
        type: 'pronunciation'
      };
    });
};

const getTestTranscription = (transcript = 'Hello world') => {
  return {
    jobName: `${+new Date()}-file.mp3`,
    accountId: '1234567890',
    results: {
      transcripts: [{ transcript }],
      items: generateTestTranscriptionItems(transcript)
    }
  };
};

module.exports = {
  generateTestTranscriptionItems,
  getTestTranscription
};

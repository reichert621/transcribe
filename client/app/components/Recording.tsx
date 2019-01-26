import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Box, Header, Input } from './Common';
import NavBar from './NavBar';
import { Recording, fetchRecording } from '../helpers/recordings';

type RecordingProps = RouteComponentProps<{ id: number }> & {};
type RecordingState = {
  recording: Recording;
  query?: string;
};

class RecordingPage extends React.Component<RecordingProps, RecordingState> {
  constructor(props: RecordingProps) {
    super(props);

    this.state = { recording: null, query: '' };
  }

  componentDidMount() {
    const { id } = this.props.match.params;

    return fetchRecording(id)
      .then(recording => {
        console.log('Recording response:', recording);
        this.setState({ recording });
      })
      .catch(err => {
        console.log('Error fetching recording!', err);
      });
  }

  render() {
    const { recording, query } = this.state;
    console.log('recording!', recording);

    if (!recording) {
      // TODO: render loading
      return null;
    }

    const { name, transcription } = recording;
    const { transcript, textByTime = [] } = transcription;

    return (
      <React.Fragment>
        <NavBar />

        <Box p={4}>
          <Header my={4}>{name}</Header>

          <Box>
            <Box>Full text: {transcript}</Box>

            <Header my={4}>Search</Header>

            <Input
              mb={2}
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e: React.FormEvent<HTMLInputElement>) =>
                this.setState({ query: e.currentTarget.value })
              }
            />

            {textByTime
              .filter(({ text }) => {
                return (
                  text &&
                  text.length &&
                  text.toLowerCase().includes(query.toLowerCase())
                );
              })
              .map(({ text, startTime }, key) => {
                return (
                  <Box key={key}>
                    {startTime} - {text}
                  </Box>
                );
              })}
          </Box>
        </Box>
      </React.Fragment>
    );
  }
}

export default RecordingPage;

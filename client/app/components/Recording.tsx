import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Box, Header } from './Common';
import { Recording, fetchRecording } from '../helpers/recordings';

type RecordingProps = RouteComponentProps<{ id: number }> & {};
type RecordingState = {
  recording: Recording;
};

class RecordingPage extends React.Component<RecordingProps, RecordingState> {
  constructor(props: RecordingProps) {
    super(props);

    this.state = { recording: null };
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
    const { recording } = this.state;

    if (!recording) {
      // TODO: render loading
      return null;
    }

    const { name, transcription } = recording;

    return (
      <Box p={4}>
        <Header my={4}>{name}</Header>

        <Box>
          <pre>{JSON.stringify(transcription, null, 2)}</pre>
        </Box>
      </Box>
    );
  }
}

export default RecordingPage;

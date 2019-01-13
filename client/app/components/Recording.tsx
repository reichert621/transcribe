import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Box } from './Common';
import { fetchRecording } from '../helpers/recordings';

type RecordingProps = RouteComponentProps<{ id: number }> & {};
type RecordingState = {};

class Recording extends React.Component<RecordingProps, RecordingState> {
  constructor(props: RecordingProps) {
    super(props);

    this.state = {};
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
    console.log(this.state);

    return <Box>Recording page!</Box>;
  }
}

export default Recording;

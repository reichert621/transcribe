import * as React from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { Box, Header, Flex, Container } from './Common';
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
        console.log('Recording:', recording);
        this.setState({ recording });
      })
      .catch(err => {
        console.log('Error fetching recording!', err);
      });
  }

  render() {
    const { recording, query } = this.state;

    if (!recording) {
      // TODO: render loading
      return <NavBar />;
    }

    const { name, transcription, paid } = recording;

    if (!paid) {
      return (
        <React.Fragment>
          <NavBar />

          <Box p={4}>
            <Header my={4}>{name}</Header>

            <Box mt={4}>
              <Typography variant="body1" gutterBottom>
                Please purchase more credits to view transcription.
              </Typography>

              <Typography variant="body1" gutterBottom>
                Credits can be purchased <Link to="/profile">here</Link>.
              </Typography>
            </Box>
          </Box>
        </React.Fragment>
      );
    }

    const { transcript, textByTime = [] } = transcription;

    return (
      <React.Fragment>
        <NavBar />

        <Box p={4}>
          <Typography variant="h4" gutterBottom>
            {name}
          </Typography>

          <Flex>
            <Container my={3} mr={4} p={4} flex={3}>
              <Typography variant="h5" gutterBottom>
                Full Text
              </Typography>

              <Box>{transcript}</Box>
            </Container>

            <Container my={3} p={4} flex={2}>
              <Box mb={4}>
                <TextField
                  id="query"
                  label="Search"
                  type="text"
                  fullWidth={true}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    this.setState({ query: e.currentTarget.value })
                  }
                />
              </Box>

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
            </Container>
          </Flex>
        </Box>
      </React.Fragment>
    );
  }
}

export default RecordingPage;

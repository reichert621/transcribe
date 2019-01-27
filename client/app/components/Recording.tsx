import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { Box, Header, Flex, Container, Text, Link } from './Common';
import NavBar from './NavBar';
import {
  Recording,
  fetchRecording,
  formatTimestamp,
  formatFullTranscript
} from '../helpers/recordings';

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

          <Flex flexDirection={['column', 'row']} mx={-3}>
            <Container m={3} p={4} flex={3} style={{ minHeight: 400 }}>
              <Typography variant="h5" gutterBottom>
                Full Text
              </Typography>

              <Box>
                {formatFullTranscript(transcript).map((paragraph, idx) => {
                  return <p key={idx}>{paragraph}</p>;
                })}
              </Box>
            </Container>

            <Container m={3} p={4} flex={2} style={{ minHeight: 400 }}>
              <Box mb={4}>
                <TextField
                  id="query"
                  label="Search"
                  type="text"
                  variant="outlined"
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
                .slice(0, 20)
                .map(({ text, startTime }, key) => {
                  const ts = formatTimestamp(startTime);

                  return (
                    <Flex key={key}>
                      <Text fontWeight={500} mr={3}>
                        {ts}
                      </Text>
                      <Text>{text}</Text>
                    </Flex>
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

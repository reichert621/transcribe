import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { Box, Header, Flex, Container, Text, Link } from './Common';
import NavBar from './NavBar';
import { Audio } from './AudioPlayer';
import {
  Recording,
  fetchRecording,
  formatTimestamp,
  formatFullTranscript,
  getSignedDownloadUrl
} from '../helpers/recordings';

type RecordingProps = RouteComponentProps<{ id: number }> & {};
type RecordingState = {
  recording: Recording;
  query?: string;
  url?: string;
};

class RecordingPage extends React.Component<RecordingProps, RecordingState> {
  constructor(props: RecordingProps) {
    super(props);

    this.state = { recording: null, query: '', url: null };
  }

  async componentDidMount() {
    try {
      const { id } = this.props.match.params;
      const recording = await fetchRecording(id);
      const { name: fileName } = recording;
      // TODO: only get this url if the recording has been paid for
      const url = await getSignedDownloadUrl(fileName);

      this.setState({ recording, url });
    } catch (err) {
      console.log('Error fetching recording!', err);
    }
  }

  render() {
    const { recording, query, url } = this.state;
    console.log('Url!!!', url);

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

          {url && (
            <Container p={4} my={3}>
              <Audio audioUrl={url} />
            </Container>
          )}

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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.stopPropagation();

                    this.setState({ query: e.currentTarget.value });
                  }}
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

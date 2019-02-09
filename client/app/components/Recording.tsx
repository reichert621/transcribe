import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import blue from '@material-ui/core/colors/blue';
import { Box, Header, Flex, Container, Text, Link } from './Common';
import NavBar from './NavBar';
import { Audio } from './AudioPlayer';
import {
  Recording,
  TextByTime,
  fetchRecording,
  formatTimestamp,
  formatFullTranscript,
  getSignedDownloadUrl
} from '../helpers/recordings';

const HIGHLIGHT = blue[50];

type RecordingProps = RouteComponentProps<{ id: number }> & {};
type RecordingState = {
  recording: Recording;
  query?: string;
  url?: string;
  timestamp?: number;
  currentTime?: number;
};

class RecordingPage extends React.Component<RecordingProps, RecordingState> {
  constructor(props: RecordingProps) {
    super(props);

    this.state = {
      recording: null,
      query: '',
      url: null,
      // TODO: distinguish between `timestamp` and `currentTime` more clearly
      timestamp: null,
      currentTime: null
    };
  }

  async componentDidMount() {
    try {
      const { id } = this.props.match.params;
      const recording = await fetchRecording(id);
      const { name: fileName } = recording;
      // TODO: only get this url if the recording has been paid for
      const url = await getSignedDownloadUrl(fileName);
      console.log('Audio url:', url);

      this.setState({ recording, url });
    } catch (err) {
      console.log('Error fetching recording!', err);
    }
  }

  handleTimeUpdate = (ts: number) => {
    this.setState({ currentTime: ts, timestamp: null });
  };

  // This allows us to highlight the text that is currently being played
  renderFullTranscription = (textByTime: TextByTime[]) => {
    const { currentTime } = this.state;

    return textByTime.map(({ text, startTime, endTime }) => {
      const start = Number(startTime);
      const end = Number(endTime);
      const isCurrent = currentTime && currentTime > start && currentTime < end;

      return (
        <span key={startTime}>
          <span
            style={{
              cursor: 'pointer',
              background: isCurrent ? HIGHLIGHT : 'transparent'
            }}
            onClick={() => this.setState({ timestamp: start })}
          >
            {text}
          </span>{' '}
        </span>
      );
    });
  };

  render() {
    const { recording, query, url, timestamp, currentTime } = this.state;

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
              <Audio
                audioUrl={url}
                currentTime={timestamp}
                onTimeUpdate={this.handleTimeUpdate}
              />
            </Container>
          )}

          <Flex flexDirection={['column', 'row']} mx={-3}>
            <Container m={3} p={4} flex={3} style={{ minHeight: 400 }}>
              <Typography variant="h5" gutterBottom>
                Full Text
              </Typography>

              <Box>
                {/*
                TODO: figure out how to format long text into paragraphs

                {formatFullTranscript(transcript).map((paragraph, idx) => {
                  return <p key={idx}>{paragraph}</p>;
                })}
                */}
                {this.renderFullTranscription(textByTime)}
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
                .map(({ text, startTime, endTime }, key) => {
                  const ts = formatTimestamp(startTime);
                  const start = Number(startTime);
                  const end = Number(endTime);
                  const isCurrent =
                    currentTime && currentTime > start && currentTime < end;

                  return (
                    <Flex
                      key={key}
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        this.setState({ timestamp: Number(startTime) })
                      }
                    >
                      <Text fontWeight={500} mr={3} color={blue[500]}>
                        {ts}
                      </Text>
                      <Text
                        style={{
                          background: isCurrent ? HIGHLIGHT : 'transparent'
                        }}
                      >
                        {text}
                      </Text>
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

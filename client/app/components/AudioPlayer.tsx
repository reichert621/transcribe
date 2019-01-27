import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Button, { ButtonProps } from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { fetchAudioUrl } from '../helpers/ny';
import { Box, Header, Flex } from './Common';

const Container = styled(Paper)`
  padding: 32px;
  margin: 0 auto;
  max-width: 1080px;
`;

const AudioControlButton = (props: ButtonProps) => {
  const { children, style, onClick, ...rest } = props;

  return (
    <Button
      variant="contained"
      size="small"
      color="primary"
      style={{ minWidth: 48, ...style }}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Button>
  );
};

type AudioPlayerProps = RouteComponentProps<{}> & {};
type AudioPlayerState = {
  articleUrl?: string;
  audioUrl?: string;
  playbackRate?: number;
};

type AudioProps = {
  audioUrl: string;
};
type AudioState = {
  playbackRate: number;
};

export class Audio extends React.Component<AudioProps, AudioState> {
  audio: HTMLAudioElement;

  constructor(props: AudioProps) {
    super(props);

    this.state = {
      playbackRate: 1
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.setupKeyboardShortcuts);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.setupKeyboardShortcuts);
  }

  setupKeyboardShortcuts = (e: KeyboardEvent) => {
    switch (e.key) {
      case ' ':
        return this.handleTogglePlaying();

      case 's':
        return this.handleDecSpeed();
      case 'd':
        return this.handleIncSpeed();

      case 'h':
        return this.handleIncSpeed(1.0);
      case 'j':
        return this.handleIncSpeed(1.5);
      case 'k':
        return this.handleIncSpeed(2.0);
      case 'l':
        return this.handleIncSpeed(2.5);

      case 'ArrowLeft':
        return this.handleDecTime(15);
      case 'ArrowRight':
        return this.handleIncTime(15);
      case 'ArrowDown':
        return this.handleDecTime(30);
      case 'ArrowUp':
        return this.handleIncTime(30);
    }
  };

  handlePlayAudio = () => {
    this.audio && this.audio.play();
  };

  handlePauseAudio = () => {
    this.audio && this.audio.pause();
  };

  handleTogglePlaying = () => {
    if (this.audio && this.audio.paused) {
      return this.handlePlayAudio();
    } else {
      return this.handlePauseAudio();
    }
  };

  handleIncSpeed = (speed?: number) => {
    if (this.audio) {
      const num = speed ? speed : this.audio.playbackRate + 0.1;
      const rate = Math.min(num, 4);

      this.setState({ playbackRate: rate });
      this.audio.playbackRate = rate;
    }
  };

  handleDecSpeed = () => {
    if (this.audio) {
      const rate = Math.max(this.audio.playbackRate - 0.1, 0.5);

      this.setState({ playbackRate: rate });
      this.audio.playbackRate = rate;
    }
  };

  handleIncTime = (n = 30) => {
    if (this.audio) {
      const { currentTime, duration } = this.audio;

      this.audio.currentTime = Math.min(currentTime + n, duration);
    }
  };

  handleDecTime = (n = 30) => {
    if (this.audio) {
      const { currentTime } = this.audio;

      this.audio.currentTime = Math.max(currentTime - n, 0);
    }
  };

  renderAudioSpeedControls() {
    const { playbackRate } = this.state;

    return (
      <Box>
        <Tooltip title="Shortcut: S Key">
          <AudioControlButton
            style={{
              minWidth: 48,
              marginTop: 16,
              marginRight: 8,
              marginLeft: 16
            }}
            onClick={this.handleDecSpeed}
          >
            -
          </AudioControlButton>
        </Tooltip>

        <TextField
          label="Speed"
          value={playbackRate.toFixed(1)}
          margin="none"
          InputProps={{ readOnly: true }}
          style={{ marginRight: 8, width: 80 }}
        />

        <Tooltip title="Shortcut: D Key">
          <AudioControlButton
            style={{ minWidth: 48, marginTop: 16, marginRight: 32 }}
            onClick={() => this.handleIncSpeed()}
          >
            +
          </AudioControlButton>
        </Tooltip>

        <Tooltip title="Shortcut: H Key">
          <AudioControlButton
            style={{ marginTop: 16, marginRight: 8 }}
            onClick={() => this.handleIncSpeed(1.0)}
          >
            1.0x
          </AudioControlButton>
        </Tooltip>

        <Tooltip title="Shortcut: J Key">
          <AudioControlButton
            style={{ marginTop: 16, marginRight: 8 }}
            onClick={() => this.handleIncSpeed(1.5)}
          >
            1.5x
          </AudioControlButton>
        </Tooltip>

        <Tooltip title="Shortcut: K Key">
          <AudioControlButton
            style={{ marginTop: 16, marginRight: 8 }}
            onClick={() => this.handleIncSpeed(2.0)}
          >
            2.0x
          </AudioControlButton>
        </Tooltip>

        <Tooltip title="Shortcut: L Key">
          <AudioControlButton
            style={{ marginTop: 16, marginRight: 16 }}
            onClick={() => this.handleIncSpeed(2.5)}
          >
            2.5x
          </AudioControlButton>
        </Tooltip>
      </Box>
    );
  }

  renderAudioTimeControls() {
    return (
      <Box>
        <Tooltip title="Shortcut: Left Arrow">
          <AudioControlButton
            style={{ marginTop: 16, marginRight: 8, marginLeft: 16 }}
            onClick={() => this.handleDecTime(15)}
          >
            -15 s
          </AudioControlButton>
        </Tooltip>

        <Tooltip title="Shortcut: Right Arrow">
          <AudioControlButton
            style={{ marginTop: 16, marginRight: 32 }}
            onClick={() => this.handleIncTime(15)}
          >
            +15 s
          </AudioControlButton>
        </Tooltip>

        <Tooltip title="Shortcut: Down Arrow">
          <AudioControlButton
            style={{ marginTop: 16, marginRight: 8 }}
            onClick={() => this.handleDecTime(30)}
          >
            -30 s
          </AudioControlButton>
        </Tooltip>

        <Tooltip title="Shortcut: Up Arrow">
          <AudioControlButton
            style={{ marginTop: 16, marginRight: 32 }}
            onClick={() => this.handleIncTime(30)}
          >
            +30 s
          </AudioControlButton>
        </Tooltip>
      </Box>
    );
  }

  render() {
    const { audioUrl } = this.props;

    return (
      <Box mt={4}>
        <audio
          id="player"
          src={audioUrl}
          controls
          style={{ width: '100%', marginBottom: 8 }}
          ref={audio => {
            this.audio = audio;
          }}
        />

        <Flex flexDirection={['column', 'column', 'row']}>
          {this.renderAudioSpeedControls()}
          {this.renderAudioTimeControls()}
        </Flex>
      </Box>
    );
  }
}

class AudioPlayer extends React.Component<AudioPlayerProps, AudioPlayerState> {
  input: HTMLInputElement;
  audio: HTMLAudioElement;

  constructor(props: AudioPlayerProps) {
    super(props);

    this.state = {
      articleUrl: '',
      audioUrl: '',
      playbackRate: 1
    };
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { articleUrl } = this.state;

    return fetchAudioUrl(articleUrl)
      .then(url => {
        this.input.blur();
        this.setState({ audioUrl: url });
      })
      .catch(err => {
        console.log('Error getting url!', err);
      });
  };

  render() {
    const { audioUrl } = this.state;

    return (
      <Box p={4}>
        <Container>
          <Header mb={2}>Audio Player</Header>

          <form onSubmit={this.handleSubmit}>
            <Box>
              <TextField
                label="Article/File URL"
                placeholder="Paste a URL and press Enter"
                margin="dense"
                fullWidth={true}
                inputRef={input => {
                  this.input = input;
                }}
                onChange={e =>
                  this.setState({
                    articleUrl: e.currentTarget.value
                  })
                }
              />
            </Box>
          </form>

          <Audio audioUrl={audioUrl} />
        </Container>
      </Box>
    );
  }
}

export default AudioPlayer;

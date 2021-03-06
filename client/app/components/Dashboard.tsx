import * as React from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import { groupBy } from 'lodash';
import * as moment from 'moment';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import IconButton from '@material-ui/core/IconButton';
import ReceiptIcon from '@material-ui/icons/Receipt';
import HourglassIcon from '@material-ui/icons/HourglassFull';
import ErrorIcon from '@material-ui/icons/Error';
import ArrowIcon from '@material-ui/icons/ArrowForward';
import UploadIcon from '@material-ui/icons/CloudUpload';
import Spinner from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import {
  Recording,
  TranscriptionStatus,
  formatFileName,
  createTranscriptionJob,
  fetchTranscriptionJobStatuses,
  getSignedUrl,
  uploadToS3
} from '../helpers/recordings';
import NavBar from './NavBar';
import { Flex, Box, Text, Header } from './Common';
import styled, { css } from 'styled-components';

type DashboardProps = RouteComponentProps<{}> & {};
type DashboardState = {
  recordings: { [type: string]: Recording[] };
  files: File[];
  isLoading: boolean;
  isUploading: boolean;
  showSuccessMessage: boolean;
};

const UploadZone = styled(Box)`
  border-radius: 2px;
  cursor: pointer;
  min-height: 208px;
  padding: 64px 32px;
  text-align: center;

  &:hover {
    background-color: #e3f2fd;
    opacity: 0.6;
  }

  ${props =>
    props.active &&
    css`
      background-color: #e3f2fd;
      opacity: 0.6;
    `}
`;

const ListContainer = styled(Paper)`
  padding: 32px 16px;
`;

class Dashboard extends React.Component<DashboardProps, DashboardState> {
  constructor(props: DashboardProps) {
    super(props);

    this.state = {
      recordings: {},
      files: [],
      isLoading: true,
      isUploading: false,
      showSuccessMessage: false
    };
  }

  componentDidMount() {
    return this.fetchRecordings()
      .then(() => this.setState({ isLoading: false }))
      .catch(err => this.setState({ isLoading: false }));
  }

  fetchRecordings() {
    return fetchTranscriptionJobStatuses()
      .then(recordings => {
        console.log('Recordings:', recordings);

        this.setState({
          recordings: groupBy(recordings, r => r.status)
        });
      })
      .catch(err => {
        console.log('Error fetching recordings!', err);
        // TODO
        this.props.history.push('/login');
      });
  }

  handleFileDrop = (files: File[]) => {
    this.setState({ isUploading: true });

    const [file] = files;
    const { name = '', type: contentType } = file;
    const formatted = formatFileName(name);
    const fileName = `${+new Date()}-${formatted}`;
    console.log({ fileName, contentType });

    return getSignedUrl(fileName, contentType)
      .then(url => {
        console.log('Data:', { fileName, url, file });
        return uploadToS3(url, file);
      })
      .then(res => {
        console.log('Creating transcription job!', res);
        return createTranscriptionJob(fileName);
      })
      .then(res => {
        console.log('Upload results:', res);
        this.setState({ isUploading: false, showSuccessMessage: true });
      })
      .then(() => this.fetchRecordings())
      .then(() => {
        setTimeout(() => this.setState({ showSuccessMessage: false }), 5000);
      })
      .catch(err => {
        console.log('Oh shit!', err);
        this.setState({ isUploading: false });
      });
  };

  renderUploadZone() {
    return (
      <Paper>
        <Dropzone onDrop={this.handleFileDrop} accept="video/mp4,audio/mp3">
          {({ getRootProps, getInputProps, isDragActive }) => (
            <UploadZone {...getRootProps()} active={isDragActive}>
              {/* TODO: specify all acceptable file types */}
              <input {...getInputProps()} accept="video/mp4,audio/mp3" />
              <Box mb={2}>
                <UploadIcon style={{ fontSize: 40 }} color="primary" />
              </Box>

              {isDragActive ? (
                <Text>Drop file!</Text>
              ) : (
                <Text>
                  Try dropping a file here, or click to select a file to upload!
                </Text>
              )}
            </UploadZone>
          )}
        </Dropzone>
      </Paper>
    );
  }

  renderUploadPending() {
    return (
      <Paper>
        <UploadZone>
          <Box mb={2}>
            <Spinner />
          </Box>

          <Text>Uploading...</Text>

          {/* <Box mt={4} px={4}>
            <LinearProgress />
          </Box> */}
        </UploadZone>
      </Paper>
    );
  }

  getIconByStatus(status: TranscriptionStatus) {
    switch (status) {
      case 'COMPLETED':
        return <ReceiptIcon />;
      case 'IN_PROGRESS':
        return <HourglassIcon />;
      case 'FAILED':
        return <ErrorIcon />;
      default:
        throw new Error(`Invalid status: ${status}`);
    }
  }

  getColorByStatus(status: TranscriptionStatus) {
    switch (status) {
      case 'COMPLETED':
        return '#2196f3';
      case 'IN_PROGRESS':
        return '#bdbdbd';
      case 'FAILED':
        return '#f44336';
      default:
        throw new Error(`Invalid status: ${status}`);
    }
  }

  viewRecordingDetails = (recording: Recording) => {
    const { id, status } = recording;

    if (status !== 'COMPLETED') {
      return null;
    }

    return this.props.history.push(`/recording/${id}`);
  };

  renderJobsByStatus(status: TranscriptionStatus) {
    if (this.state.isLoading) {
      return (
        <Flex justifyContent="center" alignItems="center" mt={2}>
          <Spinner />
        </Flex>
      );
    }

    const recordings = this.state.recordings[status];

    // TODO: show loading/empty state
    if (!recordings || !recordings.length) {
      return (
        <ListItem>
          <ListItemText primary="None" />
        </ListItem>
      );
    }

    return recordings.map((recording, key) => {
      const { id, name, status, timestamp } = recording;
      const ts = moment(timestamp).format('MMM DD, h:mm a');
      const bg = this.getColorByStatus(status);

      return (
        <ListItem
          key={key}
          button
          onClick={() => this.viewRecordingDetails(recording)}
        >
          <ListItemAvatar>
            <Avatar style={{ backgroundColor: bg }}>
              {this.getIconByStatus(status)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={name}
            secondary={
              status === 'IN_PROGRESS' ? (
                <LinearProgress style={{ marginTop: 8 }} />
              ) : (
                `Created: ${ts}`
              )
            }
          />

          {status === 'COMPLETED' && (
            <ListItemSecondaryAction>
              <IconButton
                aria-label="Go"
                onClick={() => this.viewRecordingDetails(recording)}
              >
                <ArrowIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
      );
    });
  }

  renderRecordingsLists() {
    return (
      <Flex
        flexDirection={['column', 'column', 'row']}
        justifyContent="space-between"
        mx={-2}
      >
        <Box flex={1} m={2}>
          <ListContainer>
            <Typography variant="h5" gutterBottom>
              Completed
            </Typography>

            <List>{this.renderJobsByStatus('COMPLETED')}</List>
          </ListContainer>
        </Box>
        <Box flex={1} m={2}>
          <ListContainer>
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>
                In Progress
              </Typography>

              <List>{this.renderJobsByStatus('IN_PROGRESS')}</List>
            </Box>

            <Box mb={4}>
              <Typography variant="h5" gutterBottom>
                Failed
              </Typography>

              <List>{this.renderJobsByStatus('FAILED')}</List>
            </Box>
          </ListContainer>
        </Box>
      </Flex>
    );
  }

  render() {
    const { isUploading, showSuccessMessage } = this.state;

    // TODO: improve design (obviously) and split out components as they grow
    return (
      <React.Fragment>
        <NavBar />

        <Box p={4}>
          <Box my={4}>
            <Box>
              {isUploading
                ? this.renderUploadPending()
                : this.renderUploadZone()}
            </Box>
          </Box>

          <Box my={4}>{this.renderRecordingsLists()}</Box>
        </Box>

        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={showSuccessMessage}
          ContentProps={{ 'aria-describedby': 'upload-success-id' }}
          message={<span id="upload-success-id">Upload successful!</span>}
        />
      </React.Fragment>
    );
  }
}

export default Dashboard;

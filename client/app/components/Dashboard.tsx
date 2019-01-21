import * as React from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import { groupBy } from 'lodash';
import * as moment from 'moment';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import IconButton from '@material-ui/core/IconButton';
import ReceiptIcon from '@material-ui/icons/Receipt';
import HourglassIcon from '@material-ui/icons/HourglassFull';
import ErrorIcon from '@material-ui/icons/Error';
import {
  Recording,
  TranscriptionStatus,
  createTranscriptionJob,
  fetchTranscriptionJobStatuses,
  getSignedUrl,
  uploadToS3
} from '../helpers/recordings';
import { Flex, Box, Text, Header } from './Common';
import styled from 'styled-components';

type DashboardProps = RouteComponentProps<{}> & {};
type DashboardState = {
  recordings: { [type: string]: Recording[] };
  files: File[];
  isUploading: boolean;
};

const UploadZone = styled(Box)`
  border-radius: 2px;
  cursor: pointer;
  padding: 64px 24px;

  &:hover {
    background-color: #fafafa;
  }

  ${props => props.active && 'background-color: #fafafa;'}
`;

const ListContainer = styled(Paper)`
  padding: 32px 16px;
  margin-right: 32px;
`;

class Dashboard extends React.Component<DashboardProps, DashboardState> {
  constructor(props: DashboardProps) {
    super(props);

    this.state = {
      recordings: {},
      files: [],
      isUploading: false
    };
  }

  componentDidMount() {
    return this.fetchRecordings();
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
    const fileName = `${+new Date()}-${file.name}`;
    const contentType = file.type;

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
        this.setState({ isUploading: false });
      })
      .then(() => this.fetchRecordings())
      .catch(err => {
        console.log('Oh shit!', err);
        this.setState({ isUploading: false });
      });
  };

  renderUploadZone() {
    return (
      <Paper>
        <Dropzone onDrop={this.handleFileDrop}>
          {({ getRootProps, getInputProps, isDragActive }) => (
            <UploadZone {...getRootProps()} active={isDragActive}>
              {/* TODO: specify all acceptable file types */}
              <input {...getInputProps()} accept="video/mp4,audio/mp3" />

              {isDragActive ? (
                <Text>Drop file!</Text>
              ) : (
                <Text>
                  Try dropping some files here, or click to select files to
                  upload.
                </Text>
              )}
            </UploadZone>
          )}
        </Dropzone>
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

  viewRecordingDetails = (recording: Recording) => {
    const { id, transcription } = recording;

    if (!transcription) {
      return null;
    }

    return this.props.history.push(`/recording/${id}`);
  };

  renderJobsByStatus(status: TranscriptionStatus) {
    const recordings = this.state.recordings[status];
    const icon = this.getIconByStatus(status);

    // TODO: show loading/empty state
    if (!recordings || !recordings.length) {
      return null;
    }

    return recordings.map((recording, key) => {
      const { id, name, status, timestamp, transcription } = recording;
      const ts = moment(timestamp).format('MMM DD, h:mm a');

      return (
        <ListItem
          key={key}
          button
          onClick={() => this.viewRecordingDetails(recording)}
        >
          {/* <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon> */}
          <ListItemAvatar>
            <Avatar>{icon}</Avatar>
          </ListItemAvatar>
          <ListItemText primary={name} secondary={`Created: ${ts}`} />
          {/* <ListItemSecondaryAction>
            <IconButton aria-label="Go">
              <ReceiptIcon />
            </IconButton>
          </ListItemSecondaryAction> */}
        </ListItem>
      );
    });
  }

  render() {
    const { isUploading } = this.state;

    // TODO: improve design (obviously) and split out components as they grow
    return (
      <Box p={4}>
        <Box my={4}>
          <Header>Dashboard</Header>

          <Box mt={4}>
            {isUploading ? (
              <Text p={24}>Uploading...</Text>
            ) : (
              this.renderUploadZone()
            )}
          </Box>
        </Box>

        <Box my={4}>
          <Flex>
            <Box flex={1}>
              <ListContainer>
                <Typography variant="h5" gutterBottom>
                  Completed
                </Typography>

                <List>{this.renderJobsByStatus('COMPLETED')}</List>
              </ListContainer>
            </Box>
            <Box flex={1}>
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
        </Box>
      </Box>
    );
  }
}

export default Dashboard;

import * as React from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import { groupBy } from 'lodash';
import * as moment from 'moment';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
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
  cursor: pointer;
  padding: 24px;

  &:hover {
    background-color: #fff;
  }

  ${props => props.active && 'background-color: #fff;'}
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
    );
  }

  renderJobsByStatus(status: TranscriptionStatus) {
    const recordings = this.state.recordings[status];

    // TODO: show loading/empty state
    if (!recordings || !recordings.length) {
      return null;
    }

    return recordings.map((recording, key) => {
      const { id, name, status, timestamp, transcription } = recording;
      const ts = moment(timestamp).format('MMM DD, h:mm a');

      return (
        <Box key={key} mb={4}>
          <Box p={1}>
            {transcription ? (
              <Link to={`/recording/${id}`}>{name}</Link>
            ) : (
              <Text>{name}</Text>
            )}
          </Box>

          <Box p={1}>
            <Text fontSize={12}>Created: {ts}</Text>
          </Box>
        </Box>
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
              <Header fontSize={3} mb={2}>
                Completed
              </Header>
              {this.renderJobsByStatus('COMPLETED')}
            </Box>
            <Box flex={1}>
              <Header fontSize={3} mb={2}>
                In Progress
              </Header>
              {this.renderJobsByStatus('IN_PROGRESS')}
            </Box>
            <Box flex={1}>
              <Header fontSize={3} mb={2}>
                Failed
              </Header>
              {this.renderJobsByStatus('FAILED')}
            </Box>
          </Flex>
        </Box>
      </Box>
    );
  }
}

export default Dashboard;

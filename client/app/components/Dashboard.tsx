import * as React from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import * as moment from 'moment';
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
  recordings: Recording[];
  files: File[];
  isUploading: boolean;
};

const UploadZone = styled(Box)`
  cursor: pointer;
  padding: 24px;

  &:hover {
    background-color: #fafafa;
  }

  ${props => props.active && 'background-color: #fafafa;'}
`;

class Dashboard extends React.Component<DashboardProps, DashboardState> {
  constructor(props: DashboardProps) {
    super(props);

    this.state = {
      recordings: [],
      files: [],
      isUploading: false
    };
  }

  componentDidMount() {
    return fetchTranscriptionJobStatuses()
      .then(recordings => {
        console.log('Job statuses:', recordings);
        this.setState({ recordings });
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
            <input {...getInputProps()} />

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
    const { recordings = [] } = this.state;
    const filtered = recordings.filter(
      recording => recording.status === status
    );

    // TODO: show loading/empty state

    return filtered.map((recording, key) => {
      const { id, name, status, timestamp } = recording;

      return (
        <Box key={key} mb={4}>
          <Box p={1}>
            <Link to={`/recording/${id}`}>Name: {name}</Link>
          </Box>
          {/* <Box p={1}>Status: {status}</Box> */}
          <Box p={1}>
            <Text fontSize={12}>
              Created: {moment(timestamp).format('YYYY-MM-DD hh:ss')}
            </Text>
          </Box>
        </Box>
      );
    });
  }

  render() {
    const { recordings = [], isUploading } = this.state;

    // TODO: improve design (obviously) and split out components as they grow
    return (
      <Box p={4}>
        <Box my={4}>
          <Header>Dashboard</Header>

          <Box mt={4}>
            {isUploading ? <Text>Uploading...</Text> : this.renderUploadZone()}
          </Box>
        </Box>

        <Box my={4}>
          <Flex>
            <Box flex={1}>
              <Header fontSize={3} mb={2}>
                In Progress
              </Header>
              {this.renderJobsByStatus('IN_PROGRESS')}
            </Box>
            <Box flex={1}>
              <Header fontSize={3} mb={2}>
                Completed
              </Header>
              {this.renderJobsByStatus('COMPLETED')}
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

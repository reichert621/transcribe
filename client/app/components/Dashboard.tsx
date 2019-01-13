import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import {
  Recording,
  TranscriptionJob,
  fetchRecordings,
  createTranscriptionJob,
  fetchTranscriptionJobStatuses,
  getSignedUrl,
  uploadToS3
} from '../helpers/recordings';
import { Flex, Box, Text, Header } from './Common';

type DashboardProps = RouteComponentProps<{}> & {};
type DashboardState = {
  recordings: Recording[];
  files: File[];
  jobs: TranscriptionJob[];
  isUploading: boolean;
};

class Dashboard extends React.Component<DashboardProps, DashboardState> {
  constructor(props: DashboardProps) {
    super(props);

    this.state = {
      recordings: [],
      files: [],
      jobs: [],
      isUploading: false
    };
  }

  componentDidMount() {
    return fetchTranscriptionJobStatuses()
      .then(jobs => {
        console.log('Job statuses:', jobs);
        this.setState({ jobs });
      })
      .catch(err => {
        console.log('Error fetching recordings!', err);
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
      .then(() => {
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

  render() {
    const { jobs = [], isUploading } = this.state;

    // TODO: improve design (obviously) and split out components as they grow
    return (
      <Flex p={4} flexDirection="column">
        <Box my={4}>
          <Header>Dashboard</Header>

          <Dropzone onDrop={this.handleFileDrop}>
            {({ getRootProps, getInputProps, isDragActive }) => (
              <Box {...getRootProps()} mt={4} style={{ cursor: 'pointer' }}>
                <input {...getInputProps()} />

                {isUploading ? (
                  <Text>Uploading...</Text>
                ) : (
                  <Text>
                    Try dropping some files here, or click to select files to
                    upload.
                  </Text>
                )}
              </Box>
            )}
          </Dropzone>
        </Box>

        <Box my={4}>
          <Header mb={2}>Jobs</Header>

          <Box>
            {jobs.map((job, key) => {
              const { name, status, createdAt } = job;
              return (
                <Box key={key} mb={4}>
                  <Box p={1}>Name: {name}</Box>
                  <Box p={1}>Status: {status}</Box>
                  <Box p={1}>Created: {createdAt}</Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Flex>
    );
  }
}

export default Dashboard;

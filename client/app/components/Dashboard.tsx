import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import {
  Recording,
  fetchRecordings,
  getSignedUrl,
  uploadToS3
} from '../helpers/recordings';
import { Flex, Box, Text, Header } from './Common';

type DashboardProps = RouteComponentProps<{}> & {};
type DashboardState = {
  recordings: Recording[];
  files: File[];
};

class Dashboard extends React.Component<DashboardProps, DashboardState> {
  constructor(props: DashboardProps) {
    super(props);

    this.state = { recordings: [], files: [] };
  }

  componentDidMount() {
    return fetchRecordings()
      .then(recordings => {
        console.log('Recording results:', recordings);
      })
      .catch(err => {
        console.log('Error fetching recordings!', err);
      });
  }

  handleFileDrop = (files: File[]) => {
    const [file] = files;
    const fileName = `${+new Date()}-${file.name}`;
    const contentType = file.type;

    return getSignedUrl(fileName, contentType)
      .then(url => {
        console.log('Data:', { fileName, url, file });
        return uploadToS3(url, file);
      })
      .then(res => {
        console.log('Upload results:', res);
      })
      .catch(err => console.log('Oh shit!', err));
  };

  render() {
    return (
      <Flex
        p={4}
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Header>Dashboard</Header>

        <Dropzone onDrop={this.handleFileDrop}>
          {({ getRootProps, getInputProps }) => (
            <Box {...getRootProps()} mt={4}>
              <input {...getInputProps()} />
              <Text>Drop files here, or click to select files</Text>
            </Box>
          )}
        </Dropzone>
      </Flex>
    );
  }
}

export default Dashboard;

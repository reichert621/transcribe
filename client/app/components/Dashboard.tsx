import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import { Recording, fetchRecordings, upload } from '../helpers/recordings';
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

    return upload(file)
      .then(res => {
        console.log('Upload success:', res);
      })
      .catch(err => {
        console.log('Upload error:', err);
      });
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

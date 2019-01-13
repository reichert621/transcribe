import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Box } from './Common';

type SandboxProps = RouteComponentProps<{}> & {};
type SandboxState = {};

class Sandbox extends React.Component<SandboxProps, SandboxState> {
  constructor(props: SandboxProps) {
    super(props);

    this.state = {};
  }

  render() {
    return <Box>Hello world!</Box>;
  }
}

export default Sandbox;

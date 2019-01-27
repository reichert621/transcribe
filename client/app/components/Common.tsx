import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import {
  space,
  color,
  fontSize,
  width,
  borders,
  flex,
  flexDirection,
  justifyContent,
  alignItems,
  fontWeight,
  lineHeight
} from 'styled-system';

export const Box = styled.div`
  ${space}
  ${width}
  ${fontSize}
  ${color}
  ${borders}
  ${flex}
  outline: 0;
`;

export const Flex = styled(Box)`
  display: flex;
  ${flexDirection}
  ${alignItems}
  ${justifyContent}
`;

export const Text = styled(Box)`
  ${fontWeight}
  ${lineHeight}
`;

export const Header = styled(Text)`
  font-size: ${props => props.fontSize || '32px'};
`;

export const Input = styled.input`
  ${space}
  ${width}
  ${fontSize}
  ${borders}
  padding: 8px;
`;

export const Button = styled.button`
  ${space}
  ${width}
  ${fontSize}
  ${borders}
  ${color}
`;

export const Container = styled(Paper)`
  ${space}
  ${width}
  ${flex}
`;

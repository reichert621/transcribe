import * as React from 'react';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import { Link as RouterLink, LinkProps } from 'react-router-dom';
import MuiLink from '@material-ui/core/Link';
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

// TODO: clean up?
export const Link = ({ to, children, ...rest }: LinkProps) => {
  return (
    <MuiLink
      component={({ className, children }) => {
        return (
          <RouterLink to={to} className={className} {...rest}>
            {children}
          </RouterLink>
        );
      }}
    >
      {children}
    </MuiLink>
  );
};

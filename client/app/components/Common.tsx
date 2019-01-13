import styled from 'styled-components';
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
  font-size: 32px;
  font-weight: 500;
`;

export const Input = styled.input`
  ${space}
  ${width}
  ${fontSize}
  ${borders}
`;

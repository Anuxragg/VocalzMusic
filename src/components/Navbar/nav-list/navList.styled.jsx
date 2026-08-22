import { styled } from "styled-components";

export const NavListContainerStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 8px 12px;

    @media (max-width: 480px) {
      display: ${props => props.$menuOpen ? 'flex' : 'none'};
      margin: 20px 0;
      width: 100%;
      padding: 0 15px;
    }
`

export const NavListStyled = styled.div`
  display: flex;
  align-items: center;
  height: 48px;
  width: ${props => props.$collapsed ? '56px' : '100%'};
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 0 12px;
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%)' 
    : 'transparent'};
  border: ${props => props.$isActive 
    ? '1px solid rgba(255, 255, 255, 0.16)' 
    : '1px solid transparent'};
  backdrop-filter: ${props => props.$isActive ? 'blur(12px)' : 'none'};
  -webkit-backdrop-filter: ${props => props.$isActive ? 'blur(12px)' : 'none'};
  box-shadow: ${props => props.$isActive ? '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)' : 'none'};

  &:hover {
    background: ${props => props.$isActive 
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 100%)' 
      : 'rgba(255, 255, 255, 0.07)'};
    border-color: rgba(255, 255, 255, 0.12);
    p, span { color: white; }
  }

  > p, span {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: ${props => props.$isActive ? 'white' : '#b3b3b3'};
      transition: color 0.2s ease;
  }

  > p {
    display: ${props => props.$collapsed ? 'none' : 'block'};
    margin-left: 16px;
    
    @media (max-width: 480px) {
      display: block;
    }
  }

  > span.react-icon {
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
  }

  @media (max-width: 768px) {
    height: 42px;
    > p, span { font-size: 13px; }
    > span.react-icon { font-size: 22px; }
  }
`;
import { styled, keyframes } from "styled-components";
import { SongSliderContainerStyled } from '../Audio-Player/audioControls.styled';

export const NavContainerStyled = styled.div`
  position: relative;
  height: 100vh;
  width: ${props => props.$collapsed ? '84px' : '280px'}; /* Slightly wider for library items */
  background: rgba(15, 15, 25, 0.4);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.25);
  overflow-y: auto;
  z-index: 2000;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: ${props => props.$collapsed ? '78px' : '200px'};
    height: 100vh;
  }

  @media (max-width: 480px) {
    width: 100%;
    height: ${props => props.$menuOpen ? '100vh' : '60px'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
    overflow-y: ${props => props.$menuOpen ? 'auto' : 'visible'};
    transition: height 0.3s ease;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`

export const NavHeadStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: ${props => props.$collapsed ? 'center' : 'flex-start'};
    padding: 24px;
    gap: 15px;
    color: white;

    @media (max-width: 480px) {
      flex-direction: row;
      justify-content: space-between;
      height: 60px;
      padding: 0 15px;
      align-items: center;
      width: 100%;
    }
`

export const SidebarToggleStyled = styled.button`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  color: #b3b3b3;
  transition: all 0.2s ease;
  width: 40px;
  height: 40px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    color: white;
  }

  svg {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 480px) {
    display: none;
  }
`

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const AppLogoContainerStyled = styled.div`
  height: ${props => props.$collapsed ? '40px' : '55px'};
  width: ${props => props.$collapsed ? '40px' : '55px'};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;

  &:hover {
    transform: scale(1.05);
  }

  > img{
    height: 100%;
    width: 100%;
    object-fit: contain;
    animation: ${rotate} 8s linear infinite;
  }

  @media (max-width: 480px) {
    height: 45px;
    width: 45px;
    margin-bottom: 0;
  }
`

export const AppNameContainerStyled = styled.div`
  margin-top: 2px;
  font-family: 'Plus Jakarta Sans', sans-serif; /* Clean premium font */
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s ease;
  display: ${props => props.$collapsed ? 'none' : 'block'};

  &:hover {
    color: #f83821;
  }

  > p:nth-child(1) {
    margin: 0;
    font-size: 1.4rem;
    line-height: 1.1;
    letter-spacing: -1px;
  }

  > p:nth-child(2) {
    margin: 0;
    font-size: 0.8rem;
    opacity: 0.6;
    text-transform: uppercase;
  }

  @media (max-width: 480px) {
    display: none;
  }
`

export const TopNavContainerStyled = styled.nav`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 32px;
  height: 80px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  position: sticky;
  top: 0;

  @media (max-width: 768px) {
    padding: 12px 20px;
    height: 70px;
  }

  @media (max-width: 480px) {
    padding: 10px 15px;
    height: 60px;
    position: sticky;
    top: 0;
    background-color: rgba(18, 18, 18, 0.85);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
  }
`;

export const TopNavLinksStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    gap: 15px;
  }

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

export const NavPillStyled = styled.button`
  display: flex;
  align-items: center;
  gap: 0;
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.05) 100%)' 
    : props.$isUpload 
      ? 'rgba(248, 56, 33, 0.08)' 
      : 'transparent'};
  border: ${props => props.$isUpload 
    ? '1px solid #f83821' 
    : props.$isActive 
      ? '1px solid rgba(255, 255, 255, 0.2)' 
      : '1px solid transparent'};
  backdrop-filter: ${props => props.$isActive ? 'blur(16px)' : 'none'};
  -webkit-backdrop-filter: ${props => props.$isActive ? 'blur(16px)' : 'none'};
  box-shadow: ${props => props.$isActive ? '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3)' : 'none'};
  border-radius: 30px;
  padding: ${props => props.$isActive ? '10px 20px' : '10px 14px'};
  color: ${props => props.$isActive ? '#ffffff' : props.$isUpload ? '#f83821' : '#b3b3b3'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  .icon {
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .label {
    max-width: ${props => props.$isActive ? '120px' : '0'};
    opacity: ${props => props.$isActive ? '1' : '0'};
    margin-left: ${props => props.$isActive ? '8px' : '0'};
    white-space: nowrap;
    overflow: hidden;
    transition: max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, margin-left 0.25s ease;
  }

  &:hover {
    background: ${props => props.$isActive 
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%)' 
      : props.$isUpload 
        ? 'rgba(248, 56, 33, 0.16)' 
        : 'rgba(255, 255, 255, 0.08)'};
    border-color: ${props => props.$isUpload 
      ? '#f83821' 
      : props.$isActive 
        ? 'rgba(255, 255, 255, 0.3)' 
        : 'rgba(255, 255, 255, 0.14)'};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color: white;
    padding: 10px 20px;
    box-shadow: ${props => props.$isActive 
      ? '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.35)' 
      : '0 2px 8px rgba(0, 0, 0, 0.15)'};

    .label {
      max-width: 120px;
      opacity: 1;
      margin-left: 8px;
    }
  }

  @media (max-width: 768px) {
    padding: ${props => props.$isActive ? '8px 16px' : '8px 12px'};
    font-size: 13px;
    .icon { font-size: 20px; }

    &:hover {
      padding: 8px 16px;
    }
  }

  @media (max-width: 480px) {
    padding: ${props => props.$isActive ? '8px 14px' : '8px 10px'};
    font-size: 12px;
    .icon { font-size: 18px; }

    &:hover {
      padding: 8px 14px;
    }
  }
`;

export const SearchInputPillStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.25);
  border-radius: 30px;
  padding: 10px 20px;
  color: white;
  flex-shrink: 0;
  transition: all 0.25s ease;

  &:focus-within {
    border-color: rgba(255, 255, 255, 0.35);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.08) 100%);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.35);
  }

  input {
    background: transparent;
    border: none;
    color: white;
    font-size: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    width: 200px;
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
      font-weight: 400;
    }
  }

  .icon {
    font-size: 22px;
    display: flex;
    align-items: center;
    color: white;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    gap: 6px;
    input {
      width: 120px; /* Smaller width for mobile */
      font-size: 13px;
    }
    .icon {
      font-size: 18px;
    }
  }
`;
export const SideNavHeaderStyled = styled.p`
  color: #b3b3b3;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize; /* Spotify uses 'My Library' with caps */
  padding: 24px 24px 8px 24px;
  margin: 0;
  display: ${props => props.$collapsed ? 'none' : 'flex'};
  opacity: 0.8;
  align-items: center;
  gap: 12px;

  svg { font-size: 24px; }
`;

/* Reuse existing hamburger styles for mobile compatibility */
export const HamburgerMenuStyled = styled.button`
  display: none;
  flex-direction: column;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  align-items: center;
  justify-content: center;

  @media (max-width: 480px) {
    display: flex;
    z-index: 1001;
  }
`

export const HamburgerLineStyled = styled.span`
  width: 28px;
  height: 3px;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s ease;
  display: block;
`;

export const EdgeHandleStyled = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 14px;
  height: 100%;
  cursor: ew-resize;
  background: transparent;
`
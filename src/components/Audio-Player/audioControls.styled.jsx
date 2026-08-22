import styled from "styled-components";

export const AudioControlsContainerStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;

    @media (max-width: 768px) {
      gap: 8px;
    }

    @media (max-width: 480px) {
      width: 100%;
      justify-content: center;
      margin-bottom: 10px;
    }
`

export const MainPlayButtonStyled = styled.div`
    width: 48px;
    height: 48px;
    background-color: #f83821;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease, opacity 0.2s ease;
    color: white;
    font-size: 28px;
    flex-shrink: 0;

    &:hover {
        background-color: #ff4a36;
        opacity: 0.9;
    }

  &:active {
        transform: scale(0.95);
    }

    @media (max-width: 480px) {
        width: 36px;
        height: 36px;
        font-size: 18px;
    }
`

export const ControlIconStyled = styled.span`
    color: ${props => props.$active ? '#f83821' : '#b3b3b3'};
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease, opacity 0.2s ease;
    padding: 6px;

    &:hover {
        color: white;
        opacity: 0.85;
    }

    &.prev-next {
        font-size: 28px;
    }

    @media (max-width: 480px) {
        font-size: 16px;
        padding: 4px;
        &.prev-next {
            font-size: 22px;
        }
    }
`

export const AudioControlsWrapperStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  > span{
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;

    &.previous-icon,
    &.next-icon{
      font-size: 35px;
    }

    > svg {
      cursor: pointer;
      transition: color 0.2s ease, opacity 0.2s ease;

      &:hover {
        opacity: 0.85;
      }
    }
  }

  @media (max-width: 768px) {
    gap: 10px;

    > span {
      font-size: 36px;

      &.previous-icon,
      &.next-icon {
        font-size: 32px;
      }
    }
  }

  @media (max-width: 480px) {
    gap: 10px;

    > span {
      font-size: 32px;

      &.previous-icon,
      &.next-icon {
        font-size: 28px;
      }
    }
  }
`

export const SongSliderContainerStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: center;
  margin: 0;

  > p {
    font-weight: 500;
    font-size: 11px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: 0.2px;
    margin: 0;
    min-width: 45px; /* Increased to prevent truncation */
    color: #b3b3b3;
    text-align: center;
  }

  @media (max-width: 768px) {
    gap: 6px;

    > p {
      font-size: 11px;
      min-width: 35px;
    }
  }

  @media (max-width: 480px) {
    gap: 4px;

    > p {
      font-size: 10px;
      min-width: 28px;
    }
  }
`

export const ProgressBarContainerStyled = styled.div`
  flex: 1; /* Fill the space between timestamps */
  max-width: 500px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -12px 0; /* Increase vertical hit area */
    z-index: 1;
  }

  > * {
    position: relative;
    z-index: 2;
  }

  &:hover > div::after {
    transform: translateY(-50%) scale(1);
  }

  @media (max-width: 1200px) {
    width: 220px;
  }

  @media (max-width: 1024px) {
    width: 180px;
  }

  @media (max-width: 768px) {
    width: 140px;
  }

  @media (max-width: 480px) {
    width: auto;
    min-width: 60px;
  }
`
export const ProgressBarStyled = styled.div`
  background-color: #f83821;
  height: 100%;
  width: 0%;
  border-radius: 10px;
  transition: ${props => props.$isDragging ? 'none' : 'width 0.1s ease-in-out'};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%) scale(0);
    width: 12px;
    height: 12px;
    background-color: #fff;
    border-radius: 50%;
    transition: transform 0.1s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
`

export const VolumeControlContainerStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
  margin: 0;
  cursor: pointer;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -10px -15px; /* Invisible hit area expansion */
    z-index: 1;
  }

  > * {
    position: relative;
    z-index: 2; /* Ensure buttons stay on top of hit area */
  }

  &:hover > div:last-child {
    width: 80px;
    opacity: 1;
    margin-left: 8px;
  }

  /* Keep expanded if dragging */
  ${props => props.$isDragging && `
    > div:last-child {
      width: 80px;
      opacity: 1;
      margin-left: 8px;
    }
  `}

  > span {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
    transition: color 0.2s ease, opacity 0.2s ease;
    margin: 0;
    color: #b3b3b3;

    &:hover {
      color: white;
      opacity: 0.85;
    }
  }

  @media (max-width: 1024px) {
    &:hover > div:last-child {
      width: 65px;
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
`

export const VolumeControlBarStyled = styled.div`
  height: 4px;
  width: 0;
  opacity: 0;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  cursor: pointer;
  flex-shrink: 0;
  margin: 0;
  transition: ${props => props.$isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'};
  overflow: hidden;

  &:hover > div::after {
    transform: translateY(-50%) scale(1);
  }
`

export const VolumeChangeStyled = styled.div`
  height: 100%;
  width: 100%;
  border-radius: 5px;
  background-color: #f83821;
  transition: ${props => props.$isDragging ? 'none' : 'width 0.1s ease-in-out'};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: -5px;
    top: 50%;
    transform: translateY(-50%) scale(0);
    width: 10px;
    height: 10px;
    background-color: #fff;
    border-radius: 50%;
    transition: transform 0.1s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
`
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { background-color: rgba(255, 255, 255, 0.05); }
  50% { background-color: rgba(255, 255, 255, 0.1); }
  100% { background-color: rgba(255, 255, 255, 0.05); }
`;

export const SkeletonBox = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  animation: ${pulse} 1.5s ease-in-out infinite;
  border-radius: ${props => props.$borderRadius || '4px'};
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '20px'};
`;

export const SongsListWrapperStyled = styled.div`
  margin: 30px 40px;
  max-width: 100%;

  @media (max-width: 768px) {
    margin: 30px 20px;
  }

  @media (max-width: 480px) {
    margin: 30px 10px;
  }
`

export const ViewHeadingStyled = styled.h1`
  font-family: 'Inter', sans-serif;
  color: white;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 20px 0;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
    margin: 0 0 12px 0;
  }
`

export const SongContainerStyled = styled.div`
  width: 100%;
  height: 60px;
  padding: 0 20px;
  background-color: transparent;
  color: white;
  border-radius: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  scroll-snap-align: start;

  &:hover {
    background-color: rgba(255,255,255,0.05);
  }

  @media (max-width: 768px) {
    height: 56px;
    padding: 0 4px 0 0;
    border-bottom: none;
    
    &:last-child {
      border-bottom: none;
    }
  }

  @media (max-width: 480px) {
    height: 60px;
  }
`

export const SongDetailsContainerStyled = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;


export const SongImgContainerStyled = styled.div`
  width: 40px;
  height: 40px;

  > img{
  border-radius: 3px;
  width: 100%;
  height: 100%;
}

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    
    > img {
      border-radius: 4px;
    }
  }
`

export const SongNameArtistStyled = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 15px;
  flex: 1;
  min-width: 0;
  overflow: hidden;

  p {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  p:first-child {
    font-size: 14px;
    font-weight: 600;
    color: white;
    margin-bottom: 2px;
  }

  p:last-child {
    font-size: 12px;
    font-weight: 400;
    color: #b3b3b3;
  }

  @media (max-width: 768px) {
    margin-left: 10px;
    
    p:first-child { font-size: 14px; }
    p:last-child { font-size: 12px; }
  }
`;

export const SongDurationContainerStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: 10px;
  flex-shrink: 0;
  justify-content: flex-end;
  min-width: 80px;

  p {
    font-size: 14px;
    color: #b3b2b2;
    margin: 0;
  }

  @media (max-width: 480px) {
    gap: 8px;
    min-width: 60px;
    
    p {
      font-size: 12px;
    }
  }
`;

export const LikeButtonStyled = styled.button`
  background: none;
  border: none;
  color: ${props => props.$isFavorite ? '#f83821' : '#b3b2b2'};
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$isFavorite ? '1' : '0'};
  transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease;

  ${SongContainerStyled}:hover & {
    opacity: 1;
  }

  &:hover {
    color: #f83821;
  }

  &:active {
    opacity: 0.7;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    opacity: 1;
  }
`

export const GenreGridStyled = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
  margin-top: 30px;
  padding-right: 15px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 18px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
  }
`

export const GenreCardStyled = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;

  .genre-image-container {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    background-color: #282828;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  p {
    color: white;
    font-size: 14px;
    font-weight: 700;
    margin: 0;
    padding-left: 2px;
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.2px;
  }
`

export const TopSongsGridStyled = styled.div`
  display: grid;
  grid-template-rows: repeat(4, auto);
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - 60px) / 3);
  column-gap: 30px;
  row-gap: 0;
  margin-bottom: 40px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  
  /* Hide scrollbar */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  @media (max-width: 1200px) {
    grid-auto-columns: calc((100% - 30px) / 2);
  }

  @media (max-width: 768px) {
    grid-auto-columns: 85%;
    gap: 0 12px;
    margin: 0;
    padding: 0;
    width: 100%;
  }
`;

export const SliderNavBtnStyled = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255, 255, 255, 0.25);

  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.1) 100%);
    border-color: rgba(255, 255, 255, 0.35);
    box-shadow: 0 6px 20px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255, 255, 255, 0.35);
  }

  &.prev { left: -20px; }
  &.next { right: -20px; }

  @media (max-width: 1024px) {
    display: none; /* Hide on tablets/mobile where touch is preferred */
  }
`;

export const SongIndexStyled = styled.div`
  width: 30px;
  color: #b3b2b2;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 15px;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const AlbumsScrollContainerStyled = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding-bottom: 20px;
  margin-top: 15px;

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const AlbumCardStyled = styled.div`
  min-width: 200px;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;

  .album-image-container {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    margin-bottom: 12px;
    overflow: hidden;
    border-radius: 8px;
  }

  .album-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    transition: filter 0.3s ease;
  }

  .play-button-overlay {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 48px;
    height: 48px;
    background: #f83821;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    opacity: 0;
    transform: translateY(8px);
    transition: all 0.3s ease;
    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
    border: none;
    z-index: 5;
  }

  &:hover .play-button-overlay {
    opacity: 1;
    transform: translateY(0);
  }

  &:hover .album-image {
    filter: brightness(0.8);
  }

  .album-title {
    color: white;
    font-size: 15px;
    font-weight: 700;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.2px;
  }

  .album-info-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    color: #b3b3b3;
    font-size: 12px;
    font-weight: 600;
  }

  .explicit-badge {
    background: #b3b3b3;
    color: #121212;
    font-size: 9px;
    font-weight: 800;
    border-radius: 2px;
    padding: 1px 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
`;

export const AlbumViewContainerStyled = styled.div`
  display: flex;
  flex-direction: row;
  gap: 50px;
  margin-top: 20px;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 1200px) {
    gap: 30px;
  }

  @media (max-width: 1024px) {
    flex-direction: column-reverse;
  }
`;

export const AlbumLeftColStyled = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const AlbumRightColStyled = styled.div`
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 25px;
  position: sticky;
  top: 20px;
  height: fit-content;
  
  @media (max-width: 1200px) {
    width: 300px;
  }

  @media (max-width: 1024px) {
    width: 100%;
    align-items: center;
    position: static;
  }

  .big-album-art {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    background-color: #282828;
    object-fit: cover;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.02);
    }
  }
`;

export const AlbumHeaderInfoStyled = styled.div`
  margin-bottom: 35px;
  
  h1 {
    font-family: 'Inter', sans-serif;
    font-size: 56px;
    font-weight: 800;
    margin: 0 0 15px 0;
    color: white;
    letter-spacing: -2px;
    line-height: 1.1;

    @media (max-width: 768px) {
      font-size: 40px;
    }
  }
  
  .album-subinfo {
    font-size: 14px;
    color: #a7a7a7;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;

    .artist-name {
      color: white;
      font-weight: 700;
      cursor: pointer;
      &:hover { text-decoration: underline; }
    }
  }
  
  .album-artist-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }
`;

export const AlbumActionsRowStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 35px;
  position: relative;
  
  @media (max-width: 480px) {
    gap: 16px;
  }
  
  .play-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: #f83821; /* Global Red */
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    font-size: 26px;
    border: none;
    flex-shrink: 0;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(248, 56, 33, 0.3);
    
    &:hover {
      background-color: #ff4a36;
    }
  }
  
  .icon-action {
    color: #a7a7a7;
    font-size: 26px;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    
    &:hover {
      color: white;
      transform: scale(1.1);
    }
  }

  .search-action {
    margin-left: auto;
    color: #b3b3b3;
    font-size: 24px;
    cursor: pointer;
    &:hover { color: white; }
  }
`;

export const AlbumTracklistHeaderStyled = styled.div`
  display: grid;
  grid-template-columns: 46px 1fr 100px 80px;
  padding: 0 0 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  color: #a7a7a7;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 15px;
  letter-spacing: 0.5px;
  
  span:nth-child(1) { text-align: center; }
  span:nth-child(3) { text-align: left; padding-left: 20px; }
  span:last-child { text-align: right; }
`;

export const AlbumTrackRowStyled = styled.div`
  display: grid;
  grid-template-columns: 46px 1fr 100px 80px;
  padding: 10px 0;
  margin: 0 -8px;
  padding-left: 8px;
  padding-right: 8px;
  align-items: center;
  border-radius: 4px;
  transition: background-color 0.2s;
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: rgba(255,255,255,0.1);
  }

  .col-index {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #a7a7a7;
    font-size: 14px;
    font-weight: 400;
  }

  .col-title {
    overflow: hidden;
    p { margin: 0; }
    .song-name {
      font-size: 16px;
      font-weight: 500;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .song-artist {
      font-size: 13px;
      color: #a7a7a7;
      margin-top: 4px;
      font-weight: 400;
    }
  }

  .col-duration {
    text-align: left;
    padding-left: 20px;
    p { margin: 0; font-size: 13px; color: #a7a7a7; }
  }

  .col-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .col-actions {
    opacity: 1;
  }
`;

export const AlbumGenreGridStyled = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  
  .genre-pill {
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.2);
    font-size: 13px;
    color: #b3b3b3;
    background: rgba(255,255,255,0.05);
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;

    &:hover { 
      border-color: white;
      color: white;
      background: rgba(255,255,255,0.1);
    }
  }
`;

export const AlbumFeaturedArtistsStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .artist-row {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    
    &:hover {
      p { text-decoration: underline; }
    }
  }
  
  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: white;
    font-weight: 500;
  }
`;

export const EditPlaylistModalOverlayStyled = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const EditPlaylistModalStyled = styled.div`
  background-color: #282828;
  border-radius: 8px;
  width: 520px;
  max-width: 90vw;
  box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  font-family: inherit;
  overflow: hidden;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    h2 {
      margin: 0;
      color: white;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    button {
      background: none;
      border: none;
      color: #a7a7a7;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: color 0.2s;
      &:hover { color: white; }
    }
  }

  .modal-body {
    display: flex;
    gap: 16px;
    padding: 0 20px 20px 20px;

    .cover-edit-container {
      width: 180px;
      height: 180px;
      background-color: #3e3e3e;
      position: relative;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(0,0,0,0.6);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        opacity: 0;
        transition: opacity 0.2s;
        
        svg { font-size: 40px; margin-bottom: 8px; }
        span { font-size: 15px; font-weight: 500; }
      }

      &:hover .overlay {
        opacity: 1;
      }
    }

    .details-edit-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;

      input {
        background-color: rgba(255,255,255,0.1);
        border: 1px solid transparent;
        padding: 12px 14px;
        color: white;
        font-size: 14px;
        border-radius: 4px;
        font-family: inherit;
        &:focus { 
          background-color: rgba(255,255,255,0.1); 
          outline: none; 
          border-color: #535353; 
        }
      }

      textarea {
        background-color: rgba(255,255,255,0.1);
        border: 1px solid transparent;
        padding: 12px 14px;
        color: white;
        font-size: 14px;
        border-radius: 4px;
        font-family: inherit;
        resize: none;
        flex: 1;
        &:focus { 
          background-color: rgba(255,255,255,0.1); 
          outline: none; 
          border-color: #535353; 
        }
      }
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 20px 20px 20px;
    gap: 16px;

    .disclaimer {
      flex: 1;
      font-size: 11px;
      color: white;
      font-weight: 700;
      margin: 0;
    }

    button {
      background-color: white;
      color: black;
      border: none;
      padding: 12px 32px;
      border-radius: 24px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.1s;
      &:hover { transform: scale(1.05); }
      &:active { transform: scale(0.95); }
    }
  }
`;

export const ArtistProfileContainerStyled = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  width: 100%;
`

export const ArtistBannerStyled = styled.div`
  height: 70vh;
  min-height: 550px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 80px 40px;
  background-image: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.8)), url(${props => props.$image});
  background-size: cover;
  background-position: center 15%;
  border-radius: 0;
  margin-bottom: 40px;

  h1 {
    font-size: 80px;
    font-weight: 800;
    margin: 0;
    letter-spacing: -2px;
    text-shadow: 0 4px 10px rgba(0,0,0,0.5);
  }

  @media (max-width: 768px) {
    h1 { font-size: 48px; }
    padding: 20px;
  }
`

export const ArtistStatsStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 5px;
  
  .verified-icon {
    color: #3d91ff;
    display: flex;
    align-items: center;
  }
`

export const ArtistActionsStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 40px;
  margin-bottom: 30px;

  .play-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #f83821;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: black;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);
      background: #1fdf64;
    }
  }

  .follow-btn {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    padding: 8px 24px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 1px;

    &:hover {
      border-color: white;
      transform: scale(1.02);
    }
  }

  .more-btn {
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.6);
    font-size: 28px;
    cursor: pointer;

    &:hover {
      color: white;
    }
  }

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`

export const ArtistProfileTabsStyled = styled.div`
  display: flex;
  gap: 32px;
  padding: 0 40px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 30px;

  button {
    background: none;
    border: none;
    color: rgba(255,255,255,0.6);
    font-weight: 700;
    font-size: 14px;
    padding-bottom: 12px;
    cursor: pointer;
    position: relative;
    transition: color 0.2s;

    &:hover {
      color: white;
    }

    &.active {
      color: white;
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 3px;
        background: #f83821;
        border-radius: 2px;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 0 20px;
    gap: 20px;
    overflow-x: auto;
    button { font-size: 13px; }
  }
`

export const ArtistSectionStyled = styled.section`
  padding: 0 40px;
  margin-bottom: 40px;

  h2 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .album-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 24px;
  }

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

export const SongMenuStyled = styled.div`
  position: absolute;
  right: 20px;
  top: 50px;
  background: #181818;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 8px;
  z-index: 1000;
  box-shadow: 0 8px 16px rgba(0,0,0,0.5);
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  button {
    background: none;
    border: none;
    color: #e0e0e0;
    padding: 10px 12px;
    border-radius: 4px;
    text-align: left;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.2s ease;
    width: 100%;

    &:hover {
      background: rgba(255,255,255,0.1);
    }

    &.delete {
      color: #ff4d4d;
      &:hover {
        background: rgba(255,77,77,0.1);
      }
    }

    svg {
      font-size: 18px;
    }
  }
`;
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AudioPlayerContainerStyled, AudioPlayerWrapperStyled, ActiveSongWrapperStyled, ActiveSongImageContainerStyled, ActiveSongDetailsStyled, ActiveSongLikeButtonStyled, ActionGroupStyled, PlaybackControlsGroupStyled, CenterGroupStyled, IdentityGroupStyled, MobileProgressBarContainerStyled, MobileTimerStyled, AmbientAuraStyled, ExpandedPlayerContainerStyled, ExpandedHeaderStyled, ExpandedAlbumArtStyled, ExpandedDetailsStyled, ExpandedProgressStyled, ExpandedControlsStyled, ExpandedFooterStyled, ExpandedContentWrapperStyled, ExpandedRightSectionStyled } from "./audioPlayer.styled";
import { AudioPlayerDefaultStyled } from "./audioPlayerDefault.styled";
import { AudioControlsContainerStyled, MainPlayButtonStyled, ControlIconStyled, VolumeControlContainerStyled, VolumeControlBarStyled, VolumeChangeStyled, SongSliderContainerStyled, ProgressBarContainerStyled, ProgressBarStyled } from "./audioControls.styled";
import { IoPlay, IoPause, IoShuffleOutline, IoShuffle, IoRepeatOutline, IoRepeat, IoChevronDown, IoShareOutline } from "react-icons/io5";
import { BiSkipNext, BiSkipPrevious } from "react-icons/bi";
import { MdFavorite, MdFavoriteBorder, MdFormatListBulleted, MdVolumeUp, MdVolumeMute, MdAddCircleOutline, MdOpenInFull } from "react-icons/md";

export default function AudioPlayer({
    pickedSong,
    isPlaying,
    setIsPlaying,
    isSongFavorite,
    onToggleFavorite,
    onNext,
    onPrevious,
    isShuffle,
    setIsShuffle,
    isRepeat,
    setIsRepeat
}) {

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [audioMetaData, setAudioMetaData] = useState(false);
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [isMuted, setIsMuted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [previousVolume, setPreviousVolume] = useState(0.5);
    const [isDraggingVolume, setIsDraggingVolume] = useState(false);
    const [isDraggingProgress, setIsDraggingProgress] = useState(false);
    const audioRef = useRef(null);
    const progressBarRef = useRef(null);
    const mobileProgressBarRef = useRef(null);
    const songBarRef = useRef(null);
    const mobileSongBarRef = useRef(null);
    const volumeControlBarRef = useRef(null);
    const volumeChangeRef = useRef(null);

    useEffect(() => {
        if (audioRef.current && pickedSong) {
            const audioUrl = pickedSong.audioFile || pickedSong.audioUrl;
            if (audioUrl) {
                audioRef.current.src = audioUrl;
                audioRef.current.load();
                if (isPlaying) {
                    audioRef.current.play().catch(err => console.error('Audio play error:', err));
                }
            }
            setIsExpanded(true);
        }
    }, [pickedSong]);

    useEffect(() => {
        if (audioRef.current && pickedSong) {
            if (isPlaying) {
                audioRef.current.play().catch(err => console.error('Audio play error:', err));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    // Scroll wheel volume control
    useEffect(() => {
        const handleWheel = (e) => {
            if (volumeControlBarRef.current && volumeControlBarRef.current.contains(e.target)) {
                e.preventDefault();
                const currentVolume = audioRef.current.volume;
                const currentVisualVolume = Math.sqrt(currentVolume);
                const scrollDirection = e.deltaY > 0 ? -0.1 : 0.1;
                const newVisualVolume = Math.max(0, Math.min(1, currentVisualVolume + scrollDirection));

                audioRef.current.volume = newVisualVolume * newVisualVolume;
                volumeChangeRef.current.style.width = `${newVisualVolume * 100}%`;

                if (newVisualVolume > 0 && isMuted) {
                    setIsMuted(false);
                }
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [isMuted]);

    // Spacebar play/pause shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                const active = document.activeElement;
                if (
                    active &&
                    (active.tagName === 'INPUT' ||
                     active.tagName === 'TEXTAREA' ||
                     active.isContentEditable)
                ) {
                    return;
                }
                if (pickedSong) {
                    e.preventDefault();
                    setIsPlaying(prev => !prev);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pickedSong]);

    const handlePlayPause = () => {
        setIsPlaying(prev => !prev);
    }
    const handleNext = () => {
        if (onNext) onNext();
    }
    const handlePrevious = () => {
        if (onPrevious) onPrevious();
    }

    const handleMetaDataLoad = () => {
        setAudioMetaData(true);
        const totalSeconds = Math.floor(audioRef.current.duration)
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setDuration({ minutes, seconds });
    }

    const handleTimeUpdate = () => {
        const currentSeconds = Math.floor(audioRef.current.currentTime);
        const minutes = Math.floor(currentSeconds / 60);
        const seconds = currentSeconds % 60;
        const progressBarWidth = (audioRef.current.currentTime / audioRef.current.duration) * 100;

        if (progressBarRef.current) {
            progressBarRef.current.style.width = `${progressBarWidth}%`;
        }
        if (mobileProgressBarRef.current) {
            mobileProgressBarRef.current.style.width = `${progressBarWidth}%`;
        }

        setCurrentTime({ minutes, seconds });
    }

    const handleProgressBarClick = (e) => {
        handleProgressBarUpdate(e);
    }

    const handleVolumeChange = (e) => {
        if (!volumeControlBarRef.current) return;
        const rect = volumeControlBarRef.current.getBoundingClientRect();
        const volumeClickPosition = e.pageX - rect.left;
        const volumeChangeInPercentage = Math.max(0, Math.min(100, (volumeClickPosition / rect.width) * 100));
        const visualVolume = 0.01 * volumeChangeInPercentage;

        const actualVolume = visualVolume * visualVolume;

        audioRef.current.volume = actualVolume;
        if (volumeChangeRef.current) {
            volumeChangeRef.current.style.width = `${volumeChangeInPercentage}%`;
        }
        if (actualVolume > 0 && isMuted) {
            setIsMuted(false);
        }
    }

    const handleVolumeScroll = (e) => {
        if (!audioRef.current) return;

        const volumeStep = 0.05;
        const change = e.deltaY > 0 ? -volumeStep : volumeStep;

        const currentVisualVolume = Math.sqrt(audioRef.current.volume);
        const newVisualVolume = Math.max(0, Math.min(1, currentVisualVolume + change));
        const actualVolume = newVisualVolume * newVisualVolume;

        audioRef.current.volume = actualVolume;

        if (volumeChangeRef.current) {
            volumeChangeRef.current.style.width = `${newVisualVolume * 100}%`;
        }

        if (actualVolume > 0 && isMuted) {
            setIsMuted(false);
        }
    }

    const handleMuteToggle = () => {
        if (isMuted) {
            audioRef.current.volume = previousVolume;
            const visualVolume = Math.sqrt(previousVolume);
            volumeChangeRef.current.style.width = `${visualVolume * 100}%`;
            setIsMuted(false);
        } else {
            setPreviousVolume(audioRef.current.volume);
            audioRef.current.volume = 0;
            volumeChangeRef.current.style.width = '0%';
            setIsMuted(true);
        }
    }

    const handleProgressBarUpdate = (e, customRef) => {
        const targetRef = customRef?.current ? customRef : (songBarRef.current ? songBarRef : mobileSongBarRef);
        if (!targetRef.current || !audioRef.current) return;

        const rect = targetRef.current.getBoundingClientRect();
        const clickPosition = e.pageX - rect.left;
        const clickPositionInPercent = Math.max(0, Math.min(100, (clickPosition / rect.width) * 100));
        const clickTimeInSeconds = (audioRef.current.duration / 100) * clickPositionInPercent;

        audioRef.current.currentTime = clickTimeInSeconds;
        handleTimeUpdate();
    }

    useEffect(() => {
        const handleMove = (e) => {
            if (isDraggingVolume) {
                const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
                handleVolumeChange({ pageX: clientX });
            }
            if (isDraggingProgress) {
                const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
                handleProgressBarUpdate({ pageX: clientX }, mobileSongBarRef);
            }
        };

        const handleEnd = () => {
            setIsDraggingVolume(false);
            setIsDraggingProgress(false);
            document.body.style.userSelect = 'auto';
            document.body.style.cursor = 'default';
        };

        if (isDraggingVolume || isDraggingProgress) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'grabbing';
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDraggingVolume, isDraggingProgress]);


    return (
        <>
            {createPortal(
                <AmbientAuraStyled $image={pickedSong?.songImage} $isVisible={true} />,
                document.body
            )}

            {!pickedSong ? null : (
                <>
                    {createPortal(
                        <AudioPlayerContainerStyled $isHidden={isExpanded}>
                            <AudioPlayerWrapperStyled>
                                <audio
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleMetaDataLoad}
                                    onEnded={() => {
                                        if (!isRepeat) {
                                            if (onNext) {
                                                handleNext();
                                            } else {
                                                setIsPlaying(false);
                                            }
                                        }
                                    }}
                                    loop={isRepeat}
                                    style={{ display: "none" }}
                                    ref={audioRef}
                                ></audio>

                                {/* Mobile Top Progress Bar */}
                                <MobileProgressBarContainerStyled 
                                    ref={mobileSongBarRef} 
                                    onMouseDown={(e) => { setIsDraggingProgress(true); handleProgressBarUpdate(e, mobileSongBarRef); }}
                                    onTouchStart={(e) => { 
                                        setIsDraggingProgress(true); 
                                        const clientX = e.touches[0].clientX;
                                        handleProgressBarUpdate({ pageX: clientX }, mobileSongBarRef); 
                                    }}
                                >
                                    <ProgressBarStyled ref={mobileProgressBarRef} $isDragging={isDraggingProgress}></ProgressBarStyled>
                                </MobileProgressBarContainerStyled>

                                {/* 1. Song Identity (Pinned Left) */}
                                <IdentityGroupStyled onClick={() => window.innerWidth <= 480 && setIsExpanded(true)}>
                                    <ActiveSongWrapperStyled>
                                        <ActiveSongImageContainerStyled>
                                            <img src={pickedSong.songImage} alt="albumImage" />
                                        </ActiveSongImageContainerStyled>
                                        <ActiveSongDetailsStyled $shouldScroll={pickedSong.songName?.length > 20}>
                                            <p><span>{pickedSong.songName}</span></p>
                                            <p>{pickedSong.artist}</p>
                                            {pickedSong.album && <p className="album-name">{pickedSong.album}</p>}
                                        </ActiveSongDetailsStyled>
                                    </ActiveSongWrapperStyled>
                                </IdentityGroupStyled>

                                {/* 2. Center Group (Seeker & Volume) */}
                                <CenterGroupStyled>
                                    {/* Desktop Progress Bar */}
                                    <SongSliderContainerStyled className="desktop-only">
                                        {audioMetaData && (
                                            <>
                                                <p className="current-time">{currentTime.minutes}:{currentTime.seconds < 10 ? '0' : ''}{currentTime.seconds}</p>
                                                <ProgressBarContainerStyled
                                                    ref={songBarRef}
                                                    onMouseDown={(e) => { setIsDraggingProgress(true); handleProgressBarUpdate(e); }}
                                                >
                                                    <ProgressBarStyled ref={progressBarRef} $isDragging={isDraggingProgress}></ProgressBarStyled>
                                                </ProgressBarContainerStyled>
                                                <p className="duration-text">{duration.minutes}:{duration.seconds < 10 ? '0' : ''}{duration.seconds}</p>
                                            </>
                                        )}
                                    </SongSliderContainerStyled>

                                    <VolumeControlContainerStyled onWheel={handleVolumeScroll}>
                                        <span className="react-icon" onClick={handleMuteToggle}>
                                            {isMuted ? <MdVolumeMute /> : <MdVolumeUp />}
                                        </span>
                                        <VolumeControlBarStyled
                                            $volumePercent={audioRef.current?.volume ? Math.sqrt(audioRef.current.volume) * 100 : 50}
                                            ref={volumeControlBarRef}
                                            onMouseDown={(e) => { setIsDraggingVolume(true); handleVolumeChange(e); }}
                                            $isDragging={isDraggingVolume}
                                        >
                                            <VolumeChangeStyled ref={volumeChangeRef} $isDragging={isDraggingVolume}></VolumeChangeStyled>
                                        </VolumeControlBarStyled>
                                    </VolumeControlContainerStyled>
                                </CenterGroupStyled>

                                {/* 3. Playback Controls */}
                                <PlaybackControlsGroupStyled>
                                    <MainPlayButtonStyled onClick={handlePlayPause}>
                                        {isPlaying ? <IoPause /> : <IoPlay style={{ paddingLeft: '2px' }} />}
                                    </MainPlayButtonStyled>

                                    <ControlIconStyled className="prev-next" onClick={handlePrevious}>
                                        <BiSkipPrevious />
                                    </ControlIconStyled>
                                    <ControlIconStyled className="prev-next" onClick={handleNext}>
                                        <BiSkipNext />
                                    </ControlIconStyled>

                                    {/* Mobile Only Timer */}
                                    <MobileTimerStyled>
                                        {currentTime.minutes}:{currentTime.seconds < 10 ? '0' : ''}{currentTime.seconds} / {duration.minutes}:{duration.seconds < 10 ? '0' : ''}{duration.seconds}
                                    </MobileTimerStyled>

                                    <span
                                        style={{ padding: '8px', cursor: 'pointer', display: 'flex' }}
                                        onClick={(e) => { e.stopPropagation(); setIsShuffle(!isShuffle); }}
                                    >
                                        {isShuffle ?
                                            <IoShuffle className="active" size={20} /> :
                                            <IoShuffleOutline size={20} />
                                        }
                                    </span>
                                    <span
                                        style={{ padding: '8px', cursor: 'pointer', display: 'flex' }}
                                        onClick={(e) => { e.stopPropagation(); setIsRepeat(!isRepeat); }}
                                    >
                                        {isRepeat ?
                                            <IoRepeat className="active" size={20} /> :
                                            <IoRepeatOutline size={20} />
                                        }
                                    </span>
                                </PlaybackControlsGroupStyled>

                                {/* 4. Action Icons */}
                                <ActionGroupStyled>
                                    {onToggleFavorite && (
                                        <ActiveSongLikeButtonStyled onClick={onToggleFavorite} $isFavorite={isSongFavorite}>
                                            {isSongFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
                                        </ActiveSongLikeButtonStyled>
                                    )}
                                    <span><MdAddCircleOutline /></span>

                                    <span 
                                        style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', marginLeft: '10px', paddingLeft: '15px', cursor: 'pointer' }}
                                        onClick={() => setIsExpanded(true)}
                                    >
                                        <MdOpenInFull />
                                    </span>
                                </ActionGroupStyled>
                            </AudioPlayerWrapperStyled>
                        </AudioPlayerContainerStyled>,
                        document.body
                    )}

                    {createPortal(
                        <ExpandedPlayerContainerStyled $isExpanded={isExpanded} $image={pickedSong?.songImage}>
                            <ExpandedHeaderStyled>
                                <span onClick={() => setIsExpanded(false)}><IoChevronDown /></span>
                                <p>Now Playing</p>
                                <div className="header-actions">
                                    <span><IoShareOutline /></span>
                                </div>
                            </ExpandedHeaderStyled>

                            <ExpandedContentWrapperStyled>
                                <ExpandedAlbumArtStyled>
                                    <img src={pickedSong.songImage} alt="album art" />
                                </ExpandedAlbumArtStyled>

                                <ExpandedRightSectionStyled>
                                    <ExpandedDetailsStyled>
                                        <div className="title-area">
                                            <h2>{pickedSong.songName}</h2>
                                            <p>{pickedSong.artist}</p>
                                        </div>
                                        {onToggleFavorite && (
                                            <span className="like-btn" onClick={onToggleFavorite} style={{ color: isSongFavorite ? '#f83821' : 'white' }}>
                                                {isSongFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
                                            </span>
                                        )}
                                    </ExpandedDetailsStyled>

                                    <ExpandedProgressStyled>
                                        <ProgressBarContainerStyled
                                            ref={mobileSongBarRef}
                                            onMouseDown={(e) => { setIsDraggingProgress(true); handleProgressBarUpdate(e, mobileSongBarRef); }}
                                            onTouchStart={(e) => { 
                                                setIsDraggingProgress(true); 
                                                const clientX = e.touches[0].clientX;
                                                handleProgressBarUpdate({ pageX: clientX }, mobileSongBarRef); 
                                            }}
                                        >
                                            <ProgressBarStyled ref={mobileProgressBarRef} $isDragging={isDraggingProgress}></ProgressBarStyled>
                                        </ProgressBarContainerStyled>
                                        <div className="time-info">
                                            <span>{currentTime.minutes}:{currentTime.seconds < 10 ? '0' : ''}{currentTime.seconds}</span>
                                            <span>{duration.minutes}:{duration.seconds < 10 ? '0' : ''}{duration.seconds}</span>
                                        </div>
                                    </ExpandedProgressStyled>

                                    <ExpandedControlsStyled>
                                        <span className={`secondary-btn ${isShuffle ? 'active' : ''}`} onClick={() => setIsShuffle(!isShuffle)}>
                                            {isShuffle ? <IoShuffle /> : <IoShuffleOutline />}
                                        </span>
                                        
                                        <div className="main-controls">
                                            <span className="nav-btn" onClick={handlePrevious}><BiSkipPrevious /></span>
                                            <span className="play-pause" onClick={handlePlayPause}>
                                                {isPlaying ? <IoPause /> : <IoPlay style={{ paddingLeft: '4px' }} />}
                                            </span>
                                            <span className="nav-btn" onClick={handleNext}><BiSkipNext /></span>
                                        </div>

                                        <span className={`secondary-btn ${isRepeat ? 'active' : ''}`} onClick={() => setIsRepeat(!isRepeat)}>
                                            {isRepeat ? <IoRepeat /> : <IoRepeatOutline />}
                                        </span>
                                    </ExpandedControlsStyled>
                                </ExpandedRightSectionStyled>
                            </ExpandedContentWrapperStyled>

                            <ExpandedFooterStyled>
                                <span><MdFormatListBulleted /></span>
                            </ExpandedFooterStyled>
                        </ExpandedPlayerContainerStyled>,
                        document.body
                    )}
                </>
            )}
        </>
    );
}
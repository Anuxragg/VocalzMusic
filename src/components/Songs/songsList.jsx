/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useMemo } from 'react'
import defaultArtistImg from '../../media/voj.jpg';
import oldBollywoodImg from '../../media/old_bollywood.png';
import gazalImg from '../../media/gazal.png';
import Skeleton from '../Feedback/Skeleton';
import AudioPlayer from '../Audio-Player/audioPlayer';
import api from '../../services/api';
import {
    SongsListWrapperStyled, SongContainerStyled, SongDetailsContainerStyled, SongDurationContainerStyled, SongImgContainerStyled,
    SongNameArtistStyled, LikeButtonStyled, ViewHeadingStyled, GenreGridStyled, GenreCardStyled,
    TopSongsGridStyled, AlbumsScrollContainerStyled, AlbumCardStyled, SongIndexStyled,
    AlbumViewContainerStyled, AlbumLeftColStyled, AlbumRightColStyled, AlbumHeaderInfoStyled,
    AlbumActionsRowStyled, AlbumTracklistHeaderStyled, AlbumTrackRowStyled, AlbumGenreGridStyled, AlbumFeaturedArtistsStyled,
    ArtistProfileContainerStyled, ArtistBannerStyled, ArtistStatsStyled, ArtistActionsStyled, ArtistProfileTabsStyled, ArtistSectionStyled,
    EditPlaylistModalOverlayStyled, EditPlaylistModalStyled, SkeletonBox, SongMenuStyled,
    SliderNavBtnStyled, HomeHeaderRowStyled, SectionTitleWrapperStyled, NewPlaylistBtnStyled
} from './songsList.styled';
import { 
    MdPlaylistAdd, MdFavorite, MdFavoriteBorder, MdMoreHoriz, MdSearch, MdClose, 
    MdCloudUpload, MdArrowBack, MdExpandMore, MdExpandLess, MdDelete, MdEdit, MdMusicNote, MdRecordVoiceOver, MdPlayArrow, MdOutlineFileDownload, MdShuffle, MdLoop, MdVolumeUp, MdVolumeMute, MdPlaylistPlay, MdDevices, MdQueueMusic, MdOpenInFull, MdModeEdit, MdImage, MdOutlineFileUpload, MdAdd, MdAlbum, MdAddCircleOutline, MdChevronRight 
} from 'react-icons/md';
import { IoPlay, IoPause, IoShuffleOutline, IoRepeatOutline, IoArrowBack, IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { FiShare } from "react-icons/fi";
import { GiLovers, GiBoombox, GiViolin, GiCarKey } from 'react-icons/gi';
import UploadSongs from './upload';
import Toast from '../Feedback/Toast';
import Loader from '../Feedback/Loader';

export default function SongsList({ user, favorites, setFavorites, currentView, setCurrentView, searchResults, onSearch }) {
    const formatTime = (seconds) => {
        const total = Math.floor(Number(seconds || 0));
        if (total === 0) return '0:00';
        const mins = Math.floor(total / 60);
        const secs = (total % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const [clickedSong, setClickedSong] = useState(null);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [recentHistory, setRecentHistory] = useState(() => {
        try { return JSON.parse(localStorage.getItem('vocalz_history')) || []; }
        catch { return []; }
    });
    const [playingPlaylist, setPlayingPlaylist] = useState([]);
    const [isPlaying, setIsPlaying] = useState(true);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [liveSongs, setLiveSongs] = useState([]);
    const [shuffledHomeSongs, setShuffledHomeSongs] = useState([]);
    const [registeredAlbums, setRegisteredAlbums] = useState([]);
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [isLocalSearchOpen, setIsLocalSearchOpen] = useState(false);
    const [allArtists, setAllArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSong, setEditingSong] = useState(null);
    const [isAddingToAlbum, setIsAddingToAlbum] = useState(null); // stores album name
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [addingSongToPlaylist, setAddingSongToPlaylist] = useState(null);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistCover, setNewPlaylistCover] = useState(null);
    const [newPlaylistPreview, setNewPlaylistPreview] = useState(null);
    const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);
    const [editPlaylistName, setEditPlaylistName] = useState('');
    const [editPlaylistCover, setEditPlaylistCover] = useState(null);
    const [editPlaylistPreview, setEditPlaylistPreview] = useState(null);
    const [editPlaylistDescription, setEditPlaylistDescription] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);
    const [globalLoading, setGlobalLoading] = useState(null); // stores message
    const [toast, setToast] = useState(null); // { message, type }
    const [showAllArtistSongs, setShowAllArtistSongs] = useState(false);
    const [menuSongId, setMenuSongId] = useState(null);
    const topSongsRef = useRef(null);

    const randomAlbums = useMemo(() => {
        const uniqueAlbums = Array.from(new Set(liveSongs.map(s => s.albumText).filter(Boolean)));
        return uniqueAlbums.sort(() => 0.5 - Math.random());
    }, [liveSongs]);

    const halfLength = Math.ceil(randomAlbums.length / 2);
    const row1Albums = randomAlbums.slice(0, halfLength);
    const row2Albums = randomAlbums.slice(halfLength);

    const handleScroll = (direction) => {
        if (topSongsRef.current) {
            const scrollAmount = topSongsRef.current.offsetWidth * 0.8;
            topSongsRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = () => setMenuSongId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const notify = (message, type = 'success') => {
        setToast({ message, type });
    };

    const genres = [
        { name: 'Pop', image: '/media/genres/pop.png', bgColor: '#FF0080' },
        { name: 'Bollywood', image: '/media/genres/bollywood.png', bgColor: '#F9D423' },
        { name: 'Romance', image: '/media/genres/romance.png', bgColor: '#ee0979' },
        { name: 'Sad', image: '/media/genres/genre_sad.png', bgColor: '#4b6cb7' },
        { name: 'Hip-Hop', image: '/media/genres/hiphop.png', bgColor: '#11998e' },
        { name: 'Rock', image: '/media/genres/rock.png', bgColor: '#8e9eab' },
        { name: 'Rap', image: '/media/genres/rap.png', bgColor: '#00c6ff' },
        { name: 'Phonk', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80' },
        { name: 'Old Bollywood', image: oldBollywoodImg },
        { name: 'Gazal', image: gazalImg }
    ];

    useEffect(() => {
        fetchSongs();
        fetchLibraryData();
    }, []);

    const fetchSongs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/songs?limit=1000');
            if (res.data?.success) {
                const normalized = res.data.data.map(song => ({
                    id: song._id,
                    songName: song.title,
                    artist: song.artist,
                    albumText: song.albumText || '',
                    genre: song.genre || 'Other',
                    duration: song.durationFormatted || formatTime(song.duration),
                    songImage: song.coverUrl || '/m-app-logo.png',
                    audioUrl: song.audioUrl
                }));
                setLiveSongs(normalized);
                
                // Fisher-Yates shuffle for better randomness
                const shuffleArray = (array) => {
                    const shuffled = [...array];
                    for (let i = shuffled.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                    }
                    return shuffled;
                };
                
                setShuffledHomeSongs(shuffleArray(normalized).slice(0, 50));
            }
        } catch (err) {
            console.error("Error fetching live library", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLibraryData = async () => {
        try {
            const [plRes, albRes, artRes] = await Promise.all([
                api.get('/playlists/me').catch(() => ({ data: { success: false } })),
                api.get('/albums').catch(() => ({ data: { success: false } })),
                api.get('/artists').catch(() => ({ data: { success: false } }))
            ]);
            if (plRes.data?.success) setUserPlaylists(plRes.data.data);
            if (albRes.data?.success) setRegisteredAlbums(albRes.data.data);
            if (artRes.data?.success) setAllArtists(artRes.data.data);
        } catch (err) {
            console.error("Error fetching library data", err);
        }
    };

    const handleUpdateArtistAvatar = async (artistId, artistName, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            setGlobalLoading(`Updating photo for ${artistName}...`);
            const endpoint = artistId
                ? `/artists/${artistId}`
                : `/artists/name/${encodeURIComponent(artistName)}`;

            const res = await api.patch(endpoint, formData);

            if (res.data?.success) {
                notify(`Success! Photo updated for ${artistName}.`);
                fetchLibraryData();
            }
        } catch (err) {
            console.error('Error updating artist photo', err);
            notify('Failed to update artist photo. Admins only.', 'error');
        } finally {
            setGlobalLoading(null);
        }
    }

    const handleDeleteSong = async (songId) => {
        setGlobalLoading("Deleting track...");
        try {
            const res = await api.delete(`/songs/${songId}`);
            if (res.data?.success) {
                notify("Track deleted successfully!");
                setEditingSong(null);
                fetchLibraryData();
            }
        } catch (err) {
            console.error("Error deleting song", err);
            notify("Failed to delete track. Admins only.", "error");
        } finally {
            setGlobalLoading(null);
        }
    };

    const renderSongMenu = (song) => {
        if (menuSongId !== song.id) return null;
        const favorite = isFavorite(song.id);
        
        return (
            <SongMenuStyled onClick={(e) => e.stopPropagation()}>
                <button onClick={(e) => { 
                    handleLikeClick(e, song.id); 
                    setMenuSongId(null); 
                }}>
                    {favorite ? <MdFavorite style={{ color: '#f83821' }} /> : <MdFavoriteBorder />} 
                    {favorite ? 'Remove from Liked' : 'Save to Liked Songs'}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setAddingSongToPlaylist(song); setMenuSongId(null); }}>
                    <MdPlaylistAdd /> Add to collection
                </button>
                {isOwner(song) && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); setEditingSong(song); setMenuSongId(null); }}>
                            <MdEdit /> Edit Song
                        </button>
                        <button className="delete" onClick={(e) => { 
                            e.stopPropagation(); 
                            if (window.confirm("Are you sure you want to delete this track permanently?")) {
                                handleDeleteSong(song.id);
                            }
                            setMenuSongId(null);
                        }}>
                            <MdDelete /> Delete Track
                        </button>
                    </>
                )}
            </SongMenuStyled>
        );
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;
        setSaveLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', newPlaylistName);
            formData.append('description', newPlaylistDescription);
            if (newPlaylistCover) formData.append('cover', newPlaylistCover);

            const res = await api.post('/playlists', formData);
            if (res.data?.success) {
                setUserPlaylists([...userPlaylists, res.data.data]);
                setIsCreatingPlaylist(false);
                setNewPlaylistName('');
                setNewPlaylistDescription('');
                setNewPlaylistCover(null);
                setNewPlaylistPreview(null);
                notify("Collection created successfully!");
            }
        } catch (err) {
            console.error("Error creating playlist", err);
            notify("Failed to create collection. Please try again.", 'error');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleAddSongToPlaylist = async (playlistId, songId) => {
        if (!playlistId || !songId) return;
        try {
            const res = await api.post(`/playlists/${playlistId}/songs`, { songId });
            if (res.data?.success) {
                setUserPlaylists(prev => prev.map(pl =>
                    pl._id === playlistId ? { ...pl, songs: [...(pl.songs || []), { song: songId }] } : pl
                ));
                if (selectedPlaylist && selectedPlaylist._id === playlistId) {
                    setSelectedPlaylist(prev => ({ ...prev, songs: [...(prev.songs || []), { song: songId }] }));
                }
                notify(`Added to playlist!`);
                setAddingSongToPlaylist(null);
            }
        } catch (err) {
            console.error("Error adding song to playlist", err);
            notify("Could not add to playlist. Please try again.", 'error');
        }
    };

    useEffect(() => {
        if (currentView !== 'Artists' && currentView !== 'Album') {
            setSelectedArtist(null);
            setSelectedAlbum(null);
        }
        if (currentView !== 'Discover') setSelectedGenre(null);
        if (currentView !== 'Playlists' && currentView !== 'Playlist') {
            setSelectedPlaylist(null);
        }
        setEditingSong(null);
        setIsAddingToAlbum(null);
        setShowAllArtistSongs(false);
    }, [currentView, selectedArtist]);

    const handleSongClick = (song, contextPlaylist) => {
        setClickedSong(song);
        if (contextPlaylist) setPlayingPlaylist(contextPlaylist);
        setIsPlaying(true);
        setRecentHistory(prev => {
            const newHist = [song.id, ...prev.filter(id => id !== song.id)].slice(0, 50);
            localStorage.setItem('vocalz_history', JSON.stringify(newHist));
            return newHist;
        });
    }

    const handleLikeClick = async (e, songId) => {
        e.stopPropagation();
        setFavorites(prevFavorites => {
            const strId = String(songId);
            return prevFavorites.includes(strId) ? prevFavorites.filter(id => id !== strId) : [...prevFavorites, strId];
        });
        try {
            await api.post(`/users/me/likes/${songId}`);
        } catch (error) { console.error(error); }
    }

    const isFavorite = (id) => favorites.includes(String(id));

    const isOwner = (song) => {
        if (!user) return false;
        return user.role === 'admin';
    }

    const handleDeleteClick = async (e, songId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this track permanently?')) {
            try {
                const res = await api.delete(`/songs/${songId}`);
                if (res.data.success) {
                    setLiveSongs(prev => prev.filter(s => s.id !== songId));
                    notify('Track deleted successfully');
                }
            } catch (err) {
                console.error(err);
                notify('Failed to delete song', 'error');
            }
        }
    }

    const handleDeleteAlbumFully = async () => {
        if (!selectedAlbum) return;
        if (!window.confirm(`Are you sure you want to delete the entire album "${selectedAlbum}" and ALL its songs? This cannot be undone.`)) return;

        setGlobalLoading('Deleting album and all its songs...');
        try {
            const songsToDelete = liveSongs.filter(s => s.albumText === selectedAlbum);
            for (const song of songsToDelete) {
                await api.delete(`/songs/${song.id}`);
            }

            const actualAlbum = registeredAlbums.find(a => a.title === selectedAlbum);
            if (actualAlbum) {
                await api.delete(`/albums/${actualAlbum._id}`);
            }

            notify(`Album "${selectedAlbum}" deleted successfully!`);
            
            setLiveSongs(prev => prev.filter(s => s.albumText !== selectedAlbum));
            setRegisteredAlbums(prev => prev.filter(a => a.title !== selectedAlbum));
            setSelectedAlbum(null);
            setCurrentView('Home');
        } catch (err) {
            console.error('Failed to delete album completely:', err);
            notify('Failed to delete album.', 'error');
        } finally {
            setGlobalLoading(null);
        }
    };

    const handleEditClick = (e, song) => {
        e.stopPropagation();
        setEditingSong(song);
    }

    const handleMoveToAlbum = async (e, songId, albumName) => {
        e.stopPropagation();
        try {
            const res = await api.put(`/songs/${songId}`, { albumText: albumName });
            if (res.data.success) {
                setLiveSongs(prev => prev.map(s => s.id === songId ? { ...s, albumText: albumName } : s));
                notify(`Added to ${albumName}!`);
            }
        } catch (err) { console.error(err); }
    }

    const handleRemoveFromAlbum = async (e, songId) => {
        e.stopPropagation();
        try {
            const res = await api.put(`/songs/${songId}`, { albumText: '' });
            if (res.data.success) {
                setLiveSongs(prev => prev.map(s => s.id === songId ? { ...s, albumText: '' } : s));
                notify("Removed from album");
            }
        } catch (err) { console.error(err); }
    }

    const handleRemoveFromPlaylist = async (e, songId) => {
        e.stopPropagation();
        if (!selectedPlaylist) return;
        try {
            const res = await api.delete(`/playlists/${selectedPlaylist._id}/songs/${songId}`);
            if (res.data.success) {
                const updatedPlaylist = { ...selectedPlaylist };
                updatedPlaylist.songs = updatedPlaylist.songs.filter(ps => {
                    const id = typeof ps.song === 'object' ? ps.song._id : ps.song;
                    return String(id) !== String(songId);
                });
                setSelectedPlaylist(updatedPlaylist);
                setUserPlaylists(prev => prev.map(p => p._id === selectedPlaylist._id ? updatedPlaylist : p));
                notify("Removed from collection");
            }
        } catch (err) {
            console.error(err);
            notify('Could not remove. Please try again.', 'error');
        }
    }

    const [addingSearch, setAddingSearch] = useState('');

    const handleRenameCollection = (oldName) => {
        if (currentView === 'Playlist' && selectedPlaylist) {
            setEditPlaylistName(selectedPlaylist.name);
            setEditPlaylistPreview(selectedPlaylist.coverUrl || null);
            setEditPlaylistCover(null);
            setIsEditingPlaylist(true);
        } else {
            const newName = window.prompt(`Enter new ${currentView.toLowerCase()} name:`, oldName);
            if (newName && newName !== oldName) {
                api.put('/songs/rename-album/bulk', { oldName, newName })
                    .then(res => {
                        if (res.data.success) {
                            setLiveSongs(prev => prev.map(s => s.albumText === oldName ? { ...s, albumText: newName } : s));
                            setSelectedAlbum(newName);
                            notify("Renamed successfully!");
                        }
                    }).catch(console.error);
            }
        }
    }

    const handleSavePlaylistEdit = async () => {
        if (!editPlaylistName.trim()) return;
        setSaveLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', editPlaylistName);
            formData.append('description', editPlaylistDescription || '');
            if (editPlaylistCover) formData.append('cover', editPlaylistCover);
            const res = await api.patch(`/playlists/${selectedPlaylist._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data?.success) {
                const updated = res.data.data;
                setSelectedPlaylist(updated);
                setUserPlaylists(prev => prev.map(p => p._id === updated._id ? updated : p));
                setIsEditingPlaylist(false);
                notify("Collection updated!");
            }
        } catch (err) {
            console.error(err);
            notify('Failed to save changes. Please try again.', 'error');
        } finally { setSaveLoading(false); }
    };

    const handleDeletePlaylist = async () => {
        if (!selectedPlaylist?._id || !window.confirm('Delete this collection permanently?')) return;
        setSaveLoading(true);
        try {
            const res = await api.delete(`/playlists/${selectedPlaylist._id}`);
            if (res.data?.success) {
                notify("Collection deleted");
                setIsEditingPlaylist(false);
                setSelectedPlaylist(null);
                setCurrentView('Playlists');
                fetchLibraryData();
            }
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || err.message || 'Failed to delete';
            notify(`Error: ${errMsg}`, 'error');
        } finally { setSaveLoading(false); }
    };

    let displayedSongs = [];
    let heading = currentView;

    // View Logic
    if (currentView === 'Home') {
        displayedSongs = shuffledHomeSongs.length > 0 ? shuffledHomeSongs : liveSongs.slice(0, 50);
    } 
    else if (currentView === 'Search') {
        if (searchResults && searchResults.songs && searchResults.songs.length > 0) {
            displayedSongs = searchResults.songs.map(song => ({
                id: song._id,
                songName: song.title,
                artist: song.artist,
                albumText: song.albumText || '',
                genre: song.genre || 'Other',
                duration: song.durationFormatted || formatTime(song.duration),
                songImage: song.coverUrl || '/m-app-logo.png',
                audioUrl: song.audioUrl
            }));
            heading = `Results (${displayedSongs.length})`;
        } else {
            displayedSongs = [];
            heading = 'Search';
        }
    }
    else {
        displayedSongs = liveSongs;
    }

    let isArtistView = false;
    let artistsList = [];

    // Detailed View Overrides
    if (selectedAlbum) {
        displayedSongs = liveSongs.filter(song => song.albumText === selectedAlbum);
        heading = selectedAlbum;
    } else if (selectedPlaylist) {
        displayedSongs = (selectedPlaylist.songs || []).map(ps => {
            if (!ps.song) return null;
            const songId = typeof ps.song === 'object' ? ps.song._id : ps.song;
            return liveSongs.find(s => String(s.id) === String(songId));
        }).filter(Boolean);
        heading = selectedPlaylist.name;
    } else if (currentView === 'Listen History') {
        displayedSongs = recentHistory.map(id => liveSongs.find(song => String(song.id) === String(id))).filter(Boolean);
        heading = 'Listen History';
    } else if (currentView === 'Liked Songs') {
        displayedSongs = liveSongs.filter(song => favorites.includes(String(song.id)));
        heading = 'Liked Songs';
    } else if (currentView === 'Artists') {
        if (selectedArtist) {
            displayedSongs = liveSongs.filter(song => 
                song.artist.split(',').map(n => n.trim()).includes(selectedArtist)
            );
            heading = null;
        } else {
            isArtistView = true;
            heading = 'Artists';
            // Split by comma and deduplicate
            const uniqueArtistNames = Array.from(new Set(
                liveSongs.flatMap(song => 
                    song.artist.split(',').map(n => n.trim()).filter(Boolean)
                )
            ));

            artistsList = uniqueArtistNames.map(name => {
                const profile = allArtists.find(a => a.displayName === name);
                return { 
                    name, 
                    image: profile?.avatar || defaultArtistImg, 
                    id: profile?._id,
                    hasAvatar: !!profile?.avatar
                };
            }).filter(a => a.hasAvatar || user?.role === 'admin');
        }
    } else if (currentView === 'Albums' || currentView === 'Album') {
        heading = 'Albums';
        const liveAlbumNames = Array.from(new Set(liveSongs.map(song => song.albumText).filter(Boolean)));
        const registeredNames = registeredAlbums.map(a => a.title).filter(Boolean);
        const allUniqueAlbumNames = Array.from(new Set([...liveAlbumNames, ...registeredNames]));

        artistsList = allUniqueAlbumNames.map(name => {
            const registered = registeredAlbums.find(a => a.title === name);
            const live = liveSongs.find(s => s.albumText === name);
            return {
                name,
                image: registered?.coverUrl || live?.songImage || '/m-app-logo.png',
                isAlbum: true,
                description: registered?.artist || live?.artist || 'Unknown Artist'
            };
        });
        isArtistView = true;
    } else if (currentView === 'Playlists' || currentView === 'Playlist') {
        heading = 'Playlists';
        const likedSongsCard = {
            name: 'Liked Songs',
            image: '/m-app-logo.png',
            isLikedSongs: true,
            isPlaylist: true
        };

        artistsList = [likedSongsCard, ...userPlaylists.map(p => ({
            name: p.name,
            image: p.coverUrl || '/m-app-logo.png',
            id: p._id,
            isPlaylist: true,
            playlistObj: p
        }))];
        isArtistView = true;
    } else if (currentView === 'Discover') {
        if (selectedGenre) {
            displayedSongs = liveSongs.filter(song => song.genre?.toLowerCase() === selectedGenre.toLowerCase());
            heading = selectedGenre;
        } else {
            heading = 'Explore Categories';
        }
    }

    const isArtistProfileView = currentView === 'Artists' && selectedArtist && !selectedAlbum && !selectedPlaylist;
    const isExploreGrid = currentView === 'Discover' && !selectedGenre;
    const isHomeView = currentView === 'Home';
    const isAlbumView = selectedAlbum || selectedPlaylist || selectedGenre;
    const isUploadView = currentView === 'Upload';

    const handleNext = () => {
        const activeList = playingPlaylist.length > 0 ? playingPlaylist : displayedSongs;
        if (activeList.length === 0) return;

        const currentIndex = activeList.findIndex(s => s.id === clickedSong?.id);
        let nextIndex;

        if (isShuffle) {
            nextIndex = Math.floor(Math.random() * activeList.length);
            // If the same song is picked and there are others, try again once
            if (nextIndex === currentIndex && activeList.length > 1) {
                nextIndex = (nextIndex + 1) % activeList.length;
            }
        } else {
            nextIndex = (currentIndex + 1) % activeList.length;
        }

        setClickedSong(activeList[nextIndex]);
        setIsPlaying(true);
    };

    const handlePrevious = () => {
        const activeList = playingPlaylist.length > 0 ? playingPlaylist : displayedSongs;
        if (activeList.length === 0) return;

        const currentIndex = activeList.findIndex(s => s.id === clickedSong?.id);
        let prevIndex;

        if (isShuffle) {
            prevIndex = Math.floor(Math.random() * activeList.length);
        } else {
            prevIndex = (currentIndex - 1 + activeList.length) % activeList.length;
        }

        setClickedSong(activeList[prevIndex]);
        setIsPlaying(true);
    };

    if (loading) {
        let skeletonType = 'home';
        if (isAlbumView || isArtistProfileView) skeletonType = 'album';
        if (currentView === 'Discover' && !selectedGenre) skeletonType = 'discover';
        
        return (
            <>
                <SongsListWrapperStyled>
                    <Skeleton type={skeletonType} />
                </SongsListWrapperStyled>
                <AudioPlayer 
                    isShuffle={isShuffle} 
                    setIsShuffle={setIsShuffle} 
                    isRepeat={isRepeat} 
                    setIsRepeat={setIsRepeat} 
                />
            </>
        );
    }

    return (
        <>
            <SongsListWrapperStyled>
                {(!isHomeView && !isAlbumView && !isArtistProfileView) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <button 
                            onClick={() => { 
                                if (searchResults) onSearch(null); 
                                else if (currentView !== 'Home') setCurrentView('Home');
                            }}
                            style={{ background: 'none', border: 'none', color: 'white', opacity: 0.7, cursor: 'pointer', padding: 0, display: 'flex' }}
                        >
                            <IoArrowBack size={28} />
                        </button>
                        <ViewHeadingStyled style={{ margin: 0 }}>{heading}</ViewHeadingStyled>
                    </div>
                )}

                {isHomeView ? (
                    <>
                        <HomeHeaderRowStyled>
                            <SectionTitleWrapperStyled onClick={() => setCurrentView('Discover')}>
                                <h2>Best New Songs</h2>
                                <MdChevronRight />
                            </SectionTitleWrapperStyled>
                            <NewPlaylistBtnStyled onClick={() => setIsCreatingPlaylist(true)}>
                                <MdAddCircleOutline /> <span>New Playlist</span>
                            </NewPlaylistBtnStyled>
                        </HomeHeaderRowStyled>
                        <div style={{ position: 'relative' }}>
                            <TopSongsGridStyled ref={topSongsRef}>
                                {loading ? (
                                    Array(10).fill(0).map((_, i) => (
                                        <SkeletonBox key={i} $width="100%" $height="60px" $borderRadius="8px" style={{ marginBottom: '10px' }} />
                                    ))
                                ) : shuffledHomeSongs.length > 0 ? (
                                    shuffledHomeSongs.slice(0, 32).map((song, index) => (
                                    <SongContainerStyled key={song.id} onClick={() => handleSongClick(song, shuffledHomeSongs.slice(0, 32))}>
                                        <SongDetailsContainerStyled>
                                            {clickedSong?.id === song.id && (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px', color: '#f83821', flexShrink: 0, fontSize: '16px' }}>
                                                    <IoPlay />
                                                </div>
                                            )}
                                            <SongImgContainerStyled><img src={song.songImage} alt="" /></SongImgContainerStyled>
                                            <SongNameArtistStyled>
                                                <p style={{ fontWeight: '600', fontSize: '15px', color: clickedSong?.id === song.id ? '#f83821' : 'white' }}>{song.songName}</p>
                                                <p style={{ opacity: 0.6, fontSize: '13px' }}>{song.artist}</p>
                                            </SongNameArtistStyled>
                                        </SongDetailsContainerStyled>
                                        <SongDurationContainerStyled>
                                            <LikeButtonStyled onClick={(e) => handleLikeClick(e, song.id)} $isFavorite={isFavorite(song.id)}>{isFavorite(song.id) ? <MdFavorite /> : <MdFavoriteBorder />}</LikeButtonStyled>
                                            <div style={{ position: 'relative' }}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setMenuSongId(menuSongId === song.id ? null : song.id); }} 
                                                    style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}
                                                >
                                                    <MdMoreHoriz fontSize="20px" />
                                                </button>
                                                {renderSongMenu(song)}
                                            </div>
                                        </SongDurationContainerStyled>
                                    </SongContainerStyled>
                                ))
                            ) : (
                                <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', opacity: 0.5 }}>
                                    <MdMusicNote size={48} style={{ marginBottom: '15px' }} />
                                    <p style={{ fontSize: '18px', fontWeight: '500', margin: 0 }}>No songs found</p>
                                    <p style={{ fontSize: '14px', marginTop: '8px' }}>Start by uploading your first track!</p>
                                </div>
                            )}
                            </TopSongsGridStyled>
                            <SliderNavBtnStyled className="prev" onClick={() => handleScroll('left')}><IoChevronBackOutline /></SliderNavBtnStyled>
                            <SliderNavBtnStyled className="next" onClick={() => handleScroll('right')}><IoChevronForwardOutline /></SliderNavBtnStyled>
                        </div>

                        <HomeHeaderRowStyled style={{ marginTop: '30px' }}>
                            <SectionTitleWrapperStyled onClick={() => setCurrentView('Albums')}>
                                <h2>Recently Added Albums</h2>
                                <MdChevronRight />
                            </SectionTitleWrapperStyled>
                            <span style={{ color: '#f83821', cursor: 'pointer', fontWeight: '600', fontSize: '13px', flexShrink: 0 }} onClick={() => setCurrentView('Albums')}>See All</span>
                        </HomeHeaderRowStyled>
                        <AlbumsScrollContainerStyled>
                            {loading ? Array(5).fill(0).map((_, i) => <SkeletonBox key={i} $width="165px" $height="165px" $borderRadius="12px" />) : (
                                row1Albums.map(albumName => {
                                    const albumSongs = liveSongs.filter(s => s.albumText === albumName);
                                    const firstSong = albumSongs[0];
                                    return (
                                        <AlbumCardStyled key={albumName} onClick={() => { setSelectedAlbum(albumName); setCurrentView('Album'); }}>
                                            <div className="album-image-container">
                                                <img src={firstSong.songImage} alt={albumName} className="album-image" />
                                                <button className="play-button-overlay" onClick={(e) => { e.stopPropagation(); handleSongClick(firstSong, albumSongs); }}>
                                                    <IoPlay />
                                                </button>
                                            </div>
                                            <p className="album-title">{albumName}</p>
                                            <div className="album-info-row">
                                                <span>{firstSong.artist}</span>
                                            </div>
                                        </AlbumCardStyled>
                                    );
                                })
                            )}
                        </AlbumsScrollContainerStyled>
                        {row2Albums.length > 0 && (
                            <AlbumsScrollContainerStyled style={{ marginTop: '0px' }}>
                                {loading ? Array(5).fill(0).map((_, i) => <SkeletonBox key={i} $width="165px" $height="165px" $borderRadius="12px" />) : (
                                    row2Albums.map(albumName => {
                                        const albumSongs = liveSongs.filter(s => s.albumText === albumName);
                                        const firstSong = albumSongs[0];
                                        return (
                                            <AlbumCardStyled key={albumName} onClick={() => { setSelectedAlbum(albumName); setCurrentView('Album'); }}>
                                                <div className="album-image-container">
                                                    <img src={firstSong.songImage} alt={albumName} className="album-image" />
                                                    <button className="play-button-overlay" onClick={(e) => { e.stopPropagation(); handleSongClick(firstSong, albumSongs); }}>
                                                        <IoPlay />
                                                    </button>
                                                </div>
                                                <p className="album-title">{albumName}</p>
                                                <div className="album-info-row">
                                                    <span>{firstSong.artist}</span>
                                                </div>
                                            </AlbumCardStyled>
                                        );
                                    })
                                )}
                            </AlbumsScrollContainerStyled>
                        )}
                    </>
                ) : isAlbumView ? (() => {
                    const actualAlbum = selectedAlbum ? registeredAlbums.find(a => a.title === selectedAlbum) : null;
                    const metaArtist = actualAlbum ? actualAlbum.artist : (selectedPlaylist ? 'Playlist Owner' : displayedSongs[0]?.artist || 'Various Artists');
                    const metaImage = actualAlbum?.coverUrl || 
                                     (selectedPlaylist ? (playlists.find(p => p._id === selectedPlaylist || p.id === selectedPlaylist)?.coverUrl) : null) || 
                                     (selectedGenre ? (genres.find(g => g.name === selectedGenre)?.image) : null) ||
                                     displayedSongs[0]?.songImage || '/m-app-logo.png';
                    const artistProfile = allArtists.find(a => a.displayName === metaArtist);
                    const metaIcon = artistProfile?.avatar || defaultArtistImg;
                    const metaYear = actualAlbum?.releaseDate ? new Date(actualAlbum.releaseDate).getFullYear() : '2024';

                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            {(selectedAlbum || selectedPlaylist || selectedGenre) && (
                                <button 
                                    onClick={() => { setSelectedAlbum(null); setSelectedPlaylist(null); setSelectedGenre(null); }}
                                    style={{ background: 'none', border: 'none', color: 'white', opacity: 0.7, cursor: 'pointer', marginBottom: '15px', padding: 0, display: 'flex', alignSelf: 'flex-start' }}
                                >
                                    <IoArrowBack size={28} />
                                </button>
                            )}
                            <AlbumViewContainerStyled style={{ marginTop: '0' }}>
                                <AlbumLeftColStyled>
                                    <AlbumHeaderInfoStyled>
                                        <h1>{heading}</h1>
                                        <div className="album-subinfo">
                                            <img src={metaIcon} alt="" className="album-artist-icon" />
                                            <span className="artist-name" onClick={() => setSelectedArtist(metaArtist)}>{metaArtist}</span>
                                            <span>• {selectedAlbum ? metaYear : 'Collection'}</span>
                                            <span>• {displayedSongs.length} songs</span>
                                            <span>• {(() => {
                                                const totalSeconds = displayedSongs.reduce((acc, s) => {
                                                    const [m, s_] = (s.duration || '0:00').split(':').map(Number);
                                                    return acc + (m * 60 + s_);
                                                }, 0);
                                                const hrs = Math.floor(totalSeconds / 3600);
                                                const mins = Math.floor((totalSeconds % 3600) / 60);
                                                return hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`;
                                            })()}</span>
                                        </div>
                                    </AlbumHeaderInfoStyled>

                                    <AlbumActionsRowStyled>
                                        <button className="play-btn" onClick={() => {
                                            const isCurrentContextPlaying = displayedSongs.some(s => s.id === clickedSong?.id);
                                            if (isCurrentContextPlaying) {
                                                setIsPlaying(!isPlaying);
                                            } else {
                                                handleSongClick(displayedSongs[0], displayedSongs);
                                            }
                                        }}>
                                            {(isPlaying && displayedSongs.some(s => s.id === clickedSong?.id)) ? <IoPause /> : <IoPlay style={{ marginLeft: '4px' }} />}
                                        </button>
                                        <button className="icon-action" style={isShuffle ? { color: '#f83821' } : {}} onClick={() => setIsShuffle(!isShuffle)}><IoShuffleOutline /></button>
                                        <button className="icon-action" style={isRepeat ? { color: '#f83821' } : {}} onClick={() => setIsRepeat(!isRepeat)}><IoRepeatOutline /></button>

                                        {((currentView === 'Playlist' || currentView === 'Playlists') && (selectedPlaylist?.owner === user?.id || selectedPlaylist?.owner?._id === user?.id || user?.role === 'admin')) && (
                                            <button className="icon-action" onClick={() => { setIsEditingPlaylist(true); setEditPlaylistName(selectedPlaylist.name); setEditPlaylistDescription(selectedPlaylist.description || ''); setEditPlaylistPreview(selectedPlaylist.coverUrl || null); setEditPlaylistCover(null); }}><MdModeEdit /></button>
                                        )}

                                        {(((currentView === 'Playlist' || currentView === 'Playlists') && (selectedPlaylist?.owner === user?.id || selectedPlaylist?.owner?._id === user?.id)) || ((currentView === 'Album' || currentView === 'Albums') && user?.role === 'admin' && selectedAlbum)) && (
                                            <button className="icon-action" onClick={() => setIsQuickAddOpen(true)}><MdAddCircleOutline /></button>
                                        )}
                                        {((currentView === 'Album' || currentView === 'Albums') && user?.role === 'admin' && selectedAlbum) && (
                                            <button className="icon-action" onClick={handleDeleteAlbumFully} style={{ color: '#ff4d4d' }} title="Delete Album Fully"><MdDelete /></button>
                                        )}
                                        <div className="search-action" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {isLocalSearchOpen ? (
                                                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '4px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <MdSearch style={{ color: '#b3b3b3', fontSize: '18px' }} />
                                                    <input 
                                                        autoFocus
                                                        placeholder="Search in list"
                                                        value={localSearchQuery}
                                                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                                                        style={{ background: 'none', border: 'none', color: 'white', fontSize: '13px', outline: 'none', width: '120px', marginLeft: '5px' }}
                                                    />
                                                    <MdClose 
                                                        style={{ color: '#b3b3b3', fontSize: '18px', cursor: 'pointer' }} 
                                                        onClick={() => { setIsLocalSearchOpen(false); setLocalSearchQuery(''); }}
                                                    />
                                                </div>
                                            ) : (
                                                <MdSearch onClick={() => setIsLocalSearchOpen(true)} style={{ cursor: 'pointer' }} />
                                            )}
                                        </div>
                                    </AlbumActionsRowStyled>

                                    <AlbumTracklistHeaderStyled>
                                        <span className="col-index">#</span>
                                        <span className="col-title">Title</span>
                                        <span className="col-duration">Duration</span>
                                        <span className="col-actions-header"></span>
                                    </AlbumTracklistHeaderStyled>
                                    {displayedSongs
                                        .filter(song => 
                                            !localSearchQuery || 
                                            song.songName.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                                            song.artist.toLowerCase().includes(localSearchQuery.toLowerCase())
                                        )
                                        .map((song, index) => (
                                        <AlbumTrackRowStyled key={song.id} onClick={() => handleSongClick(song, displayedSongs)}>
                                            <div className="col-index">
                                                {clickedSong?.id === song.id ? <IoPlay style={{ color: '#f83821' }} /> : index + 1}
                                            </div>
                                            <div className="col-title">
                                                <p className="song-name">{song.songName}</p>
                                                <p className="song-artist">{song.artist}</p>
                                            </div>
                                            <div className="col-duration">
                                                <p>{song.duration}</p>
                                            </div>
                                            <div className="col-actions">
                                                {((currentView === 'Playlist' && (selectedPlaylist?.owner === user?.id || selectedPlaylist?.owner?._id === user?.id)) || (currentView === 'Album' && user?.role === 'admin')) && (
                                                    <button onClick={(e) => handleRemoveFromPlaylist(e, song.id)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }} title="Remove from collection"><MdDelete /></button>
                                                )}
                                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setMenuSongId(menuSongId === song.id ? null : song.id); }} 
                                                        style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}
                                                    >
                                                        <MdMoreHoriz fontSize="20px" />
                                                    </button>
                                                    {renderSongMenu(song)}
                                                </div>
                                            </div>
                                        </AlbumTrackRowStyled>
                                    ))}
                                </AlbumLeftColStyled>

                                <AlbumRightColStyled>
                                    <img src={metaImage} alt="Art" className="big-album-art" />

                                    {/* Only show genres mapped from songs if we have them */}
                                    <div>
                                        <AlbumGenreGridStyled>
                                            {Array.from(new Set((actualAlbum ? [actualAlbum.genre] : displayedSongs.map(s => s.genre)).filter(Boolean))).map(g => (
                                                <button key={g} className="genre-pill" onClick={() => { setSelectedGenre(g); setCurrentView('Discover'); }}>{g}</button>
                                            ))}
                                            {displayedSongs.every(s => !s.genre) && !actualAlbum?.genre && ['Pop', 'Electronic', 'Aesthetic'].map(g => (
                                                <button key={g} className="genre-pill">{g}</button>
                                            ))}
                                        </AlbumGenreGridStyled>
                                    </div>

                                    <div style={{ marginTop: '4px' }}>
                                        <p style={{ color: 'white', fontWeight: '800', marginBottom: '10px', fontSize: '15px', letterSpacing: '0.5px' }}>Featured Artists</p>
                                        <AlbumFeaturedArtistsStyled>
                                            {Array.from(new Set([
                                                ...(metaArtist || '').split(',').map(n => n.trim()), 
                                                ...displayedSongs.flatMap(s => (s.artist || '').split(',').map(n => n.trim()))
                                            ]))
                                                .filter(n => n && n !== 'Various Artists' && n !== 'Playlist Owner')
                                                .map(name => ({
                                                    name,
                                                    profile: allArtists.find(a => a.displayName === name)
                                                }))
                                                .filter(item => item.profile?.avatar || user?.role === 'admin')
                                                .slice(0, 5)
                                                .map(item => (
                                                    <div key={item.name} className="artist-row" onClick={() => setSelectedArtist(item.name)}>
                                                        <img src={item.profile?.avatar || defaultArtistImg} alt="" />
                                                        <p>{item.name}</p>
                                                    </div>
                                                ))}
                                        </AlbumFeaturedArtistsStyled>
                                    </div>
                                </AlbumRightColStyled>
                            </AlbumViewContainerStyled>
                        </div>
                    );
                })() : isUploadView ? (
                    <UploadSongs 
                        user={user} 
                        notify={notify} 
                        setGlobalLoading={setGlobalLoading} 
                        existingAlbums={registeredAlbums} 
                        allSongs={liveSongs}
                        onCancel={() => setCurrentView('Home')} 
                    />
                ) : isExploreGrid ? (
                    <GenreGridStyled>
                        {genres.map((g) => (
                            <GenreCardStyled key={g.name} onClick={() => setSelectedGenre(g.name)}>
                                <div className="genre-image-container">
                                    <img src={g.image} alt={g.name} />
                                </div>
                                <p>{g.name}</p>
                            </GenreCardStyled>
                        ))}
                    </GenreGridStyled>
                ) : isArtistProfileView ? (() => {
                    const artistInfo = allArtists.find(a => a.displayName === selectedArtist);
                    const artistImage = artistInfo?.avatar || defaultArtistImg;
                    const artistSongs = liveSongs.filter(s => 
                        s.artist.split(',').map(n => n.trim()).includes(selectedArtist)
                    );
                    const artistAlbums = Array.from(new Set(artistSongs.map(s => s.albumText).filter(Boolean)));
                    const displayedArtistSongs = showAllArtistSongs ? artistSongs : artistSongs.slice(0, 5);

                    return (
                        <ArtistProfileContainerStyled style={{ marginTop: '0' }}>
                            <button 
                                onClick={() => { setSelectedArtist(null); }}
                                style={{ background: 'none', border: 'none', color: 'white', opacity: 0.7, cursor: 'pointer', marginBottom: '10px', padding: 0, display: 'flex', alignSelf: 'flex-start' }}
                            >
                                <IoArrowBack size={28} />
                            </button>
                            <ArtistBannerStyled $image={artistImage}>
                                <h1>{selectedArtist}</h1>
                            </ArtistBannerStyled>

                            <ArtistProfileTabsStyled>
                                <button className="active">Albums</button>
                                <button>About</button>
                            </ArtistProfileTabsStyled>

                            <ArtistSectionStyled style={{ marginTop: '0' }}>
                                <h2>Top songs</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                                    {displayedArtistSongs.map((song, index) => (
                                        <SongContainerStyled 
                                            key={song.id} 
                                            onClick={() => handleSongClick(song, artistSongs)} 
                                        >
                                            <SongDetailsContainerStyled>
                                                <SongIndexStyled>{clickedSong?.id === song.id ? <IoPlay style={{ color: '#f83821' }} /> : index + 1}</SongIndexStyled>
                                                <SongImgContainerStyled><img src={song.songImage} alt="" /></SongImgContainerStyled>
                                                <SongNameArtistStyled><p>{song.songName}</p><p>{song.artist}</p></SongNameArtistStyled>
                                            </SongDetailsContainerStyled>
                                            <SongDurationContainerStyled>
                                                <p>{song.duration}</p>
                                                <LikeButtonStyled onClick={(e) => handleLikeClick(e, song.id)} $isFavorite={isFavorite(song.id)}>{isFavorite(song.id) ? <MdFavorite /> : <MdFavoriteBorder />}</LikeButtonStyled>
                                                <div style={{ position: 'relative' }}>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setMenuSongId(menuSongId === song.id ? null : song.id); }} 
                                                        style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}
                                                    >
                                                        <MdMoreHoriz fontSize="20px" />
                                                    </button>
                                                    {renderSongMenu(song)}
                                                </div>
                                            </SongDurationContainerStyled>
                                        </SongContainerStyled>
                                    ))}
                                </div>
                                {artistSongs.length > 5 && (
                                    <button 
                                        onClick={() => setShowAllArtistSongs(!showAllArtistSongs)}
                                        style={{ 
                                            background: 'none', 
                                            color: '#b3b3b3', 
                                            border: 'none', 
                                            padding: '8px 16px', 
                                            cursor: 'pointer', 
                                            fontWeight: '700', 
                                            fontSize: '14px',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseOver={(e) => e.target.style.color = 'white'}
                                        onMouseOut={(e) => e.target.style.color = '#b3b3b3'}
                                    >
                                        {showAllArtistSongs ? 'Show less' : 'Show all'}
                                    </button>
                                )}
                            </ArtistSectionStyled>

                            <ArtistSectionStyled>
                                <h2>Albums</h2>
                                <div className="album-grid">
                                    {artistAlbums.map(albumName => {
                                        const albumSongsList = liveSongs.filter(s => 
                                            s.albumText === albumName && 
                                            s.artist.split(',').map(n => n.trim()).includes(selectedArtist)
                                        );
                                        const albumSong = albumSongsList[0];
                                        const registered = registeredAlbums.find(a => a.title === albumName);
                                        return (
                                            <AlbumCardStyled key={albumName} onClick={() => { setSelectedAlbum(albumName); }} style={{ minWidth: 'unset', maxWidth: 'unset' }}>
                                                <div className="album-image-container" style={{ borderRadius: '8px' }}>
                                                    <img src={registered?.coverUrl || albumSong?.songImage || '/m-app-logo.png'} alt={albumName} className="album-image" />
                                                    <button className="play-button-overlay" onClick={(e) => { e.stopPropagation(); handleSongClick(albumSong, albumSongsList); }}><IoPlay /></button>
                                                </div>
                                                <p className="album-title">{albumName}</p>
                                                <div className="album-info-row">
                                                    <span>Album • {selectedArtist}</span>
                                                </div>
                                            </AlbumCardStyled>
                                        );
                                    })}
                                </div>
                            </ArtistSectionStyled>
                        </ArtistProfileContainerStyled>
                    );
                })() : isArtistView ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', padding: '10px' }}>
                        {artistsList.map(item => (
                            <AlbumCardStyled
                                key={item.name}
                                onClick={() => {
                                    if (item.isLikedSongs) setCurrentView('Liked Songs');
                                    else if (item.isPlaylist) setSelectedPlaylist(item.playlistObj);
                                    else if (item.isAlbum) setSelectedAlbum(item.name);
                                    else setSelectedArtist(item.name);
                                }}
                                style={{ minWidth: 'unset', maxWidth: 'unset' }}
                            >
                                <div className="album-image-container" style={{
                                    borderRadius: item.isAlbum || item.isPlaylist ? '8px' : '50%',
                                    background: item.isLikedSongs ? 'linear-gradient(135deg, #f83821 0%, #a31d0f 100%)' : 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {item.isLikedSongs ? (
                                        <MdFavorite style={{ color: 'white', fontSize: '60px' }} />
                                    ) : (item.image && !item.image.includes('default_')) ? (
                                        <img src={item.image} alt="" className="album-image" />
                                    ) : (
                                        item.isPlaylist ? <MdPlaylistPlay style={{ color: 'rgba(255,255,255,0.2)', fontSize: '50px' }} /> :
                                            item.isAlbum ? <MdAlbum style={{ color: 'rgba(255,255,255,0.2)', fontSize: '50px' }} /> :
                                                <MdRecordVoiceOver style={{ color: 'rgba(255,255,255,0.2)', fontSize: '50px' }} />
                                    )}
                                    <button className="play-button-overlay">
                                        <IoPlay />
                                    </button>
                                </div>
                                <p className="album-title">{item.name}</p>
                                <div className="album-info-row">
                                    <span>{item.isLikedSongs ? 'Collection' : item.isPlaylist ? 'Playlist' : item.isAlbum ? 'Album' : 'Artist'}</span>
                                    {item.description && <span>• {item.description}</span>}
                                </div>
                                {user?.role === 'admin' && !item.isPlaylist && !item.isAlbum && !item.isLikedSongs && (
                                    <div style={{ marginTop: '10px' }}>
                                        <label style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '15px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'inline-block' }} onClick={(e) => e.stopPropagation()}>
                                            Edit Photo
                                            <input type="file" hidden onChange={(e) => {
                                                handleUpdateArtistAvatar(item.id, item.name, e.target.files[0]);
                                            }} />
                                        </label>
                                    </div>
                                )}
                            </AlbumCardStyled>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {currentView === 'Search' && displayedSongs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '100px 20px', opacity: 0.5 }}>
                                <MdSearch size={64} style={{ marginBottom: '15px' }} />
                                <p style={{ fontSize: '18px', fontWeight: '500', margin: 0 }}>Search Vocalz</p>
                                <p style={{ fontSize: '14px', marginTop: '8px' }}>Find your favorite songs, artists, and albums.</p>
                            </div>
                        ) : (
                            displayedSongs.map(song => (
                                <SongContainerStyled key={song.id} onClick={() => handleSongClick(song, displayedSongs)}>
                                    <SongDetailsContainerStyled>
                                        {clickedSong?.id === song.id && (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px', color: '#f83821', flexShrink: 0, fontSize: '16px' }}>
                                                <IoPlay />
                                            </div>
                                        )}
                                        <SongImgContainerStyled><img src={song.songImage} alt="" /></SongImgContainerStyled>
                                        <SongNameArtistStyled>
                                            <p style={{ color: clickedSong?.id === song.id ? '#f83821' : 'white' }}>{song.songName}</p>
                                            <p>{song.artist}</p>
                                        </SongNameArtistStyled>
                                    </SongDetailsContainerStyled>
                                    <SongDurationContainerStyled>
                                        <p>{song.duration}</p>
                                        <LikeButtonStyled onClick={(e) => handleLikeClick(e, song.id)} $isFavorite={isFavorite(song.id)}>{isFavorite(song.id) ? <MdFavorite /> : <MdFavoriteBorder />}</LikeButtonStyled>
                                        <div style={{ position: 'relative' }}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setMenuSongId(menuSongId === song.id ? null : song.id); }} 
                                                style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}
                                            >
                                                <MdMoreHoriz fontSize="20px" />
                                            </button>
                                            {renderSongMenu(song)}
                                        </div>
                                    </SongDurationContainerStyled>
                                </SongContainerStyled>
                            ))
                        )}
                    </div>
                )}

                {/* Modals */}
                {isCreatingPlaylist && (
                    <EditPlaylistModalOverlayStyled onClick={() => setIsCreatingPlaylist(false)}>
                        <EditPlaylistModalStyled onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Create collection</h2>
                                <button onClick={() => setIsCreatingPlaylist(false)}><MdClose /></button>
                            </div>
                            <div className="modal-body">
                                <div className="cover-edit-container" onClick={() => document.getElementById('new-playlist-cover').click()}>
                                    <img src={newPlaylistPreview || '/m-app-logo.png'} alt="Cover" />
                                    <div className="overlay">
                                        <MdModeEdit />
                                        <span>Choose photo</span>
                                    </div>
                                    <MdMoreHoriz className="options-icon" />
                                    <input type="file" id="new-playlist-cover" hidden accept="image/*" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setNewPlaylistCover(file);
                                            setNewPlaylistPreview(URL.createObjectURL(file));
                                        }
                                    }} />
                                </div>
                                <div className="details-edit-container">
                                    <input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="Add a name" />
                                    <textarea value={newPlaylistDescription} onChange={(e) => setNewPlaylistDescription(e.target.value)} placeholder="Add an optional description" rows="4"></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <p className="disclaimer">By proceeding, you agree to give Vocalz access to the image you choose to upload. Please make sure you have the right to upload the image.</p>
                                <button onClick={handleCreatePlaylist}>{saveLoading ? 'Creating...' : 'Create'}</button>
                            </div>
                        </EditPlaylistModalStyled>
                    </EditPlaylistModalOverlayStyled>
                )}

                {addingSongToPlaylist && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                        <div style={{ background: '#121212', padding: '30px', borderRadius: '15px', width: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h2 style={{ color: 'white', marginBottom: '20px' }}>Add to Playlist</h2>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {userPlaylists.map(pl => (
                                    <div key={pl._id} onClick={() => handleAddSongToPlaylist(pl._id, addingSongToPlaylist.id)} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '8px', cursor: 'pointer', color: 'white' }}>{pl.name}</div>
                                ))}
                            </div>
                            <button onClick={() => setAddingSongToPlaylist(null)} style={{ background: 'none', border: 'none', color: '#666', width: '100%', marginTop: '15px' }}>Cancel</button>
                        </div>
                    </div>
                )}

                {isQuickAddOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                        <div style={{ background: '#121212', padding: '30px', borderRadius: '15px', width: '550px', maxHeight: '80vh', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ color: 'white', marginBottom: '20px' }}>Add Tracks</h2>
                            <input type="text" placeholder="Search library..." value={addingSearch} onChange={(e) => setAddingSearch(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '10px', color: 'white', marginBottom: '20px' }} />
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {liveSongs.filter(s => s.songName.toLowerCase().includes(addingSearch.toLowerCase())).slice(0, 10).map(s => (
                                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img src={s.songImage} style={{ width: '40px', height: '40px', borderRadius: '4px' }} alt="" />
                                            <p style={{ color: 'white', margin: 0, fontSize: '14px' }}>{s.songName}</p>
                                        </div>
                                        <button onClick={(e) => (currentView === 'Playlist' || currentView === 'Playlists') && selectedPlaylist ? handleAddSongToPlaylist(selectedPlaylist._id, s.id) : handleMoveToAlbum(e, s.id, selectedAlbum)} style={{ background: '#f83821', border: 'none', borderRadius: '20px', padding: '5px 15px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>Add</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setIsQuickAddOpen(false)} style={{ background: 'none', border: 'none', color: '#666', marginTop: '20px' }}>Close</button>
                        </div>
                    </div>
                )}

                {editingSong && <UploadSongs key={editingSong.id} user={user} songToEdit={editingSong} notify={notify} setGlobalLoading={setGlobalLoading} existingAlbums={registeredAlbums} allSongs={liveSongs} onDelete={handleDeleteSong} onCancel={() => setEditingSong(null)} />}

                {isEditingPlaylist && selectedPlaylist && (
                    <EditPlaylistModalOverlayStyled onClick={() => setIsEditingPlaylist(false)}>
                        <EditPlaylistModalStyled onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Edit details</h2>
                                <button onClick={() => setIsEditingPlaylist(false)}><MdClose /></button>
                            </div>
                            <div className="modal-body">
                                <div className="cover-edit-container" onClick={() => document.getElementById('edit-playlist-cover').click()}>
                                    <img src={editPlaylistPreview || selectedPlaylist.coverUrl || '/m-app-logo.png'} alt="Cover" />
                                    <div className="overlay">
                                        <MdModeEdit />
                                        <span>Choose photo</span>
                                    </div>
                                    <MdMoreHoriz className="options-icon" />
                                    <input type="file" id="edit-playlist-cover" hidden accept="image/*" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setEditPlaylistCover(file);
                                            setEditPlaylistPreview(URL.createObjectURL(file));
                                        }
                                    }} />
                                </div>
                                <div className="details-edit-container">
                                    <input type="text" value={editPlaylistName} onChange={(e) => setEditPlaylistName(e.target.value)} placeholder="Add a name" />
                                    <textarea value={editPlaylistDescription} onChange={(e) => setEditPlaylistDescription(e.target.value)} placeholder="Add an optional description" rows="4"></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <p className="disclaimer">By proceeding, you agree to give Vocalz access to the image you choose to upload. Please make sure you have the right to upload the image.</p>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <button onClick={handleDeletePlaylist} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Delete playlist</button>
                                    <button onClick={handleSavePlaylistEdit}>{saveLoading ? 'Saving...' : 'Save'}</button>
                                </div>
                            </div>
                        </EditPlaylistModalStyled>
                    </EditPlaylistModalOverlayStyled>
                )}

            </SongsListWrapperStyled>

            {clickedSong ? (
                <AudioPlayer pickedSong={clickedSong} isPlaying={isPlaying} setIsPlaying={setIsPlaying} isSongFavorite={isFavorite(clickedSong.id)} onToggleFavorite={() => handleLikeClick({ stopPropagation: () => { } }, clickedSong.id)} onNext={handleNext} onPrevious={handlePrevious} isShuffle={isShuffle} setIsShuffle={setIsShuffle} isRepeat={isRepeat} setIsRepeat={setIsRepeat} />
            ) : (
                <AudioPlayer isShuffle={isShuffle} setIsShuffle={setIsShuffle} isRepeat={isRepeat} setIsRepeat={setIsRepeat} />
            )}

            {globalLoading && <Loader message={globalLoading} />}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}
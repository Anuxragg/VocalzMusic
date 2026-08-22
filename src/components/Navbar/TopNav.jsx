/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { GoHome } from "react-icons/go";
import { IoSearchOutline, IoPersonCircleOutline } from "react-icons/io5";
import { MdOutlineExplore, MdCloudUpload } from "react-icons/md";
import { TopNavContainerStyled, NavPillStyled, TopNavLinksStyled, SearchInputPillStyled, ProfileGreetingStyled } from "./navbar.styled";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function TopNav({ currentView, setCurrentView, onSearch }) {
    const navigate = useNavigate();
    const { isAuthenticated, logout, user } = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (!onSearch) return;

        if (value.trim().length === 0) {
            onSearch({ songs: [], artists: [], albums: [], playlists: [] });
            return;
        }

        try {
            const res = await api.get(`/search?q=${encodeURIComponent(value)}`);
            if (res.data && res.data.success) {
                onSearch(res.data.data);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    useEffect(() => {
        const closeOnOutsideClick = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', closeOnOutsideClick);
        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, []);

    const handleLogout = async () => {
        try { await logout(); } catch (err) { console.error(err); }
        setProfileOpen(false);
        setCurrentView('Home');
        navigate('/login');
    };

    const navItems = [
        { id: 'Home', icon: <GoHome />, label: 'Home' },
        { id: 'Discover', icon: <MdOutlineExplore />, label: 'Discover' },
        { id: 'Search', icon: <IoSearchOutline />, label: 'Search' },
    ];

    // Only add Upload for the admin account
    if (user?.email === 'admin1@gmail.com') {
        navItems.push({ id: 'Upload', icon: <MdCloudUpload />, label: 'Upload' });
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <TopNavContainerStyled>
            <TopNavLinksStyled>
                {navItems.map((item) => {
                    if (item.id === 'Search' && currentView === 'Search') {
                        return (
                            <SearchInputPillStyled key={item.id}>
                                <span className="icon"><IoSearchOutline /></span>
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    autoFocus
                                />
                            </SearchInputPillStyled>
                        );
                    }
                    return (
                        <NavPillStyled 
                            key={item.id}
                            $isActive={currentView === item.id}
                            $isUpload={item.id === 'Upload'}
                            onClick={() => setCurrentView(item.id)}
                        >
                            <span className="icon">{item.icon}</span>
                            <span className="label">{item.label}</span>
                        </NavPillStyled>
                    );
                })}
            </TopNavLinksStyled>

            {/* Profile Menu Integrated on Far Right */}
            <div className="profile-menu" ref={profileMenuRef} style={{ marginLeft: 'auto', position: 'relative' }}>
                <button 
                   className="profile-trigger" 
                   onClick={() => setProfileOpen(prev => !prev)}
                   style={{ 
                       background: 'transparent', 
                       border: 'none', 
                       color: 'white', 
                       display: 'flex', 
                       alignItems: 'center', 
                       gap: '10px', 
                       cursor: 'pointer',
                       fontSize: '28px'
                   }}
                >
                    <IoPersonCircleOutline />
                    <ProfileGreetingStyled>
                        {isAuthenticated && user?.username ? `${getGreeting()}, ${user.username}` : 'Account'}
                    </ProfileGreetingStyled>
                </button>

                {profileOpen && (
                    <div className="profile-dropdown" style={{ 
                        position: 'absolute', 
                        right: 0, 
                        top: '120%', 
                        background: '#282828', 
                        borderRadius: '4px', 
                        padding: '4px', 
                        boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                        minWidth: '160px',
                        zIndex: 1000
                    }}>
                        {isAuthenticated ? (
                            <>
                                <button 
                                    onClick={handleLogout}
                                    style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: '#f83821', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '13px' }}>Login</button>
                                <button onClick={() => navigate('/register')} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '13px' }}>Sign Up</button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </TopNavContainerStyled>
    );
}

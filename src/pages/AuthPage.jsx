import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext'; 

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
  color: #8c8c8c;
  font-size: 0.8rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #333;
  }

  &::before {
    margin-right: .6em;
  }

  &::after {
    margin-left: .6em;
  }
`;

const GoogleWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const CustomGoogleBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background-color: white;
  color: black;
  border: none;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f1f1f1;
  }
  
  &:active {
    background-color: #e2e2e2;
  }
`;const scrollDiagonal = keyframes`
  from { transform: translateY(0); }
  to   { transform: translateY(-50%); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
 
const GridBg = styled.div`
  position: fixed;
  inset: -160px;
  display: grid;
  grid-template-columns: repeat(8, minmax(170px, 1fr));
  gap: 16px;
  pointer-events: none;
  z-index: 0;
  transform: rotate(-16deg) scale(1.14);
`;
 
const SPEEDS = [86, 80, 83, 78, 88, 82, 85, 79];
const DELAYS = [-14, -6, -11, -3, -16, -9, -13, -4];
const REPEAT_COUNT = 6;
 
const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: ${scrollDiagonal} ${({ $speed }) => $speed}s linear infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  transform: translateY(${({ $offset }) => $offset}px);
  will-change: transform;
`;
 
const Tile = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  flex-shrink: 0;
  background: ${({ $bg }) => $bg} center / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  filter: brightness(1.25) contrast(1.1) saturate(1.12);
  box-shadow: inset 0 0 8px rgba(0,0,0,0.18);
`
 
const Vignette = styled.div`
  position: fixed;
  inset: 0;
  background: radial-gradient(
    ellipse 60% 75% at 50% 50%,
    rgba(0, 0, 0, 0.14) 0%,
    rgba(0, 0, 0, 0.68) 75%
  );
  z-index: 1;
`;
 
const Page = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;
 
/* The Netflix-style subtle dark card */
const Card = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 48px 44px 40px;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 6px;
  animation: ${fadeUp} 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
 
  @media (max-width: 500px) {
    padding: 40px 24px 32px;
    border-radius: 0;
    background: rgba(0, 0, 0, 0.85);
  }
`;
 
const Logo = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -1.5px;
  color: #fff;
  text-align: center;
  margin-bottom: 32px;
  text-shadow: 0 0 20px rgba(255,255,255,0.2);
`;
 
const Heading = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 1.85rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
  margin-bottom: 24px;
`;
 
const Input = styled.input`
  width: 100%;
  background: #333;
  border: none;
  border-radius: 4px;
  padding: 16px;
  color: #fff;
  font-size: 0.95rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  outline: none;
  margin-bottom: 12px;
  transition: background 0.15s;
  
  &::placeholder { color: #8c8c8c; }
  &:focus { background: #454545; }
`;
 
const SlideField = styled.div`
  overflow: hidden;
  max-height: ${({ $show }) => $show ? '400px' : '0px'};
  opacity: ${({ $show }) => $show ? 1 : 0};
  transition:
    max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.25s ease;
`;
 
const ErrorMsg = styled.div`
  font-size: 0.8rem;
  color: #ff6b6b;
  margin-bottom: 12px;
  padding: 11px 14px;
  background: rgba(229, 9, 20, 0.1);
  border-radius: 4px;
  border-left: 3px solid #e50914;
`;
 
const SubmitBtn = styled.button`
  width: 100%;
  padding: 16px;
  background: #f83821;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 8px;
 
  &:hover:not(:disabled) { 
    background: #ff4d3a;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(248, 56, 33, 0.3);
  }
  &:active:not(:disabled) { transform: scale(0.98); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
 
const Footer = styled.p`
  font-size: 0.9rem;
  color: #b3b3b3;
  margin-top: 24px;
  text-align: center;
 
  button {
    background: none;
    border: none;
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
    margin-left: 4px;
    &:hover { text-decoration: underline; }
  }
`;
 
const TILES = [
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/w_300,h_450,c_fill/Tame-Impala-Currents_scbitd.jpg")' },
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/w_300,h_450,c_fill/3YV2PTJAVFGCVJK5IC6RJYY6EA_vpgdsu.jpg")' },
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/w_300,h_450,c_fill/Graduation__28album_29_fy2qju.jpg")' },
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/v1775156900/5f06f7f6_rqcpsi.jpg")' },
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/v1775156988/The_Weeknd_-_After_Hours_h7xmrt.png")' },
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/v1775157039/Travis_Scott_-_Astroworld_qdoxwi.png")' },
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/v1775157118/61B0hKrHZRL._UF1000_1000_QL80__inl0ca.jpg")' },
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/v1775157146/a4052037710_16_n1rjnz.jpg")' },
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/v1775157262/rs-125615-092313-weekend-rock-01-500-1379961884_ltjonx.jpg")' },
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/v1775157307/Inrainbowscover_tk8z9p.png")' },
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/v1775157380/ab67616d0000b2736b219c8d8462bfe254a20469_slw2hh.jpg")' },
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/v1775157465/1900x1900-000000-80-0-0_hok1ew.jpg")' },
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/v1775157504/Igor_-_Tyler_2C_the_Creator_flrhce.jpg")' },
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/v1775157625/marina-and-levi-as-the-tv-girl-album-cover-v0-n3md5spiq8hd1_nf7ggy.png")' },
  { bg: 'url("https://res.cloudinary.com/dgqxnmhmx/image/upload/v1775157947/french-exit_cpy6kn.png")' },
];
 
export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const [mode, setMode]   = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm]   = useState({
    username: '', email: '', password: '', confirmPassword: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);
 
  const isRegister = mode === 'register';
  const set = (key) => (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setError(''); };
 
  const switchMode = (m) => {
    setMode(m);
    setError('');
    setForm({ username: '', email: '', password: '', confirmPassword: '' });
  };
 
  const validate = () => {
    if (!form.email.trim()) { setError('Email is required.'); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) { setError('Please enter a valid email address.'); return false; }
    if (!form.password)     { setError('Password is required.'); return false; }
    if (isRegister) {
      if (!form.username.trim())                  { setError('Username is required.'); return false; }
      if (form.username.length < 3)               { setError('Username must be at least 3 characters.'); return false; }
      if (form.password.length < 6)               { setError('Password must be at least 6 characters.'); return false; }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return false; }
    }
    return true;
  };
 
  const handleSubmit = async () => {
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const body = isRegister
        ? {
            username: form.username,
            email: form.email,
            password: form.password,
          }
        : { email: form.email, password: form.password };

      if (isRegister) {
        await register(body);
      } else {
        await login(body);
      }

      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Network error. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(tokenResponse.access_token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login was unsuccessful.');
  };

  const googleLoginAction = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    ux_mode: 'redirect',
  });

  const onKey = (e) => { if (e.key === 'Enter') handleSubmit(); };
 
  return (
    <>
 
      <GridBg>
        {SPEEDS.map((speed, ci) => (
          <Col key={ci} $speed={speed} $delay={DELAYS[ci]} $offset={(ci % 2) * 38}>
            {Array.from({ length: REPEAT_COUNT }).map((_, repeat) =>
              TILES.map((_, ti) => {
                const shiftedTile = TILES[(ti + ci) % TILES.length];
                return <Tile key={`${repeat}-${ci}-${ti}`} $bg={shiftedTile.bg} />;
              })
            )}
          </Col>
        ))}
      </GridBg>
 
      <Vignette />
 
      <Page>
        <Card>
          <Logo>VOCALZ</Logo>
          <Heading>{isRegister ? 'Create Account' : 'Sign In'}</Heading>
 
          <SlideField $show={isRegister}>
            <Input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={set('username')}
              onKeyDown={onKey}
              autoComplete="username"
            />
          </SlideField>
 
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={set('email')}
            onKeyDown={onKey}
            autoComplete="email"
          />
 
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={set('password')}
            onKeyDown={onKey}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
 
          <SlideField $show={isRegister}>
            <Input
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              onKeyDown={onKey}
              autoComplete="new-password"
            />
          </SlideField>
 
          {error && <ErrorMsg>{error}</ErrorMsg>}
 
          <SubmitBtn onClick={handleSubmit} disabled={loading}>
            {loading
              ? (isRegister ? 'Creating account...' : 'Signing in...')
              : (isRegister ? 'Sign Up' : 'Sign In')
            }
          </SubmitBtn>

          <Divider>OR</Divider>

          <GoogleWrapper>
            <CustomGoogleBtn onClick={() => googleLoginAction()} type="button">
              <FcGoogle size={24} />
              <span>{isRegister ? 'Sign up with Google' : 'Sign in with Google'}</span>
            </CustomGoogleBtn>
          </GoogleWrapper>
 
          <Footer>
            {isRegister
              ? <>Already a member?{' '}<button onClick={() => switchMode('login')}>Sign in.</button></>
              : <>New to VOCALZ?{' '}<button onClick={() => switchMode('register')}>Sign up now.</button></>
            }
          </Footer>
        </Card>
      </Page>
    </>
  );
}
 
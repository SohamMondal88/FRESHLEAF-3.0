import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useToast } from '../services/ToastContext';
import { Leaf, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, X, Smartphone, Chrome } from 'lucide-react';

// --- Shared Components ---

const AuthLayout: React.FC<{ children: React.ReactNode; image: string; quote: string; author: string }> = ({ children, image, quote, author }) => (
  <div className="min-h-screen flex bg-white">
    {/* Left Side - Form */}
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 xl:p-24 animate-in slide-in-from-left duration-500">
      <div className="w-full max-w-md space-y-8">
        {children}
      </div>
    </div>

    {/* Right Side - Image Banner (Hidden on mobile) */}
    <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-leaf-900">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
      <img src={image} alt="Background" className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-1000 scale-105" />
      
      <div className="absolute bottom-0 left-0 right-0 p-16 z-20 text-white">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl">
           <div className="mb-4 text-leaf-300">
             <Leaf size={40} />
           </div>
           <blockquote className="text-2xl font-medium leading-relaxed mb-6 font-serif">
             "{quote}"
           </blockquote>
           <div className="flex items-center gap-4">
             <div className="h-px bg-white/30 w-12"></div>
             <p className="font-bold tracking-widest uppercase text-sm">{author}</p>
           </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Login Page ---

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, socialLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // @ts-ignore
  const from = location.state?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    
    if (success) {
      addToast("Welcome back to FreshLeaf!", "success");
      navigate(from, { replace: true });
    } else {
      addToast("Invalid email or password", "error");
    }
  };

  const handleGoogleLogin = () => {
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      '', 
      'Google Sign In', 
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      addToast('Popup blocked. Please allow popups for Google Login.', 'error');
      return;
    }

    const googleContent = `
      <html>
        <head>
          <title>Sign in - Google Accounts</title>
          <style>
            body { font-family: 'Roboto', arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #fff; color: #202124; }
            .container { width: 100%; max-width: 450px; padding: 48px 40px 36px; border: 1px solid #dadce0; border-radius: 8px; box-sizing: border-box; text-align: center; }
            .logo { height: 24px; margin-bottom: 16px; }
            h1 { font-size: 24px; font-weight: 400; margin: 0 0 8px; color: #202124; font-family: 'Google Sans','Noto Sans Myanmar UI',arial,sans-serif; }
            p { font-size: 16px; margin: 0 0 40px; color: #202124; }
            .input-group { text-align: left; margin-bottom: 8px; position: relative; }
            .input-box { width: 100%; padding: 13px 15px; border: 1px solid #dadce0; border-radius: 4px; font-size: 16px; color: #202124; box-sizing: border-box; transition: 0.2s; outline: none; }
            .input-box:focus { border: 2px solid #1a73e8; padding: 12px 14px; }
            .actions { display: flex; justify-content: space-between; align-items: center; margin-top: 40px; }
            .link { color: #1a73e8; font-weight: 500; font-size: 14px; text-decoration: none; cursor: pointer; }
            .btn { background-color: #1a73e8; color: #fff; border: none; padding: 10px 24px; border-radius: 4px; font-weight: 500; font-size: 14px; cursor: pointer; transition: 0.2s; }
            .btn:hover { background-color: #1558d6; box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15); }
            .profile-view { display: none; text-align: center; border: 1px solid #dadce0; border-radius: 20px; padding: 4px 10px 4px 4px; display: inline-flex; align-items: center; margin-bottom: 40px; cursor: pointer; }
            .profile-icon { height: 20px; width: 20px; border-radius: 50%; background: #1a73e8; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 8px; }
            .profile-email { font-size: 14px; color: #3c4043; font-weight: 500; margin-right: 8px; }
            .hidden { display: none !important; }
            .loader { border: 2px solid #f3f3f3; border-top: 2px solid #1a73e8; border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; margin-right: 8px; display: inline-block; vertical-align: middle;}
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="container">
            <svg class="logo" viewBox="0 0 75 24" width="75" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            
            <div id="step-1">
                <h1>Sign in</h1>
                <p>Use your Google Account</p>
                <div class="input-group">
                    <input type="email" id="email" class="input-box" placeholder="Email or phone" autocomplete="username">
                </div>
                <div style="text-align: left; margin-bottom: 40px;">
                    <a href="#" class="link">Forgot email?</a>
                </div>
                <div style="text-align: left; font-size: 14px; color: #5f6368; margin-bottom: 40px;">
                    Not your computer? Use Guest mode to sign in privately. <a href="#" class="link">Learn more</a>
                </div>
                <div class="actions">
                    <a href="#" class="link">Create account</a>
                    <button class="btn" onclick="nextStep()">Next</button>
                </div>
            </div>

            <div id="step-2" class="hidden">
                <h1>Welcome</h1>
                <div class="profile-view" onclick="prevStep()">
                    <div class="profile-icon" id="profile-icon"></div>
                    <div class="profile-email" id="profile-email"></div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#5f6368"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
                </div>
                <div class="input-group">
                    <input type="password" id="password" class="input-box" placeholder="Enter your password" autocomplete="current-password">
                </div>
                <div style="text-align: left; margin-bottom: 40px;">
                    <input type="checkbox" id="show-pass" onchange="togglePass()"> <label for="show-pass" style="font-size:14px; color:#3c4043">Show password</label>
                </div>
                <div class="actions">
                    <a href="#" class="link">Forgot password?</a>
                    <button class="btn" id="signin-btn" onclick="finishLogin()">Next</button>
                </div>
            </div>

          </div>
          <script>
            const emailInput = document.getElementById('email');
            const passInput = document.getElementById('password');
            
            emailInput.focus();
            emailInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') nextStep(); });
            passInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') finishLogin(); });

            function nextStep() {
                const email = emailInput.value;
                if(!email || !email.includes('@')) {
                    emailInput.style.borderColor = '#d93025';
                    return;
                }
                emailInput.style.borderColor = '#dadce0';
                
                document.getElementById('step-1').classList.add('hidden');
                document.getElementById('step-2').classList.remove('hidden');
                
                document.getElementById('profile-email').innerText = email;
                document.getElementById('profile-icon').innerText = email[0].toUpperCase();
                setTimeout(() => passInput.focus(), 100);
            }

            function prevStep() {
                document.getElementById('step-1').classList.remove('hidden');
                document.getElementById('step-2').classList.add('hidden');
                emailInput.focus();
            }

            function togglePass() {
                const type = document.getElementById('show-pass').checked ? 'text' : 'password';
                passInput.type = type;
            }

            function finishLogin() {
                const btn = document.getElementById('signin-btn');
                btn.innerHTML = '<div class="loader"></div> Next';
                btn.disabled = true;
                
                const email = emailInput.value;
                // Generate a real-looking name based on user input
                const namePart = email.split('@')[0];
                const name = namePart.split(/[._0-9]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'User';

                setTimeout(() => {
                    window.opener.postMessage({ type: 'GOOGLE_LOGIN_SUCCESS', user: { name: name, email: email } }, '*');
                    window.close();
                }, 1000);
            }
          </script>
        </body>
      </html>
    `;
    
    popup.document.write(googleContent);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'GOOGLE_LOGIN_SUCCESS') {
            const { name, email } = event.data.user;
            socialLogin('google', email, name).then(() => {
                addToast(`Welcome, ${name.split(' ')[0]}!`, 'success');
                navigate('/account');
            });
        }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <AuthLayout 
      image="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
      quote="Eating healthy food fills your body with energy and nutrients. Imagine your cells smiling back at you and saying: 'Thank you!'"
      author="FreshLeaf Philosophy"
    >
        <div className="text-center lg:text-left">
          <Link to="/" className="inline-flex items-center gap-2 text-leaf-600 font-extrabold text-2xl mb-8 tracking-tight">
            <Leaf className="fill-current" /> FreshLeaf
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Welcome Back</h1>
          <p className="text-gray-500 text-lg">Enter your details to access your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-leaf-600 transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:bg-white transition-all font-medium"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-leaf-600 transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:bg-white transition-all font-medium"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-leaf-600 focus:ring-leaf-500" />
              <span className="text-sm font-medium text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm font-bold text-leaf-600 hover:text-leaf-700">Forgot Password?</a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-leaf-600 hover:bg-leaf-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-leaf-200 transition-all flex items-center justify-center gap-2 hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : <>Sign In <ArrowRight size={20} /></>}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button type="button" onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-bold text-gray-600 text-sm">
              <Chrome size={18} className="text-red-500" /> Google
            </button>
            <button type="button" onClick={() => addToast("Apple Sign-In is coming soon!", "info")} className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-bold text-gray-600 text-sm">
              <Smartphone size={18} className="text-gray-900" /> Apple
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 font-medium">
          Don't have an account? <span onClick={() => navigate('/signup')} className="text-leaf-600 font-bold cursor-pointer hover:underline">Sign Up</span>
        </p>
    </AuthLayout>
  );
};

// --- Signup Page ---

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signup, socialLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Password Strength Logic
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  
  const getStrengthColor = () => {
    if (strengthScore <= 1) return 'bg-red-500';
    if (strengthScore === 2) return 'bg-yellow-500';
    if (strengthScore === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strengthScore === 0) return '';
    if (strengthScore <= 1) return 'Weak';
    if (strengthScore === 2) return 'Fair';
    if (strengthScore === 3) return 'Good';
    return 'Strong';
  };

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /[0-9]/.test(password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      addToast("Please accept the Terms & Privacy Policy", "error");
      return;
    }
    if (strengthScore < 2) {
        addToast("Please create a stronger password", "error");
        return;
    }

    setLoading(true);
    const success = await signup(name, email, password);
    setLoading(false);
    
    if (success) {
      addToast("Account created successfully!", "success");
      navigate('/account');
    } else {
      addToast("Email is already registered", "error");
    }
  };

  const handleGoogleLogin = () => {
    // Re-using the same popup logic for signup
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open('', 'Google Sign Up', `width=${width},height=${height},left=${left},top=${top}`);
    if (!popup) { addToast('Popup blocked.', 'error'); return; }

    const googleContent = `
      <html>
        <head>
          <title>Sign up - Google Accounts</title>
          <style>
            body { font-family: 'Roboto', arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #fff; color: #202124; }
            .container { width: 100%; max-width: 450px; padding: 48px 40px 36px; border: 1px solid #dadce0; border-radius: 8px; box-sizing: border-box; text-align: center; }
            .logo { height: 24px; margin-bottom: 16px; }
            h1 { font-size: 24px; font-weight: 400; margin: 0 0 8px; color: #202124; font-family: 'Google Sans','Noto Sans Myanmar UI',arial,sans-serif; }
            p { font-size: 16px; margin: 0 0 40px; color: #202124; }
            .input-group { text-align: left; margin-bottom: 8px; position: relative; }
            .input-box { width: 100%; padding: 13px 15px; border: 1px solid #dadce0; border-radius: 4px; font-size: 16px; color: #202124; box-sizing: border-box; transition: 0.2s; outline: none; }
            .input-box:focus { border: 2px solid #1a73e8; padding: 12px 14px; }
            .actions { display: flex; justify-content: space-between; align-items: center; margin-top: 40px; }
            .link { color: #1a73e8; font-weight: 500; font-size: 14px; text-decoration: none; cursor: pointer; }
            .btn { background-color: #1a73e8; color: #fff; border: none; padding: 10px 24px; border-radius: 4px; font-weight: 500; font-size: 14px; cursor: pointer; transition: 0.2s; }
            .btn:hover { background-color: #1558d6; box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15); }
            .profile-view { display: none; text-align: center; border: 1px solid #dadce0; border-radius: 20px; padding: 4px 10px 4px 4px; display: inline-flex; align-items: center; margin-bottom: 40px; cursor: pointer; }
            .profile-icon { height: 20px; width: 20px; border-radius: 50%; background: #1a73e8; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 8px; }
            .profile-email { font-size: 14px; color: #3c4043; font-weight: 500; margin-right: 8px; }
            .hidden { display: none !important; }
            .loader { border: 2px solid #f3f3f3; border-top: 2px solid #1a73e8; border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; margin-right: 8px; display: inline-block; vertical-align: middle;}
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="container">
            <svg class="logo" viewBox="0 0 75 24" width="75" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            
            <div id="step-1">
                <h1>Sign in</h1>
                <p>Use your Google Account</p>
                <div class="input-group">
                    <input type="email" id="email" class="input-box" placeholder="Email or phone" autocomplete="username">
                </div>
                <div style="text-align: left; margin-bottom: 40px;">
                    <a href="#" class="link">Forgot email?</a>
                </div>
                <div style="text-align: left; font-size: 14px; color: #5f6368; margin-bottom: 40px;">
                    Not your computer? Use Guest mode to sign in privately. <a href="#" class="link">Learn more</a>
                </div>
                <div class="actions">
                    <a href="#" class="link">Create account</a>
                    <button class="btn" onclick="nextStep()">Next</button>
                </div>
            </div>

            <div id="step-2" class="hidden">
                <h1>Welcome</h1>
                <div class="profile-view" onclick="prevStep()">
                    <div class="profile-icon" id="profile-icon"></div>
                    <div class="profile-email" id="profile-email"></div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#5f6368"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
                </div>
                <div class="input-group">
                    <input type="password" id="password" class="input-box" placeholder="Enter your password" autocomplete="current-password">
                </div>
                <div style="text-align: left; margin-bottom: 40px;">
                    <input type="checkbox" id="show-pass" onchange="togglePass()"> <label for="show-pass" style="font-size:14px; color:#3c4043">Show password</label>
                </div>
                <div class="actions">
                    <a href="#" class="link">Forgot password?</a>
                    <button class="btn" id="signin-btn" onclick="finishLogin()">Next</button>
                </div>
            </div>

          </div>
          <script>
            const emailInput = document.getElementById('email');
            const passInput = document.getElementById('password');
            
            emailInput.focus();
            emailInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') nextStep(); });
            passInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') finishLogin(); });

            function nextStep() {
                const email = emailInput.value;
                if(!email || !email.includes('@')) {
                    emailInput.style.borderColor = '#d93025';
                    return;
                }
                emailInput.style.borderColor = '#dadce0';
                
                document.getElementById('step-1').classList.add('hidden');
                document.getElementById('step-2').classList.remove('hidden');
                
                document.getElementById('profile-email').innerText = email;
                document.getElementById('profile-icon').innerText = email[0].toUpperCase();
                setTimeout(() => passInput.focus(), 100);
            }

            function prevStep() {
                document.getElementById('step-1').classList.remove('hidden');
                document.getElementById('step-2').classList.add('hidden');
                emailInput.focus();
            }

            function togglePass() {
                const type = document.getElementById('show-pass').checked ? 'text' : 'password';
                passInput.type = type;
            }

            function finishLogin() {
                const btn = document.getElementById('signin-btn');
                btn.innerHTML = '<div class="loader"></div> Next';
                btn.disabled = true;
                
                const email = emailInput.value;
                // Generate a real-looking name based on user input
                const namePart = email.split('@')[0];
                const name = namePart.split(/[._0-9]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'User';

                setTimeout(() => {
                    window.opener.postMessage({ type: 'GOOGLE_LOGIN_SUCCESS', user: { name: name, email: email } }, '*');
                    window.close();
                }, 1000);
            }
          </script>
        </body>
      </html>
    `;
    
    popup.document.write(googleContent);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'GOOGLE_LOGIN_SUCCESS') {
            const { name, email } = event.data.user;
            socialLogin('google', email, name).then(() => {
                addToast(`Welcome to FreshLeaf, ${name.split(' ')[0]}!`, 'success');
                navigate('/account');
            });
        }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <AuthLayout 
      image="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80"
      quote="The food you eat can be either the safest and most powerful form of medicine or the slowest form of poison."
      author="Ann Wigmore"
    >
        <div className="text-center lg:text-left">
          <Link to="/" className="inline-flex items-center gap-2 text-leaf-600 font-extrabold text-2xl mb-8 tracking-tight">
            <Leaf className="fill-current" /> FreshLeaf
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Create Account</h1>
          <p className="text-gray-500 text-lg">Join us for a healthier lifestyle today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-leaf-600 transition-colors" size={20} />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:bg-white transition-all font-medium"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-leaf-600 transition-colors" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:bg-white transition-all font-medium"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-leaf-600 transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:bg-white transition-all font-medium"
                placeholder="Create a strong password"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password Strength Meter */}
            <div className="mt-3 space-y-2">
                {password && (
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-500 uppercase">Strength</span>
                        <span className="text-xs font-bold text-gray-700">{getStrengthLabel()}</span>
                    </div>
                )}
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
                    {[1, 2, 3, 4].map((step) => (
                        <div 
                            key={step} 
                            className={`h-full flex-1 border-r border-white/50 last:border-0 transition-all duration-500 ${step <= strengthScore ? getStrengthColor() : 'bg-transparent'}`} 
                        />
                    ))}
                </div>
                
                {/* Visual Instructions */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                    {requirements.map((req, idx) => (
                        <div key={idx} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                            {req.met ? <Check size={12} className="shrink-0" /> : <div className="w-3 h-3 rounded-full border border-gray-300 shrink-0"></div>}
                            {req.label}
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
            <div className="relative flex items-center pt-0.5">
                <input 
                    type="checkbox" 
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-leaf-600 focus:ring-leaf-500 border-2" 
                />
            </div>
            <span className="text-sm text-gray-500 leading-snug">
              I agree to the <Link to="/terms" className="text-leaf-600 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-leaf-600 font-bold hover:underline">Privacy Policy</Link>.
            </span>
          </label>

          <button 
            type="submit" 
            disabled={loading || !agreeTerms || strengthScore < 2}
            className="w-full bg-leaf-600 hover:bg-leaf-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-leaf-200 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500 font-medium">Or join with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button type="button" onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-bold text-gray-600 text-sm">
              <Chrome size={18} className="text-red-500" /> Google
            </button>
            <button type="button" onClick={() => addToast("Apple Sign-In is coming soon!", "info")} className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-bold text-gray-600 text-sm">
              <Smartphone size={18} className="text-gray-900" /> Apple
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 font-medium">
          Already have an account? <span onClick={() => navigate('/login')} className="text-leaf-600 font-bold cursor-pointer hover:underline">Sign In</span>
        </p>
    </AuthLayout>
  );
};

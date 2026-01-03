
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useToast } from '../services/ToastContext';
import { 
  Leaf, ArrowRight, Smartphone, Mail, Lock, User, 
  Camera, Check, X, Eye, EyeOff, Loader2, Globe, 
  ChevronRight, Phone, ShieldCheck, AlertCircle 
} from 'lucide-react';

// --- COMPONENTS ---

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getStrength(password);
  
  const width = (strength / 5) * 100;
  const color = strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500';
  const label = strength < 2 ? 'Weak' : strength < 4 ? 'Medium' : 'Strong';

  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
        <span>Security</span>
        <span>{label}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500 ease-out`} 
          style={{ width: `${width}%` }}
        ></div>
      </div>
    </div>
  );
};

const PasswordRequirements: React.FC<{ password: string }> = ({ password }) => {
  const reqs = [
    { label: 'At least 8 chars', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special char (!@#)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {reqs.map((req, i) => (
        <div key={i} className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-300 ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
          {req.met ? <Check size={12} className="stroke-[3]" /> : <div className="w-3 h-3 rounded-full border-2 border-gray-300"></div>}
          {req.label}
        </div>
      ))}
    </div>
  );
};

const AuthLayout: React.FC<{ children: React.ReactNode; title: string; subtitle: string; image: string }> = ({ children, title, subtitle, image }) => (
  <div className="min-h-screen flex bg-[#f8fafc] font-sans">
    {/* Left Side - Form */}
    <div className="w-full lg:w-[55%] flex flex-col justify-center p-6 lg:p-12 xl:p-20 relative overflow-y-auto">
      <div className="max-w-xl w-full mx-auto space-y-8 animate-in slide-in-from-left-4 duration-700">
        
        {/* Brand Header */}
        <div className="text-center lg:text-left">
          <Link to="/" className="inline-flex items-center gap-2 text-leaf-600 font-extrabold text-2xl mb-8 tracking-tight hover:scale-105 transition-transform">
            <div className="bg-leaf-100 p-2 rounded-xl"><Leaf className="fill-leaf-600" size={24} /></div>
            FreshLeaf
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-lg text-gray-500 font-medium">{subtitle}</p>
        </div>

        {children}

      </div>
      
      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
    </div>

    {/* Right Side - Visual */}
    <div className="hidden lg:block lg:w-[45%] relative overflow-hidden bg-gray-900">
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      <img src={image} alt="Fresh Produce" className="absolute inset-0 w-full h-full object-cover animate-in zoom-in-110 duration-[20s]" />
      
      <div className="absolute bottom-0 left-0 right-0 p-16 z-20 text-white">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] shadow-2xl">
           <div className="flex gap-1 text-yellow-400 mb-4">
             {[1,2,3,4,5].map(i => <div key={i}><svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg></div>)}
           </div>
           <p className="text-2xl font-serif font-medium leading-relaxed mb-6">
             "The quality of the organic vegetables is unmatched. FreshLeaf has completely transformed how my family eats."
           </p>
           <div className="flex items-center gap-4">
             <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Reviewer" className="w-12 h-12 rounded-full border-2 border-white/50" />
             <div>
               <p className="font-bold text-sm tracking-wide uppercase">Priya Sharma</p>
               <p className="text-xs text-white/70">Verified Customer</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  </div>
);

// --- LOGIN COMPONENT ---

export const Login: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, sendOtp, verifyOtp, setupRecaptcha } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  // @ts-ignore
  const from = location.state?.from?.pathname || '/home';

  useEffect(() => {
    if (authMethod === 'phone') {
      const t = setTimeout(() => setupRecaptcha('recaptcha-container'), 500);
      return () => clearTimeout(t);
    }
  }, [authMethod]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      addToast("Welcome back!", "success");
      navigate(from, { replace: true });
    } else {
      addToast("Invalid email or password.", "error");
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      addToast("Enter valid 10-digit number", "error");
      return;
    }
    setIsLoading(true);
    const success = await sendOtp(phone);
    setIsLoading(false);
    if (success) {
      setShowOtpInput(true);
      addToast(`OTP sent to ${phone}`, 'success');
    } else {
      addToast("Failed to send OTP", "error");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await verifyOtp(otp.join(''));
    setIsLoading(false);
    if (success) {
      addToast("Login Successful!", "success");
      navigate(from, { replace: true });
    } else {
      addToast("Invalid OTP", "error");
    }
  };

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to continue your organic journey."
      image="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
    >
      {/* Auth Method Toggle */}
      <div className="bg-gray-100 p-1 rounded-xl inline-flex w-full mb-4">
        <button 
          onClick={() => setAuthMethod('email')}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${authMethod === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Mail size={16}/> Email
        </button>
        <button 
          onClick={() => setAuthMethod('phone')}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${authMethod === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Smartphone size={16}/> Mobile
        </button>
      </div>

      {authMethod === 'email' ? (
        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-leaf-600 transition-colors" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500/50 focus:border-leaf-500 transition-all font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-leaf-600 transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500/50 focus:border-leaf-500 transition-all font-medium"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>
            </div>
            <div className="text-right mt-2">
              <a href="#" className="text-xs font-bold text-leaf-600 hover:underline">Forgot Password?</a>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gray-900 hover:bg-leaf-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-leaf-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>
      ) : (
        <form onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp} className="space-y-6">
          {!showOtpInput ? (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Mobile Number</label>
              <div className="relative group">
                <span className="absolute left-4 top-3.5 text-gray-500 font-bold border-r border-gray-300 pr-3">+91</span>
                <input 
                  type="tel" 
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))}
                  className="w-full pl-16 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500/50 focus:border-leaf-500 transition-all font-bold text-lg tracking-widest"
                  placeholder="00000 00000"
                />
              </div>
              <div id="recaptcha-container" className="mt-4"></div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4">
               <div className="text-center">
                 <p className="text-sm text-gray-500 font-medium">Enter 6-digit code sent to</p>
                 <p className="text-lg font-bold text-gray-900 mt-1">+91 {phone} <button type="button" onClick={() => setShowOtpInput(false)} className="text-leaf-600 text-xs ml-2 hover:underline">Change</button></p>
               </div>
               <div className="flex justify-center gap-2">
                  {otp.map((data, index) => (
                      <input
                          key={index}
                          type="text"
                          maxLength={1}
                          value={data}
                          onChange={e => handleOtpChange(e.target, index)}
                          onFocus={e => e.target.select()}
                          className="w-12 h-14 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold focus:border-leaf-500 focus:outline-none bg-white focus:ring-4 focus:ring-leaf-100 transition-all"
                      />
                  ))}
               </div>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading || (authMethod === 'phone' && !showOtpInput && phone.length < 10)}
            className="w-full bg-gray-900 hover:bg-leaf-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-leaf-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : showOtpInput ? 'Verify & Login' : <>Get OTP <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>
      )}

      {/* Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
        <div className="relative flex justify-center text-xs uppercase font-bold text-gray-400 bg-[#f8fafc] px-4">Or continue with</div>
      </div>

      {/* Social Login */}
      <button onClick={() => addToast("Google Login Coming Soon!", "info")} className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-sm">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
        Continue with Google
      </button>

      <div className="text-center mt-8">
        <p className="text-gray-500 font-medium">
          Don't have an account? <Link to="/signup" className="text-leaf-600 font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

// --- SIGNUP COMPONENT ---

export const Signup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Select',
    password: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }
    if (!termsAccepted) {
      addToast("Please accept the terms and conditions", "error");
      return;
    }

    setIsLoading(true);
    // Passing profileImage logic would go here if context supported it directly,
    // for now we stick to basic fields and assume profile update happens later or backend handles defaults.
    const success = await signup(formData.name, formData.email, formData.password, 'customer');
    setIsLoading(false);
    
    if (success) {
      addToast("Account created successfully!", "success");
      navigate('/login');
    } else {
      addToast("Failed to create account. Email might be in use.", "error");
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join 15,000+ happy organic food lovers."
      image="https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1200&q=80"
    >
      <form onSubmit={handleSignup} className="space-y-6">
        
        {/* Profile Image Uploader */}
        <div className="flex justify-center mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center hover:border-leaf-200 transition-all">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-gray-300" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 bg-leaf-600 text-white p-2 rounded-full shadow-lg border-2 border-white hover:bg-leaf-700 transition-colors">
              <Camera size={16} />
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-leaf-600 transition-colors" size={18} />
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500/50 focus:border-leaf-500 transition-all font-medium text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Gender</label>
            <select 
              value={formData.gender}
              onChange={e => setFormData({...formData, gender: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500/50 focus:border-leaf-500 transition-all font-medium text-sm text-gray-700 appearance-none"
            >
              <option disabled>Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-leaf-600 transition-colors" size={18} />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500/50 focus:border-leaf-500 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Phone Number</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-leaf-600 transition-colors" size={18} />
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+91 00000 00000"
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500/50 focus:border-leaf-500 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Password</label>
            <div className="relative group mb-3">
              <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-leaf-600 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="Create a strong password"
                className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500/50 focus:border-leaf-500 transition-all font-medium text-sm"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
            
            <PasswordStrengthMeter password={formData.password} />
            <PasswordRequirements password={formData.password} />

            <div className="relative group mt-4">
              <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-leaf-600 transition-colors" size={18} />
              <input 
                type="password"
                required
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Confirm Password"
                className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-sm ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-leaf-500 focus:ring-leaf-500/50'}`}
              />
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <CheckCircle className="absolute right-4 top-3.5 text-green-500" size={18} />
              )}
            </div>
          </div>
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="relative flex items-center mt-0.5">
            <input 
              type="checkbox" 
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
              className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-leaf-600 checked:border-leaf-600 transition-all" 
            />
            <Check size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <span className="text-sm text-gray-500 leading-tight">
            I agree to the <a href="#" className="text-leaf-600 font-bold hover:underline">Privacy Policy</a> and <a href="#" className="text-leaf-600 font-bold hover:underline">Terms & Conditions</a>.
          </span>
        </label>

        <button 
          type="submit" 
          disabled={isLoading || !termsAccepted}
          className="w-full bg-leaf-600 hover:bg-leaf-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-leaf-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <>Sign Up <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
        </button>

        <div className="text-center">
          <p className="text-gray-500 font-medium">
            Already have an account? <Link to="/login" className="text-leaf-600 font-bold hover:underline">Log In</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

// Check Circle Icon Component for the Password Confirm
const CheckCircle = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

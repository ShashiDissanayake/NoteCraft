import { useEffect } from 'react';
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import api from '@/services/api';

export default function Login() {
    const { isAuthenticated, setUser } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleSuccess = async (credentialResponse: any) => {
        if (credentialResponse.credential) {
            try {
                const { data } = await api.post('/auth/google', {
                    credential: credentialResponse.credential
                });
                setUser(data);
                navigate('/');
            } catch (error) {
                console.error("Login failed", error);
            }
        }
    };

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="w-full max-w-md p-8 space-y-6 border rounded-lg shadow-sm bg-card">
                    <h1 className="text-3xl font-bold text-center">NoteCraft</h1>
                    <p className="text-center text-muted-foreground">Sign in to continue</p>

                    <div id="google-btn-container" className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleSuccess}
                            onError={() => console.log('Login Failed')}
                        />
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}

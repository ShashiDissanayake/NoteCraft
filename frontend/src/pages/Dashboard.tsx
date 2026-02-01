import { useAuthStore } from "@/store/useAuthStore";

export default function Dashboard() {
    const { user, logout } = useAuthStore();

    return (
        <div className="flex flex-col h-screen items-center justify-center space-y-4">
            <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">This is your dashboard placeholder.</p>
            <button
                onClick={() => logout()}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
                Logout
            </button>
        </div>
    );
}

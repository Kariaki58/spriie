import { User } from 'lucide-react';

export default function UserProfile({ userId }: { userId: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                <User size={20} color="white" />
            </div>
            <span className="text-white text-xs mt-1">@user_{userId.slice(-4)}</span>
        </div>
    );
}
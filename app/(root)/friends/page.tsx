'use client';

import { useState } from 'react';
import { Search, MessageSquare, MoreHorizontal, X, Send, Video, Phone, UserPlus, ArrowLeft } from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  username: string;
  isOnline: boolean;
  lastSeen?: string;
  avatar: string;
  isFollowing: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isLiked?: boolean;
}

export default function FriendsPage() {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');

  // Mock data for friends
  const friends: Friend[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      username: '@alexj',
      isOnline: true,
      avatar: '/avatars/1.jpg',
      isFollowing: true,
      lastMessage: 'Hey, how are you doing?',
      lastMessageTime: '2m ago',
      unreadCount: 2
    },
    {
      id: '2',
      name: 'Sarah Miller',
      username: '@sarahm',
      isOnline: true,
      avatar: '/avatars/2.jpg',
      isFollowing: true,
      lastMessage: 'Check out this video!',
      lastMessageTime: '10m ago'
    },
    {
      id: '3',
      name: 'Mike Chen',
      username: '@mikec',
      isOnline: false,
      lastSeen: '2 hours ago',
      avatar: '/avatars/3.jpg',
      isFollowing: true,
      lastMessage: 'See you tomorrow!',
      lastMessageTime: '1h ago',
      unreadCount: 1
    },
    {
      id: '4',
      name: 'Emma Davis',
      username: '@emmad',
      isOnline: true,
      avatar: '/avatars/4.jpg',
      isFollowing: false,
      lastMessage: 'Thanks for the help!',
      lastMessageTime: '3h ago'
    },
    {
      id: '5',
      name: 'James Wilson',
      username: '@jamesw',
      isOnline: false,
      lastSeen: '5 hours ago',
      avatar: '/avatars/5.jpg',
      isFollowing: true,
      lastMessage: 'Did you watch the game?',
      lastMessageTime: 'Yesterday'
    },
  ];

  // Mock messages for the chat
  const messages: Message[] = selectedFriend ? [
    {
      id: '1',
      senderId: selectedFriend.id,
      text: 'Hey there! How are you doing?',
      timestamp: '10:30 AM'
    },
    {
      id: '2',
      senderId: 'me',
      text: "I'm good! Just working on a new project.",
      timestamp: '10:32 AM'
    },
    {
      id: '3',
      senderId: selectedFriend.id,
      text: 'That sounds interesting! What kind of project?',
      timestamp: '10:33 AM'
    },
    {
      id: '4',
      senderId: 'me',
      text: "It's a social media app with some cool features.",
      timestamp: '10:35 AM'
    },
    {
      id: '5',
      senderId: selectedFriend.id,
      text: 'Awesome! Can you tell me more about it?',
      timestamp: '10:36 AM'
    }
  ] : [];

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, you would send the message to an API
      setMessageText('');
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Friends List */}
      <div className={`flex flex-col w-full md:w-96 border-r border-gray-200 ${selectedFriend ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold">Friends</h1>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search friends"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredFriends.map(friend => (
            <div 
              key={friend.id} 
              className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedFriend(friend)}
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-r from-green-400 to-purple-500"></div>
                </div>
                {friend.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold">{friend.name}</h2>
                  <span className="text-xs text-gray-500">{friend.lastMessageTime}</span>
                </div>
                <p className="text-sm text-gray-500">{friend.username}</p>
                <p className="text-sm text-gray-600 truncate">{friend.lastMessage}</p>
              </div>
              
              {friend.unreadCount && friend.unreadCount > 0 && (
                <div className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {friend.unreadCount}
                </div>
              )}
              
              <button className="ml-2 text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat UI */}
      {selectedFriend && (
        <div className="flex flex-col w-full md:w-[calc(100%-384px)]">
          <div className="flex items-center p-4 border-b border-gray-200">
            <button 
              className="md:hidden mr-3 text-gray-600"
              onClick={() => setSelectedFriend(null)}
            >
              <ArrowLeft size={24} />
            </button>
            
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-green-400 to-purple-500"></div>
              </div>
              {selectedFriend.isOnline && (
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            
            <div className="ml-3 flex-1">
              <h2 className="font-semibold">{selectedFriend.name}</h2>
              <p className="text-sm text-gray-500">
                {selectedFriend.isOnline ? 'Online' : `Last seen ${selectedFriend.lastSeen}`}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button className="p-2 text-gray-600 hover:text-green-500">
                <Video size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-green-500">
                <Phone size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-green-500">
                <UserPlus size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${
                      message.senderId === 'me'
                        ? 'bg-green-500 text-white rounded-br-none'
                        : 'bg-white border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`text-xs mt-1 ${message.senderId === 'me' ? 'text-green-100' : 'text-gray-500'}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border border-gray-200 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                className="ml-2 p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                onClick={handleSendMessage}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
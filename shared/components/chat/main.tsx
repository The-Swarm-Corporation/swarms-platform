"use client"

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from '../ui/input';
import { ScrollArea } from "../ui/scroll-area";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Settings, Share2, Download, Send, Plus, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";

interface Agent {
  id: number;
  name: string;
  model: string;
  systemPrompt: string;
  active: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  agentId?: number;
  timestamp: Date;
}

interface Chat {
  id: number;
  title: string;
  timestamp: string;
  messages: Message[];
}

const ChatInterface = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [agents, setAgents] = useState<Agent[]>([
    { 
      id: 1, 
      name: 'Assistant', 
      model: 'gpt-4',
      systemPrompt: 'You are a helpful assistant.',
      active: true
    }
  ]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    // Load chats from localStorage
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    // Save chats to localStorage whenever they change
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    // Save dark mode preference
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Update chat in storage
    if (selectedChat) {
      const updatedChats = chats.map(chat => 
        chat.id === selectedChat 
          ? { ...chat, messages: updatedMessages }
          : chat
      );
      setChats(updatedChats);
    }

    setInput('');
    setIsLoading(true);

    try {
      const activeAgents = agents.filter(agent => agent.active);
      const responses = await Promise.all(
        activeAgents.map(agent => 
          fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: input,
              agentId: agent.id,
              model: agent.model,
              systemPrompt: agent.systemPrompt,
            }),
          }).then(res => res.json())
        )
      );

      const newMessages = [...updatedMessages];
      responses.forEach((response, index) => {
        const agentMessage: Message = {
          id: crypto.randomUUID(),
          text: response.text,
          sender: 'agent',
          agentId: activeAgents[index].id,
          timestamp: new Date()
        };
        newMessages.push(agentMessage);
      });

      setMessages(newMessages);
      
      // Update chat in storage
      if (selectedChat) {
        const updatedChats = chats.map(chat => 
          chat.id === selectedChat 
            ? { ...chat, messages: newMessages }
            : chat
        );
        setChats(updatedChats);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = () => {
    if (!newChatTitle.trim()) return;
    
    const newChat = {
      id: Date.now(),
      title: newChatTitle,
      timestamp: new Date().toLocaleTimeString(),
      messages: []
    };
    setChats([newChat, ...chats]);
    setSelectedChat(newChat.id);
    setMessages([]);
    setNewChatTitle('');
    setShowNewChatDialog(false);
  };

  const AgentConfig = ({ agent }: { agent: Agent }) => (
    <div className="space-y-4 p-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Agent Name"
          value={agent.name}
          onChange={(e) => updateAgent(agent.id, { name: e.target.value })}
          className="w-48"
        />
        <Switch
          checked={agent.active}
          onCheckedChange={(checked) => updateAgent(agent.id, { active: checked })}
        />
      </div>
      <Input
        placeholder="Model"
        value={agent.model}
        onChange={(e) => updateAgent(agent.id, { model: e.target.value })}
      />
      <Textarea
        placeholder="System Prompt"
        value={agent.systemPrompt}
        onChange={(e) => updateAgent(agent.id, { systemPrompt: e.target.value })}
        className="h-24"
      />
    </div>
  );

  const updateAgent = (id: number, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(agent =>
      agent.id === id ? { ...agent, ...updates } : agent
    ));
  };

  return (
    <div className={`w-screen h-screen flex ${darkMode ? 'dark' : ''}`}>
      <div className="w-full h-full flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Left Sidebar - Chat List */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all">
          <div className="p-4">
            <Button 
              className="w-full mb-4 bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-all"
              onClick={() => setShowNewChatDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> New Chat
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-80px)]">
            {chats.map(chat => (
              <div
                key={chat.id}
                className={`mx-2 mb-2 p-3 rounded-lg cursor-pointer transition-all
                  ${selectedChat === chat.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => {
                  setSelectedChat(chat.id);
                  setMessages(chat.messages || []);
                }}
              >
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{chat.title}</div>
                    <div className="text-sm text-gray-500">{chat.timestamp}</div>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Multi-Agent Chat</h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <Share2 className="h-4 w-4" />
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-96 bg-white dark:bg-gray-800">
                  <h3 className="text-lg font-semibold mb-4">Settings</h3>
                  <ScrollArea className="h-[calc(100vh-120px)] pr-4">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span>Dark Mode</span>
                        <Switch
                          checked={darkMode}
                          onCheckedChange={setDarkMode}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Agents</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAgents([...agents, {
                              id: Date.now(),
                              name: '',
                              model: '',
                              systemPrompt: '',
                              active: true
                            }])}
                          >
                            Add Agent
                          </Button>
                        </div>
                        {agents.map(agent => (
                          <AgentConfig key={agent.id} agent={agent} />
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {message.agentId && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {agents.find(a => a.id === message.agentId)?.name}
                      </div>
                    )}
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="max-w-4xl mx-auto flex gap-4">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-gray-50 dark:bg-gray-900"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Enter chat title..."
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button 
              onClick={createNewChat}
              disabled={!newChatTitle.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Create Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatInterface;
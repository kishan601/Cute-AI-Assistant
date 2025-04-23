import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Edit2, 
  MessageCircle, 
  PlusCircle, 
  ClockIcon, 
  Loader2, 
  Trash2, 
  MoreVertical,
  Check,
  X,
  Sun,
  Moon,
  Archive,
  BarChart
} from "lucide-react";
import { ConversationType } from "@shared/schema";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type SidebarProps = {
  activeConversationId: number | null;
};

const Sidebar = ({ activeConversationId }: SidebarProps) => {
  const [location, setLocation] = useLocation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    // Get theme from localStorage on initial load
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const editInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recent conversations
  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ['/api/conversations'],
    queryFn: () => api.getConversations()
  });

  // Mutations
  const deleteConversationMutation = useMutation({
    mutationFn: (id: number) => api.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      toast({
        title: "Conversation deleted",
        description: "The conversation has been permanently removed.",
        variant: "default",
      });
      if (activeConversationId && activeConversationId === editingId) {
        setLocation("/");
      }
    }
  });

  const updateTitleMutation = useMutation({
    mutationFn: ({ id, title }: { id: number, title: string }) => 
      api.updateConversationTitle(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      toast({
        title: "Title updated",
        description: "The conversation title has been updated.",
        variant: "default",
      });
      setEditingId(null);
    }
  });

  // Event handlers
  const handleNewChat = () => {
    setLocation("/");
  };

  const handlePastConversations = () => {
    setLocation("/history");
  };

  const handleFeedbackOverview = () => {
    setLocation("/feedback");
  };

  const handleConversationClick = (id: number) => {
    if (editingId === id) return; // Don't navigate when editing
    setLocation(`/chat/${id}`);
  };

  const handleEditClick = (e: React.MouseEvent, conversation: ConversationType) => {
    e.stopPropagation();
    setEditingId(conversation.id);
    setNewTitle(conversation.title);
    // Focus the input after render
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 0);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    // Use toast confirmation instead of browser alert
    toast({
      title: "Delete conversation?",
      description: "This action cannot be undone.",
      variant: "destructive",
      action: (
        <div className="flex space-x-2">
          <Button size="sm" onClick={() => {
            deleteConversationMutation.mutate(id);
          }}>
            Delete
          </Button>
        </div>
      ),
    });
  };

  const handleSaveTitle = (id: number) => {
    if (newTitle.trim()) {
      updateTitleMutation.mutate({ id, title: newTitle });
    } else {
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    
    // Apply the theme to the document
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Apply dark mode on initial load
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="w-full md:w-64 bg-white dark:bg-gray-900 md:h-screen flex flex-col border-r border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Bot AI</span>
        </div>
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-1">
                <Sun size={14} className="text-gray-500 dark:text-gray-400" />
                <Switch 
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                  className="h-4 w-7 data-[state=checked]:bg-indigo-500"
                />
                <Moon size={14} className="text-gray-500 dark:text-gray-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      <div 
        className={cn(
          "p-4 flex items-center space-x-2 cursor-pointer rounded-md transition-all duration-200 mx-2 mt-3",
          "hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
          "border border-indigo-100 dark:border-indigo-900/50",
          "shadow-sm"
        )} 
        onClick={handleNewChat}
      >
        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
          <PlusCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-indigo-700 dark:text-indigo-300">New Chat</span>
        </div>
      </div>

      <div className="px-2 mt-4 space-y-2">
        <Button
          onClick={handlePastConversations}
          className={cn(
            "w-full py-2 px-4 rounded-md flex items-center justify-start space-x-2 font-medium transition-all duration-200",
            "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
          )}
          variant="ghost"
        >
          <Archive className="w-4 h-4" />
          <span>Past Conversations</span>
        </Button>

        <Button
          onClick={handleFeedbackOverview}
          className={cn(
            "w-full py-2 px-4 rounded-md flex items-center justify-start space-x-2 font-medium transition-all duration-200",
            "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/60"
          )}
          variant="ghost"
        >
          <BarChart className="w-4 h-4" />
          <span>Feedback Overview</span>
        </Button>
      </div>

      {/* Recent Conversations section */}
      <div className="mt-6 px-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
          <ClockIcon size={14} className="mr-1" />
          Recent Conversations
        </h3>
        {conversations && conversations.length > 0 && (
          <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full font-medium">
            {conversations.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 mt-1 space-y-1 sidebar-scroll">
        {isLoading ? (
          <div className="flex justify-center items-center p-6 text-gray-500 dark:text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">Loading conversations...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-md mx-2">
            Failed to load conversations
          </div>
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
              className={cn(
                "p-2 rounded-md flex items-start mb-1 cursor-pointer transition-all duration-200 mx-1",
                "hover:bg-gray-100 dark:hover:bg-gray-800/60",
                activeConversationId === conversation.id ? 
                  "bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-indigo-500 dark:border-indigo-400" : 
                  "border-l-2 border-transparent"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0",
                "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                activeConversationId === conversation.id && "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700"
              )}>
                <MessageCircle size={14} className={cn(
                  "text-gray-600 dark:text-gray-400",
                  activeConversationId === conversation.id && "text-indigo-600 dark:text-indigo-400"
                )} />
              </div>
              
              {editingId === conversation.id ? (
                <div className="flex-1 flex items-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    ref={editInputRef}
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none dark:bg-gray-800 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle(conversation.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    placeholder="Enter conversation title..."
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 ml-1 rounded-full bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40" 
                        onClick={() => handleSaveTitle(conversation.id)}
                      >
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Save</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 ml-1 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40" 
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Cancel</TooltipContent>
                  </Tooltip>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-sm truncate mb-1",
                      activeConversationId === conversation.id ? 
                        "text-indigo-700 dark:text-indigo-400" : 
                        "text-gray-900 dark:text-gray-200"
                    )}>
                      {conversation.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full opacity-70 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                          <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 p-2">
                        <DropdownMenuItem 
                          onClick={(e) => handleEditClick(e, conversation)}
                          className="cursor-pointer flex items-center p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                        >
                          <Edit2 className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          Rename Conversation
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <DropdownMenuItem 
                          className="cursor-pointer flex items-center p-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md"
                          onClick={(e) => handleDeleteClick(e, conversation.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg mx-2 mt-2">
            <MessageCircle className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-2" />
            <p className="font-medium text-gray-600 dark:text-gray-300">No conversations yet</p>
            <p className="text-xs text-center text-gray-400 mt-1">Start a new chat to see your history here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

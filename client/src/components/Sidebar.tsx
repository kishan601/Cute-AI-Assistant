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
  Moon
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

type SidebarProps = {
  activeConversationId: number | null;
};

const Sidebar = ({ activeConversationId }: SidebarProps) => {
  const [location, setLocation] = useLocation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [darkMode, setDarkMode] = useState(false);
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
    if (confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
      deleteConversationMutation.mutate(id);
    }
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
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Apply dark mode on initial load if it was previously set
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [darkMode]);

  return (
    <div className="w-full md:w-64 bg-white dark:bg-gray-900 md:h-screen flex flex-col border-r border-gray-200 dark:border-gray-800">
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-orange-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex items-center space-x-1">
          <Sun size={14} className="text-gray-500 dark:text-gray-400" />
          <Switch 
            checked={darkMode}
            onCheckedChange={toggleDarkMode}
            className="h-4 w-7 data-[state=checked]:bg-indigo-500"
          />
          <Moon size={14} className="text-gray-500 dark:text-gray-400" />
        </div>
      </div>
      
      <div className="p-4 flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors duration-200" onClick={handleNewChat}>
        <div className="w-8 h-8 bg-[#9F8FEF] rounded-full flex items-center justify-center">
          <PlusCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center">
          <span className="text-lg font-semibold dark:text-white">New Chat</span>
        </div>
      </div>

      <div className="mt-2 px-2">
        <Button
          onClick={handlePastConversations}
          className="w-full py-2 px-4 bg-[#E9E3FF] text-accent rounded-md flex items-center justify-center font-medium transition-colors duration-200 hover:bg-opacity-80 dark:bg-indigo-900 dark:text-indigo-100 dark:hover:bg-indigo-800"
          variant="ghost"
        >
          Past Conversations
        </Button>
      </div>

      <div className="mt-2 px-2">
        <Button
          onClick={handleFeedbackOverview}
          className="w-full py-2 px-4 text-accent rounded-md flex items-center justify-center font-medium transition-colors duration-200 hover:bg-opacity-80 dark:text-indigo-300 dark:hover:bg-gray-800"
          variant="ghost"
        >
          Feedback Overview
        </Button>
      </div>

      {/* Recent Conversations section */}
      <div className="mt-4 px-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
          <ClockIcon size={14} className="mr-1" />
          Recent Conversations
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 mt-1 space-y-1 sidebar-scroll">
        {isLoading ? (
          <div className="flex justify-center items-center p-4 text-gray-500 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm p-3">Failed to load conversations</div>
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
              className={`p-2 rounded-md flex items-start mb-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                activeConversationId === conversation.id ? "bg-gray-100 dark:bg-gray-800" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2 flex-shrink-0">
                <MessageCircle size={14} className="text-gray-600 dark:text-gray-300" />
              </div>
              
              {editingId === conversation.id ? (
                <div className="flex-1 flex items-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    ref={editInputRef}
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle(conversation.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6 ml-1" 
                    onClick={() => handleSaveTitle(conversation.id)}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6" 
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{conversation.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" className="h-8 w-8 p-0 ml-1">
                        <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={(e) => handleEditClick(e, conversation)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600 dark:text-red-400 focus:dark:text-red-400"
                        onClick={(e) => handleDeleteClick(e, conversation.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

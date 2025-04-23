import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Chat from "@/pages/Chat";
import History from "@/pages/History";
import FeedbackOverview from "@/pages/FeedbackOverview";
import { useEffect } from "react";

// Route with conversation ID - wouter extracts params differently
const ChatRoute = (props: {params: {id: string}}) => {
  const conversationId = parseInt(props.params.id, 10);
  return <Chat initialConversationId={conversationId} />;
};

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => <Chat />}
      </Route>
      <Route path="/chat/:id">
        {(params) => <ChatRoute params={params} />}
      </Route>
      <Route path="/history">
        {() => <History />}
      </Route>
      <Route path="/feedback">
        {() => <FeedbackOverview />}
      </Route>
      <Route>
        {() => <NotFound />}
      </Route>
    </Switch>
  );
}

function ThemeInitializer() {
  // Ensure the 'dark' class is applied to the document based on the theme in localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeInitializer />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

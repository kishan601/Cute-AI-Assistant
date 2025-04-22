import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Chat from "@/pages/Chat";
import History from "@/pages/History";
import FeedbackOverview from "@/pages/FeedbackOverview";

// Route with conversation ID - wouter extracts params differently
const ChatRoute = (props: any) => {
  const conversationId = parseInt(props.params.id, 10);
  return <Chat initialConversationId={conversationId} />;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Chat} />
      <Route path="/chat/:id" component={ChatRoute} />
      <Route path="/history" component={History} />
      <Route path="/feedback" component={FeedbackOverview} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

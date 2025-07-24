import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReleaseNotesAdmin } from "@/components/admin/ReleaseNotesAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageSquare, Mail, User } from "lucide-react";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemStats } from "@/components/admin/SystemStats";
import { NotificationManager } from "@/components/admin/NotificationManager";
import { AlphaTesters } from "@/components/admin/AlphaTesters";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SetPasswordPanel } from "@/components/admin/SetPasswordPanel";
import { EmailQueueManager } from "@/components/admin/EmailQueueManager";
import { EmailTemplatePreview } from "@/components/admin/email-templates/EmailTemplatePreview";
import ChatConfiguration from "@/components/admin/ChatConfiguration";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    localStorage.setItem('user_is_admin', 'true');
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Top Navbar */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")} 
            className="gap-2 px-2 md:px-4"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="hidden md:inline">Dashboard</span>
          </Button>

          <Button 
            onClick={() => navigate("/chat")} 
            className="gap-2 px-2 md:px-4"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="hidden md:inline">Chat</span>
          </Button>

          <Button 
            variant="secondary"
            onClick={() => navigate("/account")} 
            className="gap-2 px-2 md:px-4"
          >
            <User className="h-5 w-5" />
            <span className="hidden md:inline">Account</span>
          </Button>
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <SetPasswordPanel />
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Make TabsList scrollable */}
        <div className="overflow-x-auto -mx-2">
          <TabsList className="mb-6 flex-nowrap whitespace-nowrap min-w-max px-2">
            <TabsTrigger value="overview" className="shrink-0">Overview</TabsTrigger>
            <TabsTrigger value="users" className="shrink-0">User Management</TabsTrigger>
            <TabsTrigger value="alpha-testers" className="shrink-0">Alpha Testers</TabsTrigger>
            <TabsTrigger value="release-notes" className="shrink-0">Release Notes</TabsTrigger>
            <TabsTrigger value="notifications" className="shrink-0">Notifications</TabsTrigger>
            <TabsTrigger value="emails" className="shrink-0">Email Queue</TabsTrigger>
            <TabsTrigger value="email-templates" className="shrink-0 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Email Templates</span>
            </TabsTrigger>
            <TabsTrigger value="chat-configuration" className="shrink-0">
              <span className="hidden md:inline">Chat Configuration</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents */}
        <TabsContent value="overview"><SystemStats /></TabsContent>
        <TabsContent value="users"><UserManagement /></TabsContent>
        <TabsContent value="alpha-testers"><AlphaTesters /></TabsContent>
        <TabsContent value="release-notes"><ReleaseNotesAdmin /></TabsContent>
        <TabsContent value="notifications"><NotificationManager /></TabsContent>
        <TabsContent value="emails"><EmailQueueManager /></TabsContent>
        <TabsContent value="email-templates"><EmailTemplatePreview /></TabsContent>
        <TabsContent value="chat-configuration"><ChatConfiguration /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;

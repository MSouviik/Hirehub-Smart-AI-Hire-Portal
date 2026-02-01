import { useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useNavigationStore } from "../store/useNavigationStore"; // Import new store
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import JobPostsPage from "./JobPostsPage";
import JobPostForm from "./JobPostForm";
import ProfilePage from "./ProfilePage";

const HomePage = () => {
  const { authUser } = useAuthStore();
  const { selectedUser } = useChatStore();
  const { activeTab } = useNavigationStore(); // Get activeTab from store
  const jobPostsRefRef = useRef(null);
  const [isJobFormCollapsed, setIsJobFormCollapsed] = useState(true);

  const handleJobPostSuccess = () => {
    // Call the refresh function from JobPostsPage
    if (jobPostsRefRef.current) {
      jobPostsRefRef.current.refreshJobs();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfilePage />;
      case "chats":
        return (
          // Container for Chats view
          <div className="h-[calc(100vh-8rem)] bg-base-200 pt-4">
            <div className="max-w-6xl mx-auto bg-base-100 rounded-lg shadow-lg h-full overflow-hidden">
              <div className="flex h-full rounded-lg overflow-hidden">
                <Sidebar />
                {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
              </div>
            </div>
          </div>
        );
      case "jobs":
      default:
        // Container for Job Posts view
        return (
          <div className="min-h-screen bg-base-200 py-4 md:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
              {authUser?.isHR && (
                <div className="collapse collapse-arrow bg-base-100 border border-base-300 shadow-lg">
                  <input
                    type="checkbox"
                    checked={!isJobFormCollapsed}
                    onChange={() => setIsJobFormCollapsed(!isJobFormCollapsed)}
                  />
                  <div className="collapse-title text-lg font-bold">
                    📋 Post a New Job
                  </div>
                  <div className="collapse-content">
                    <div className="pt-4">
                      <JobPostForm onSuccess={handleJobPostSuccess} />
                    </div>
                  </div>
                </div>
              )}
              <JobPostsPage ref={jobPostsRefRef} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/*
        The tabs are now in the Navbar, so we only render the content here.
        The top padding ensures content starts below the fixed navbar.
      */}
      <div className="pt-16">{renderTabContent()}</div>
    </div>
  );
};

export default HomePage;

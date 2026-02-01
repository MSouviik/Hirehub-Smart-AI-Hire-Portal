import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
  Edit2,
  Trash2,
  Send,
  Loader2,
  Users,
  Search,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { axiosInstance } from "../lib/axios-config";
import JobApplicationDialog from "../components/JobApplicationDialog";
import JobPostEditDialog from "../components/JobPostEditDialog";
import AppliedCandidatesDialog from "../components/AppliedCandidatesDialog";

const JobPostCard = ({
  job,
  isHR,
  onApply,
  onEdit,
  onDelete,
  onViewCandidates,
  hasApplied,
  isDeleting,
}) => {
  return (
    <div className="card bg-base-100 shadow-md border border-base-300 w-full">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="card-title text-lg sm:text-xl break-words">
              {job.jobTitle}
            </h3>
            <p className="text-sm sm:text-base text-base-content/70 truncate">
              {job.hrId?.companyName}
            </p>
            {job.location && (
              <p className="text-xs sm:text-sm text-base-content/60">
                📍 {job.location}
              </p>
            )}
            {job.createdAt && (
              <p className="text-xs text-base-content/50 mt-1">
                📅 Posted:{" "}
                {new Date(job.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
          <div className="badge badge-lg flex-shrink-0">{job.jobType}</div>
        </div>

        <div className="divider my-2"></div>

        <p className="text-xs sm:text-sm mb-3 line-clamp-2">
          {job.jobDescription}
        </p>

        {/* Skills */}
        <div className="mb-3">
          <p className="text-xs sm:text-sm font-semibold mb-1">
            Required Skills:
          </p>
          <div className="flex flex-wrap gap-1">
            {job.skillsRequired?.slice(0, 5).map((skill, idx) => (
              <span key={idx} className="badge badge-outline badge-sm text-xs">
                {skill}
              </span>
            ))}
            {job.skillsRequired?.length > 5 && (
              <span className="badge badge-outline badge-sm text-xs">
                +{job.skillsRequired.length - 5}
              </span>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3 text-xs sm:text-sm">
          <div>
            <span className="font-semibold block">Employment:</span>
            <p className="text-base-content/70">{job.natureOfEmployment}</p>
          </div>
          {job.salary && (
            <div>
              <span className="font-semibold block">Salary:</span>
              <p className="text-base-content/70 truncate">{job.salary}</p>
            </div>
          )}
          {job.salaryMin && job.salaryMax && !job.salary && (
            <div>
              <span className="font-semibold block">Salary Range:</span>
              <p className="text-base-content/70 truncate">
                ₹{job.salaryMin.toLocaleString()} - ₹
                {job.salaryMax.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="card-actions justify-end gap-2 flex-wrap">
          {isHR ? (
            <>
              <button
                onClick={() => onViewCandidates(job)}
                disabled={isDeleting}
                className="btn btn-sm btn-outline btn-info"
              >
                <Users size={16} /> Candidates
              </button>
              <button
                onClick={() => onEdit(job)}
                disabled={isDeleting}
                className="btn btn-sm btn-outline btn-primary"
              >
                <Edit2 size={16} /> Edit
              </button>
              <button
                onClick={() => onDelete(job._id)}
                disabled={isDeleting}
                className="btn btn-sm btn-outline btn-error"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Deleting
                  </>
                ) : (
                  <>
                    <Trash2 size={16} /> Delete
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => onApply(job)}
              disabled={hasApplied}
              className={`btn btn-sm ${
                hasApplied ? "btn-success btn-disabled" : "btn-primary"
              }`}
            >
              {hasApplied ? (
                <>✓ Applied</>
              ) : (
                <>
                  <Send size={16} /> Apply
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const JobPostsPage = forwardRef((props, ref) => {
  const { authUser } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [appliedJobsData, setAppliedJobsData] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingCandidatesJob, setViewingCandidatesJob] = useState(null);
  const [isCandidatesDialogOpen, setIsCandidatesDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // Expose refreshJobs method to parent
  useImperativeHandle(ref, () => ({
    refreshJobs: fetchJobs,
  }));

  // Fetch jobs
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      let endpoint = "/job-posts";
      if (!authUser?.isHR) {
        endpoint = "/job-posts/filtered";
      }

      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append("search", searchQuery);
      }
      params.append("sortOrder", sortOrder);

      const response = await axiosInstance.get(
        `${endpoint}?${params.toString()}`
      );
      setJobs(response.data.jobPosts || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to fetch jobs"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch applied jobs for candidate
  const fetchAppliedJobs = async () => {
    if (authUser?.isHR) return;

    try {
      const response = await axiosInstance.get(
        `/job-applications/candidate/${authUser._id}`
      );

      // Extract applied job IDs and full job post data
      const appliedSet = new Set();
      const appliedPostsData = [];

      response.data.applications?.forEach((app) => {
        const jobPostId =
          typeof app.jobPostId === "object" ? app.jobPostId._id : app.jobPostId;
        appliedSet.add(jobPostId);

        // If we have full job post data, store it
        if (typeof app.jobPostId === "object" && app.jobPostId) {
          appliedPostsData.push(app.jobPostId);
        }
      });

      setAppliedJobs(appliedSet);
      setAppliedJobsData(appliedPostsData);
    } catch (error) {
      console.log(
        "Error fetching applied jobs:",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
  }, [authUser]);

  // Refetch when search or sort changes
  useEffect(() => {
    fetchJobs();
  }, [searchQuery, sortOrder]);

  // Filter jobs based on filterType
  useEffect(() => {
    let filtered = jobs;

    if (!authUser?.isHR) {
      if (filterType === "applied") {
        // Show applied jobs from appliedJobsData
        filtered = appliedJobsData;
      } else if (filterType === "unapplied") {
        // Show only jobs the candidate has NOT applied for
        filtered = jobs.filter((job) => !appliedJobs.has(job._id));
      }
      // filterType === "all": show all available jobs (not applied)
    }

    setFilteredJobs(filtered);
  }, [jobs, appliedJobsData, filterType, appliedJobs, authUser]);

  const handleApply = (job) => {
    setSelectedJob(job);
    setIsDialogOpen(true);
  };

  const handleApplicationSuccess = () => {
    setAppliedJobs((prev) => new Set([...prev, selectedJob._id]));
    // Refresh both applied jobs and general jobs list
    fetchAppliedJobs();
    fetchJobs();
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setIsEditDialogOpen(true);
  };

  const handleViewCandidates = (job) => {
    setViewingCandidatesJob(job);
    setIsCandidatesDialogOpen(true);
  };

  const handleDelete = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job post?")) return;

    setIsDeletingId(jobId);
    try {
      await axiosInstance.delete(`/job-posts/${jobId}`);
      toast.success("Job post deleted successfully");
      fetchJobs(); // Refresh jobs
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to delete job"
      );
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="w-full bg-base-50 py-4 md:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            {authUser?.isHR ? "Your Job Posts" : "Job Opportunities"}
          </h1>
        </div>

        {/* Search and Sort Controls */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 join">
            <input
              type="text"
              placeholder="Search jobs, roles, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered join-item w-full"
            />
            <button className="btn btn-primary join-item">
              <Search size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortOrder("desc")}
              className={`btn btn-sm gap-2 ${
                sortOrder === "desc" ? "btn-primary" : "btn-outline"
              }`}
              title="Newest first"
            >
              <ArrowDown size={16} /> Newest
            </button>
            <button
              onClick={() => setSortOrder("asc")}
              className={`btn btn-sm gap-2 ${
                sortOrder === "asc" ? "btn-primary" : "btn-outline"
              }`}
              title="Oldest first"
            >
              <ArrowUp size={16} /> Oldest
            </button>
          </div>
        </div>

        {/* Filter Tabs for Candidates */}
        {!authUser?.isHR && (
          <div className="tabs tabs-boxed mb-4 md:mb-6 bg-base-200 overflow-x-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`tab tab-sm md:tab-md ${
                filterType === "all" ? "tab-active" : ""
              }`}
            >
              All Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setFilterType("applied")}
              className={`tab tab-sm md:tab-md ${
                filterType === "applied" ? "tab-active" : ""
              }`}
            >
              Applied ({appliedJobs.size})
            </button>
            <button
              onClick={() => setFilterType("unapplied")}
              className={`tab tab-sm md:tab-md ${
                filterType === "unapplied" ? "tab-active" : ""
              }`}
            >
              Not Applied ({jobs.length - appliedJobs.size})
            </button>
          </div>
        )}

        {/* Jobs List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="alert alert-info">
            <span>
              {authUser?.isHR
                ? "No job posts yet. Create one to get started!"
                : filterType === "applied"
                ? "You haven't applied for any jobs yet. Check available jobs to get started!"
                : "No job opportunities available at the moment. Check back soon!"}
            </span>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredJobs.map((job) => (
              <JobPostCard
                key={job._id}
                job={job}
                isHR={authUser?.isHR}
                onApply={handleApply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewCandidates={handleViewCandidates}
                hasApplied={appliedJobs.has(job._id)}
                isDeleting={isDeletingId === job._id}
              />
            ))}
          </div>
        )}

        {/* Job Application Dialog */}
        {selectedJob && (
          <JobApplicationDialog
            jobPost={selectedJob}
            isOpen={isDialogOpen}
            onClose={() => {
              setIsDialogOpen(false);
              setSelectedJob(null);
            }}
            onSuccess={handleApplicationSuccess}
          />
        )}

        {/* Job Post Edit Dialog */}
        <JobPostEditDialog
          jobPost={editingJob}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingJob(null);
          }}
          onSuccess={() => {
            fetchJobs();
          }}
        />

        {/* Applied Candidates Dialog */}
        <AppliedCandidatesDialog
          jobPost={viewingCandidatesJob}
          isOpen={isCandidatesDialogOpen}
          onClose={() => {
            setIsCandidatesDialogOpen(false);
            setViewingCandidatesJob(null);
            // Refresh jobs to update applicant counts if needed
            fetchJobs();
          }}
        />
      </div>
    </div>
  );
});

JobPostsPage.displayName = "JobPostsPage";
export default JobPostsPage;

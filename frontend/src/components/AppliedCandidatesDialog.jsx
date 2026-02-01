import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Brain,
  BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios-config";

const AppliedCandidatesDialog = ({ jobPost, isOpen, onClose }) => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (isOpen && jobPost) {
      fetchAppliedCandidates();
    }
  }, [isOpen, jobPost]);

  const fetchAppliedCandidates = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/job-applications/job-post/${jobPost._id}`
      );
      setCandidates(response.data.applications || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch applications"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    setUpdatingId(applicationId);
    try {
      await axiosInstance.put(`/job-applications/${applicationId}`, {
        status,
      });

      setCandidates((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );

      toast.success(
        status === "Accepted" ? "Candidate accepted!" : "Candidate rejected!"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update application"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAnalyzeAll = async () => {
    // Filter only pending candidates
    const pendingCandidates = candidates.filter((c) => c.status === "Pending");

    if (pendingCandidates.length === 0) {
      toast.error("No pending candidates to analyze");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await axiosInstance.post(
        "/job-applications/analyze-all-with-ocr",
        { jobPostId: jobPost._id }
      );

      // Check if analysis was successful
      if (
        response.data.analyzedCount === 0 ||
        !response.data.analyzedCandidates ||
        response.data.analyzedCandidates.length === 0
      ) {
        toast.error("Couldn't able to analyze candidates");
        return;
      }

      setAnalysisResults(response.data);
      setShowAnalysis(true);
      toast.success(
        `Successfully analyzed ${response.data.analyzedCount} candidate(s)!`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Couldn't able to analyze candidates"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box w-full max-w-2xl">
        {!showAnalysis ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-lg">{jobPost?.jobTitle}</h3>
                <p className="text-sm text-base-content/60">
                  {candidates.length} applicant
                  {candidates.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X size={20} />
              </button>
            </div>

            <div className="divider my-2"></div>

            {/* Analyze All Button */}
            <div className="mb-4">
              <button
                onClick={handleAnalyzeAll}
                disabled={isAnalyzing || candidates.length === 0}
                className="btn btn-primary w-full gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Analyzing All Candidates...
                  </>
                ) : (
                  <>
                    <Brain size={18} />
                    Analyze All Candidates with AI
                  </>
                )}
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-base-content/60">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {candidates.map((application) => (
                  <div
                    key={application._id}
                    className="card bg-base-100 border border-base-300 p-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base break-words">
                          {application.candidateId?.fullName}
                        </h4>
                        <p className="text-sm text-base-content/70 truncate">
                          {application.candidateId?.email}
                        </p>
                        {application.candidateId?.contactDetails && (
                          <p className="text-sm text-base-content/70">
                            📞 {application.candidateId.contactDetails}
                          </p>
                        )}

                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="font-semibold">
                              Expected Salary:
                            </span>{" "}
                            ₹{application.expectedSalary?.toLocaleString()}
                          </p>
                          <p className="text-sm line-clamp-2">
                            <span className="font-semibold">Motivation:</span>{" "}
                            {application.whyJoinRole}
                          </p>
                          {application.resume && (
                            <div>
                              <a
                                href={application.resume}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                📄 View Resume
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="mt-2">
                          <span
                            className={`badge ${
                              application.status === "Accepted"
                                ? "badge-success"
                                : application.status === "Rejected"
                                ? "badge-error"
                                : "badge-warning"
                            }`}
                          >
                            {application.status}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {application.status === "Pending" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() =>
                              handleUpdateStatus(application._id, "Accepted")
                            }
                            disabled={updatingId === application._id}
                            className="btn btn-sm btn-success text-white"
                            title="Accept candidate"
                          >
                            {updatingId === application._id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <CheckCircle size={16} />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(application._id, "Rejected")
                            }
                            disabled={updatingId === application._id}
                            className="btn btn-sm btn-error text-white"
                            title="Reject candidate"
                          >
                            {updatingId === application._id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <XCircle size={16} />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-action mt-6">
              <button onClick={onClose} className="btn btn-outline">
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Analysis Results View */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <BarChart3 size={20} />
                  AI Analysis Results
                </h3>
                <p className="text-sm text-base-content/60">
                  {analysisResults?.jobPostTitle}
                </p>
              </div>
              <button
                onClick={() => setShowAnalysis(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X size={20} />
              </button>
            </div>

            <div className="divider my-2"></div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {analysisResults?.analyzedCandidates?.map((candidate, idx) => (
                <div
                  key={idx}
                  className="card bg-base-100 border border-base-300 p-4"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base">
                        {candidate.candidateName}
                      </h4>
                      <p className="text-sm text-base-content/70">
                        {candidate.candidateEmail}
                      </p>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Rating:</span>
                          <div className="flex items-center gap-1">
                            <div className="rating rating-sm">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <input
                                  key={i}
                                  type="radio"
                                  name={`rating-${idx}`}
                                  className="mask mask-star-2 bg-primary"
                                  checked={
                                    i <= Math.round(candidate.rating / 2)
                                  }
                                  readOnly
                                />
                              ))}
                            </div>
                            <span className="font-bold text-primary">
                              {candidate.rating}/10
                            </span>
                          </div>
                        </div>

                        <p className="text-sm">
                          <span className="font-semibold">Summary:</span>{" "}
                          {candidate.summary}
                        </p>

                        <div className="flex gap-2 flex-wrap">
                          <span
                            className={`badge ${
                              candidate.recommendation === "hire"
                                ? "badge-success"
                                : candidate.recommendation === "consider"
                                ? "badge-warning"
                                : "badge-error"
                            }`}
                          >
                            {candidate.recommendation?.toUpperCase()}
                          </span>
                          <span className="badge badge-outline">
                            ₹{candidate.expectedSalary?.toLocaleString()}
                          </span>
                        </div>

                        <p className="text-xs text-base-content/60 line-clamp-2">
                          {candidate.whyJoinRole}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-action mt-6">
              <button
                onClick={() => setShowAnalysis(false)}
                className="btn btn-primary flex-1"
              >
                Back to Candidates
              </button>
              <button onClick={onClose} className="btn btn-outline">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
};

export default AppliedCandidatesDialog;

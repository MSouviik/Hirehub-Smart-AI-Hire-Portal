import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, X, Upload } from "lucide-react";
import { axiosInstance } from "../lib/axios-config";

const JobApplicationDialog = ({ jobPost, isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [expectedSalary, setExpectedSalary] = useState(50000);
  const [whyJoinRole, setWhyJoinRole] = useState("");
  const [resume, setResume] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  const validateForm = () => {
    if (!expectedSalary || expectedSalary <= 0)
      return toast.error("Expected salary must be greater than 0");
    if (!whyJoinRole.trim())
      return toast.error("Please tell us why you want to join this role");
    if (!resume.trim()) return toast.error("Resume is mandatory");
    return true;
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setResumeUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await axiosInstance.post(
        "/profile/upload-resume",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setResume(response.data.resume);
      toast.success("Resume uploaded successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload resume");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm() !== true) return;

    setIsLoading(true);
    try {
      await axiosInstance.post("/job-applications/apply", {
        jobPostId: jobPost._id,
        expectedSalary: parseInt(expectedSalary),
        whyJoinRole,
        resume,
      });

      toast.success("Application submitted successfully!");
      setExpectedSalary(50000);
      setWhyJoinRole("");
      setResume("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit application"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeProfile = async () => {
    if (validateForm() !== true) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        "/job-applications/analyze-with-ocr",
        {
          jobPostId: jobPost._id,
          expectedSalary: parseInt(expectedSalary),
          whyJoinRole,
          resume,
        }
      );

      setAnalysisResult(response.data);
      toast.success("Profile analyzed successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to analyze profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">{jobPost.jobTitle}</h2>
            <p className="text-base-content/60">{jobPost.hrId?.companyName}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Expected Salary */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">
                Expected Salary *
              </span>
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="20000"
                max="500000"
                step="5000"
                className="range range-primary w-full"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
              />
              <div className="flex justify-between text-xs text-base-content/60">
                <span>$20,000</span>
                <span className="font-semibold text-primary">
                  ${parseInt(expectedSalary).toLocaleString()}
                </span>
                <span>$500,000</span>
              </div>
            </div>
          </div>

          {/* Why Join This Role */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">
                Why do you want to join this role? *
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-24"
              placeholder="Tell us why you're interested in this position..."
              value={whyJoinRole}
              onChange={(e) => setWhyJoinRole(e.target.value)}
            />
          </div>

          {/* Resume */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Upload Resume *</span>
              <span className="text-xs text-base-content/60">
                (PDF, DOC, or DOCX - Max 5MB)
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={resumeUploading}
                className="file-input file-input-bordered w-full"
              />
            </div>
            {resume && (
              <div className="mt-2 p-2 bg-success/10 rounded flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-success"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-success">
                  Resume uploaded successfully!
                </span>
              </div>
            )}
          </div>

          {/* Analyze Profile Button */}
          <div>
            <button
              type="button"
              className="btn btn-outline btn-primary w-full"
              onClick={handleAnalyzeProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Analyze Profile for the Job"
              )}
            </button>

            {analysisResult && (
              <div className="mt-4 p-4 border border-primary rounded-lg bg-base-200">
                <h4 className="font-semibold text-lg mb-3">Analysis Result</h4>

                {/* Rating */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Rating:</span>
                    <span className="text-2xl font-bold text-primary">
                      {analysisResult.rating}/10
                    </span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(analysisResult.rating / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Summary */}
                {analysisResult.summary && (
                  <div className="mb-3">
                    <span className="font-semibold">Summary:</span>
                    <p className="text-sm text-base-content/80 mt-1">
                      {analysisResult.summary}
                    </p>
                  </div>
                )}

                {/* Strengths */}
                {analysisResult.strengths &&
                  analysisResult.strengths.length > 0 && (
                    <div className="mb-3">
                      <span className="font-semibold text-success">
                        Strengths:
                      </span>
                      <ul className="list-disc list-inside text-sm text-base-content/80 mt-1">
                        {analysisResult.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Weaknesses */}
                {analysisResult.weaknesses &&
                  analysisResult.weaknesses.length > 0 && (
                    <div className="mb-3">
                      <span className="font-semibold text-warning">
                        Areas for Growth:
                      </span>
                      <ul className="list-disc list-inside text-sm text-base-content/80 mt-1">
                        {analysisResult.weaknesses.map((weakness, idx) => (
                          <li key={idx}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Recommendation */}
                {analysisResult.recommendation && (
                  <div className="mt-4 p-3 rounded bg-base-100">
                    <span className="font-semibold">Recommendation: </span>
                    <span
                      className={`font-bold capitalize ${
                        analysisResult.recommendation === "hire"
                          ? "text-success"
                          : analysisResult.recommendation === "consider"
                          ? "text-info"
                          : "text-warning"
                      }`}
                    >
                      {analysisResult.recommendation}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex-1"
            >
              {isLoading && <Loader2 className="animate-spin" size={16} />}
              {isLoading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationDialog;

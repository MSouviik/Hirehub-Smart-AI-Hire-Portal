import { useState, useEffect } from "react";
import { X, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios-config";

const JOB_ROLES = [
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Data Analyst",
  "Product Manager",
  "UI/UX Designer",
  "Business Analyst",
  "Project Manager",
  "QA Engineer",
  "Machine Learning Engineer",
  "Cloud Architect",
];

const SKILLS = [
  "JavaScript",
  "React",
  "Node.js",
  "MongoDB",
  "Python",
  "Java",
  "SQL",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "TypeScript",
  "Vue.js",
  "Angular",
  "Express.js",
  "GraphQL",
  "REST API",
  "Git",
  "CI/CD",
  "Linux",
];

const LOCATIONS = [
  "Bangalore, Karnataka, India",
  "Mumbai, Maharashtra, India",
  "Delhi, India",
  "Hyderabad, Telangana, India",
  "Pune, Maharashtra, India",
  "Chennai, Tamil Nadu, India",
  "Kolkata, West Bengal, India",
  "Remote",
  "Hybrid",
];

const JobPostEditDialog = ({ jobPost, isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [skillsList, setSkillsList] = useState([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [roleSuggestions, setRoleSuggestions] = useState([]);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    rolesAndResponsibilities: "",
    skillsRequired: [],
    jobType: "Permanent",
    natureOfEmployment: "Full-time",
    jobRole: "",
    salary: "",
    salaryMin: "",
    salaryMax: "",
    location: "",
  });

  // Populate form data when jobPost changes
  useEffect(() => {
    if (jobPost && isOpen) {
      setFormData({
        jobTitle: jobPost.jobTitle || "",
        jobDescription: jobPost.jobDescription || "",
        rolesAndResponsibilities: jobPost.rolesAndResponsibilities || "",
        skillsRequired: jobPost.skillsRequired || [],
        jobType: jobPost.jobType || "Permanent",
        natureOfEmployment: jobPost.natureOfEmployment || "Full-time",
        jobRole: jobPost.jobRole || "",
        salary: jobPost.salary || "",
        salaryMin: jobPost.salaryMin || "",
        salaryMax: jobPost.salaryMax || "",
        location: jobPost.location || "",
      });
      setSkillsList(jobPost.skillsRequired || []);
    }
  }, [jobPost, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Role suggestions
  const handleRoleChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, jobRole: value }));

    if (value.trim()) {
      const filtered = JOB_ROLES.filter((role) =>
        role.toLowerCase().includes(value.toLowerCase())
      );
      setRoleSuggestions(filtered);
      setShowRoleSuggestions(true);
    } else {
      setShowRoleSuggestions(false);
    }
  };

  const selectRole = (role) => {
    setFormData((prev) => ({ ...prev, jobRole: role }));
    setShowRoleSuggestions(false);
  };

  // Skills handling
  const handleSkillChange = (e) => {
    const value = e.target.value;
    setCurrentSkill(value);

    if (value.trim()) {
      const filtered = SKILLS.filter((skill) =>
        skill.toLowerCase().includes(value.toLowerCase())
      );
      setSkillSuggestions(filtered);
      setShowSkillSuggestions(true);
    } else {
      setShowSkillSuggestions(false);
    }
  };

  const selectSkill = (skill) => {
    if (!skillsList.includes(skill)) {
      setSkillsList((prev) => [...prev, skill]);
      setFormData((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skill],
      }));
    }
    setCurrentSkill("");
    setShowSkillSuggestions(false);
  };

  const removeSkill = (skillToRemove) => {
    setSkillsList((prev) => prev.filter((s) => s !== skillToRemove));
    setFormData((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((s) => s !== skillToRemove),
    }));
  };

  // Location suggestions
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, location: value }));

    if (value.trim()) {
      const filtered = LOCATIONS.filter((loc) =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  const selectLocation = (location) => {
    setFormData((prev) => ({ ...prev, location }));
    setShowLocationSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.jobTitle ||
      !formData.jobDescription ||
      !formData.rolesAndResponsibilities ||
      !formData.jobType ||
      !formData.natureOfEmployment ||
      !formData.jobRole
    ) {
      return toast.error("All required fields must be filled.");
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.put(`/job-posts/${jobPost._id}`, {
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        rolesAndResponsibilities: formData.rolesAndResponsibilities,
        skillsRequired: skillsList,
        jobType: formData.jobType,
        natureOfEmployment: formData.natureOfEmployment,
        jobRole: formData.jobRole,
        salary: formData.salary,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        location: formData.location,
      });

      toast.success("Job post updated successfully!");
      onClose();
      onSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to update job"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal modal-open">
      <form onSubmit={handleSubmit} className="modal-box w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Edit Job Post</h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Job Title */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Job Title *</span>
            </label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              placeholder="e.g., Senior Software Developer"
            />
          </div>

          {/* Job Role */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Job Role *</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.jobRole}
                onChange={handleRoleChange}
                className="input input-bordered w-full"
                placeholder="Select a job role..."
              />
              {showRoleSuggestions && roleSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-base-100 border border-base-300 rounded mt-1 shadow-lg max-h-40 overflow-y-auto">
                  {roleSuggestions.map((role) => (
                    <li key={role}>
                      <button
                        type="button"
                        onClick={() => selectRole(role)}
                        className="w-full text-left px-3 py-2 hover:bg-base-200"
                      >
                        {role}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">
                Job Description *
              </span>
            </label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleInputChange}
              className="textarea textarea-bordered w-full h-24"
              placeholder="Describe the job..."
            />
          </div>

          {/* Roles and Responsibilities */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">
                Roles & Responsibilities *
              </span>
            </label>
            <textarea
              name="rolesAndResponsibilities"
              value={formData.rolesAndResponsibilities}
              onChange={handleInputChange}
              className="textarea textarea-bordered w-full h-24"
              placeholder="List the roles and responsibilities..."
            />
          </div>

          {/* Skills */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Required Skills</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentSkill}
                onChange={handleSkillChange}
                className="input input-bordered w-full"
                placeholder="Add a skill..."
              />
              {showSkillSuggestions && skillSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-base-100 border border-base-300 rounded mt-1 shadow-lg max-h-40 overflow-y-auto">
                  {skillSuggestions.map((skill) => (
                    <li key={skill}>
                      <button
                        type="button"
                        onClick={() => selectSkill(skill)}
                        className="w-full text-left px-3 py-2 hover:bg-base-200"
                      >
                        {skill}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Skills List */}
            <div className="mt-2 flex flex-wrap gap-2">
              {skillsList.map((skill) => (
                <div
                  key={skill}
                  className="badge badge-primary badge-lg gap-2 text-white"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="btn-ghost"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Job Type */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Job Type *</span>
            </label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleInputChange}
              className="select select-bordered w-full"
            >
              <option>Permanent</option>
              <option>Contract</option>
              <option>Temporary</option>
              <option>Internship</option>
            </select>
          </div>

          {/* Nature of Employment */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">
                Nature of Employment *
              </span>
            </label>
            <select
              name="natureOfEmployment"
              value={formData.natureOfEmployment}
              onChange={handleInputChange}
              className="select select-bordered w-full"
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Flexible</option>
            </select>
          </div>

          {/* Salary Options */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">
                <span className="label-text font-semibold text-sm">Salary</span>
              </label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="input input-bordered w-full text-sm"
                placeholder="e.g., 5,00,000"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold text-sm">
                  Salary Min
                </span>
              </label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleInputChange}
                className="input input-bordered w-full text-sm"
                placeholder="Min"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold text-sm">
                  Salary Max
                </span>
              </label>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleInputChange}
                className="input input-bordered w-full text-sm"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Location</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.location}
                onChange={handleLocationChange}
                className="input input-bordered w-full"
                placeholder="Enter location..."
              />
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-base-100 border border-base-300 rounded mt-1 shadow-lg max-h-40 overflow-y-auto">
                  {locationSuggestions.map((loc) => (
                    <li key={loc}>
                      <button
                        type="button"
                        onClick={() => selectLocation(loc)}
                        className="w-full text-left px-3 py-2 hover:bg-base-200"
                      >
                        {loc}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="modal-action mt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Updating...
              </>
            ) : (
              "Update Job Post"
            )}
          </button>
        </div>
      </form>
    </dialog>
  );
};

export default JobPostEditDialog;

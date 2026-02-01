import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Loader2, Plus, X } from "lucide-react";
import { axiosInstance } from "../lib/axios-config";

// Predefined suggestions
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

const JobPostForm = ({ onSuccess }) => {
  const { authUser } = useAuthStore();
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
    salaryMin: "",
    salaryMax: "",
    location: "",
  });

  // Handle role input with suggestions
  const handleRoleChange = (value) => {
    setFormData({ ...formData, jobRole: value });
    if (value.trim()) {
      const filtered = JOB_ROLES.filter((role) =>
        role.toLowerCase().includes(value.toLowerCase())
      );
      setRoleSuggestions(filtered);
      setShowRoleSuggestions(true);
    } else {
      setRoleSuggestions([]);
      setShowRoleSuggestions(false);
    }
  };

  const selectRole = (role) => {
    setFormData({ ...formData, jobRole: role });
    setShowRoleSuggestions(false);
  };

  // Handle skill input with suggestions
  const handleSkillChange = (value) => {
    setCurrentSkill(value);
    if (value.trim()) {
      const filtered = SKILLS.filter(
        (skill) =>
          skill.toLowerCase().includes(value.toLowerCase()) &&
          !skillsList.includes(skill)
      );
      setSkillSuggestions(filtered);
      setShowSkillSuggestions(true);
    } else {
      setSkillSuggestions([]);
      setShowSkillSuggestions(false);
    }
  };

  const selectSkill = (skill) => {
    if (!skillsList.includes(skill)) {
      setSkillsList([...skillsList, skill]);
      setCurrentSkill("");
      setShowSkillSuggestions(false);
    }
  };

  const addSkill = () => {
    if (currentSkill.trim() && !skillsList.includes(currentSkill)) {
      setSkillsList([...skillsList, currentSkill]);
      setCurrentSkill("");
      setShowSkillSuggestions(false);
    } else if (skillsList.includes(currentSkill)) {
      toast.error("Skill already added");
    } else {
      toast.error("Please enter a skill");
    }
  };

  const removeSkill = (index) => {
    setSkillsList(skillsList.filter((_, i) => i !== index));
  };

  // Handle location input with suggestions
  const handleLocationChange = (value) => {
    setFormData({ ...formData, location: value });
    if (value.trim()) {
      const filtered = LOCATIONS.filter((loc) =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  const selectLocation = (location) => {
    setFormData({ ...formData, location });
    setShowLocationSuggestions(false);
  };

  const validateForm = () => {
    if (!formData.jobTitle.trim()) return toast.error("Job title is mandatory");
    if (!formData.jobDescription.trim())
      return toast.error("Job description is mandatory");
    if (!formData.rolesAndResponsibilities.trim())
      return toast.error("Roles and responsibilities are mandatory");
    if (skillsList.length === 0)
      return toast.error("Add at least one required skill");
    if (!formData.jobRole.trim()) return toast.error("Job role is mandatory");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm() !== true) return;

    setIsLoading(true);
    try {
      const updatedData = {
        ...formData,
        skillsRequired: skillsList,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        salary:
          formData.salaryMin && formData.salaryMax
            ? `₹${parseInt(formData.salaryMin).toLocaleString()} - ₹${parseInt(
                formData.salaryMax
              ).toLocaleString()}`
            : "",
      };

      await axiosInstance.post("/job-posts", updatedData);
      toast.success("Job post created successfully!");

      // Reset form
      setFormData({
        jobTitle: "",
        jobDescription: "",
        rolesAndResponsibilities: "",
        skillsRequired: [],
        jobType: "Permanent",
        natureOfEmployment: "Full-time",
        jobRole: "",
        salaryMin: "",
        salaryMax: "",
        location: "",
      });
      setSkillsList([]);

      // Call parent callback to trigger refresh
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create job post"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-base-100 rounded-lg shadow-lg p-4 md:p-6 lg:p-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Post a New Job</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Title */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Job Title *</span>
          </label>
          <input
            type="text"
            className="input input-bordered input-md w-full focus:outline-none focus:border-primary"
            placeholder="e.g., Senior Software Developer"
            value={formData.jobTitle}
            onChange={(e) =>
              setFormData({ ...formData, jobTitle: e.target.value })
            }
            disabled={isLoading}
          />
        </div>

        {/* Job Role with Suggestions */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Job Role *</span>
          </label>
          <div className="relative">
            <input
              type="text"
              className="input input-bordered input-md w-full focus:outline-none focus:border-primary"
              placeholder="e.g., Software Developer, Product Manager"
              value={formData.jobRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              onFocus={() => formData.jobRole && setShowRoleSuggestions(true)}
            />
            {showRoleSuggestions && roleSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-base-100 border border-base-300 rounded-md mt-1 max-h-48 overflow-y-auto z-50 shadow-lg">
                {roleSuggestions.map((role, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectRole(role)}
                    className="w-full text-left px-4 py-2 hover:bg-primary hover:text-primary-content transition"
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Job Description *</span>
          </label>
          <textarea
            className="textarea textarea-bordered focus:outline-none focus:border-primary"
            placeholder="Describe the job position..."
            rows="4"
            value={formData.jobDescription}
            onChange={(e) =>
              setFormData({ ...formData, jobDescription: e.target.value })
            }
          />
        </div>

        {/* Roles and Responsibilities */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Roles & Responsibilities *
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered focus:outline-none focus:border-primary"
            placeholder="List the key responsibilities..."
            rows="4"
            value={formData.rolesAndResponsibilities}
            onChange={(e) =>
              setFormData({
                ...formData,
                rolesAndResponsibilities: e.target.value,
              })
            }
          />
        </div>

        {/* Skills Required with Suggestions */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Required Skills *</span>
          </label>
          <div className="relative mb-3">
            <div className="flex gap-2">
              <input
                type="text"
                className="input input-bordered input-md flex-1 focus:outline-none focus:border-primary"
                placeholder="e.g., React, Node.js, MongoDB"
                value={currentSkill}
                onChange={(e) => handleSkillChange(e.target.value)}
                onFocus={() => currentSkill && setShowSkillSuggestions(true)}
              />
              <button
                type="button"
                onClick={addSkill}
                className="btn btn-outline btn-primary btn-md"
              >
                <Plus size={16} /> Add
              </button>
            </div>
            {showSkillSuggestions && skillSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-base-100 border border-base-300 rounded-md mt-1 max-h-48 overflow-y-auto z-50 shadow-lg">
                {skillSuggestions.map((skill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSkill(skill)}
                    className="w-full text-left px-4 py-2 hover:bg-primary hover:text-primary-content transition"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {skillsList.map((skill, index) => (
              <div key={index} className="badge badge-lg badge-primary gap-2">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-primary-content hover:text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Job Type & Nature of Employment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Job Type *</span>
            </label>
            <select
              className="select select-bordered focus:outline-none focus:border-primary"
              value={formData.jobType}
              onChange={(e) =>
                setFormData({ ...formData, jobType: e.target.value })
              }
            >
              <option value="Permanent">Permanent</option>
              <option value="Contractual">Contractual</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Nature of Employment *
              </span>
            </label>
            <select
              className="select select-bordered focus:outline-none focus:border-primary"
              value={formData.natureOfEmployment}
              onChange={(e) =>
                setFormData({ ...formData, natureOfEmployment: e.target.value })
              }
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
        </div>

        {/* Salary Range with Sliders */}
        <div className="form-control border border-base-300 rounded-lg p-4 bg-base-50">
          <label className="label">
            <span className="label-text font-semibold">
              Salary Range (Optional)
            </span>
          </label>
          <div className="space-y-4">
            {/* Min Salary */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Minimum Salary:</span>
                <span className="font-bold text-primary">
                  {formData.salaryMin ? `₹${formData.salaryMin}` : "Not set"}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5000000"
                step="50000"
                value={formData.salaryMin}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMin: e.target.value })
                }
                className="range range-primary w-full"
              />
              <div className="flex justify-between text-xs text-base-content/60 mt-1">
                <span>₹0</span>
                <span>₹50,00,000</span>
              </div>
            </div>

            {/* Max Salary */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Maximum Salary:</span>
                <span className="font-bold text-primary">
                  {formData.salaryMax ? `₹${formData.salaryMax}` : "Not set"}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5000000"
                step="50000"
                value={formData.salaryMax}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMax: e.target.value })
                }
                className="range range-primary w-full"
              />
              <div className="flex justify-between text-xs text-base-content/60 mt-1">
                <span>₹0</span>
                <span>₹50,00,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location with Suggestions */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Location (Optional)
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              className="input input-bordered input-md w-full focus:outline-none focus:border-primary"
              placeholder="e.g., Bangalore, Karnataka, India"
              value={formData.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={() =>
                formData.location && setShowLocationSuggestions(true)
              }
            />
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-base-100 border border-base-300 rounded-md mt-1 max-h-48 overflow-y-auto z-50 shadow-lg">
                {locationSuggestions.map((location, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectLocation(location)}
                    className="w-full text-left px-4 py-2 hover:bg-primary hover:text-primary-content transition"
                  >
                    {location}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-lg flex-1"
          >
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {isLoading ? "Publishing..." : "Publish Job Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobPostForm;

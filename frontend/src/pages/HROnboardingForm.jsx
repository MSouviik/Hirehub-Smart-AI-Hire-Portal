import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
  Loader2,
  Plus,
  X,
  Building2,
  Phone,
  User,
  Briefcase,
  ImagePlus,
} from "lucide-react";
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
  "QA Engineer",
  "Machine Learning Engineer",
  "Cloud Architect",
  "Java Developer",
  "Python Developer",
];

const HROnboardingForm = () => {
  const { authUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [rolesList, setRolesList] = useState([]);
  const [currentRole, setCurrentRole] = useState("");
  const [roleSuggestions, setRoleSuggestions] = useState([]);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [isUploadingPic, setIsUploadingPic] = useState(false);

  const [formData, setFormData] = useState({
    bio: "",
    contactDetails: "",
    companyName: "",
    companyDetails: "",
    companyWebsite: "",
    hrRoles: [],
  });

  const handleRoleChange = (value) => {
    setCurrentRole(value);
    if (value.trim()) {
      const filtered = JOB_ROLES.filter(
        (role) =>
          role.toLowerCase().includes(value.toLowerCase()) &&
          !rolesList.includes(role)
      );
      setRoleSuggestions(filtered);
      setShowRoleSuggestions(true);
    } else {
      setRoleSuggestions([]);
      setShowRoleSuggestions(false);
    }
  };

  const selectRole = (role) => {
    setRolesList([...rolesList, role]);
    setCurrentRole("");
    setShowRoleSuggestions(false);
  };

  const addRole = () => {
    if (currentRole.trim()) {
      if (!rolesList.includes(currentRole)) {
        setRolesList([...rolesList, currentRole]);
        setCurrentRole("");
        setShowRoleSuggestions(false);
      } else {
        toast.error("Role already added");
      }
    } else {
      toast.error("Please enter a role");
    }
  };

  const removeRole = (index) => {
    setRolesList(rolesList.filter((_, i) => i !== index));
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images only)
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePicPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploadingPic(true);
    try {
      const formDataFile = new FormData();
      formDataFile.append("profilePic", file);

      const response = await axiosInstance.post(
        "/profile/upload-picture",
        formDataFile,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Update auth store with new profile pic
      authUser.profilePic = response.data.profilePic;
      toast.success("Profile picture uploaded successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to upload profile picture"
      );
      setProfilePicPreview(null);
    } finally {
      setIsUploadingPic(false);
    }
  };

  const validateForm = () => {
    if (!formData.companyName.trim())
      return toast.error("Company name is mandatory");
    if (!formData.companyDetails.trim())
      return toast.error("Company details are mandatory");
    if (!formData.bio.trim()) return toast.error("Bio is mandatory");
    if (!formData.contactDetails.trim())
      return toast.error("Contact details are mandatory");
    if (rolesList.length === 0) return toast.error("Add at least one role");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm() !== true) return;

    setIsLoading(true);
    try {
      const updatedData = {
        ...formData,
        hrRoles: rolesList,
      };

      await axiosInstance.post("/profile/complete-hr", updatedData);
      toast.success("HR profile completed successfully!");
      window.location.href = "/";
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-6 md:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-base-100 rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Complete Your HR Profile
          </h1>
          <p className="text-sm sm:text-base text-base-content/60 mb-6 sm:mb-8">
            Set up your company and hiring information
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <Building2 size={18} />
                  Company Name *
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered input-md w-full focus:outline-none focus:border-primary"
                placeholder="Your company name"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
              />
            </div>

            {/* Company Details */}
            <div>
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <Building2 size={18} />
                  Company Details *
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24"
                placeholder="Tell us about your company (industry, size, mission, etc.)"
                value={formData.companyDetails}
                onChange={(e) =>
                  setFormData({ ...formData, companyDetails: e.target.value })
                }
              />
            </div>

            {/* Company Website */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">
                  Company Website (Optional)
                </span>
              </label>
              <input
                type="url"
                className="input input-bordered w-full"
                placeholder="https://yourcompany.com"
                value={formData.companyWebsite}
                onChange={(e) =>
                  setFormData({ ...formData, companyWebsite: e.target.value })
                }
              />
            </div>

            {/* Bio */}
            <div>
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <User size={18} />
                  Your Bio *
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24"
                placeholder="Tell us about yourself and your role in the company"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
              />
            </div>

            {/* Contact Details */}
            <div>
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <Phone size={18} />
                  Contact Details *
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Phone number, email, LinkedIn, etc."
                value={formData.contactDetails}
                onChange={(e) =>
                  setFormData({ ...formData, contactDetails: e.target.value })
                }
              />
            </div>

            {/* Profile Picture */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <ImagePlus size={18} />
                  Profile Picture (Optional)
                </span>
                <span className="label-text-alt text-xs text-base-content/60">
                  Accepted formats: JPG, PNG, GIF, WebP (Max 5MB)
                </span>
              </label>
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  disabled={isUploadingPic}
                  className="file-input file-input-bordered file-input-md w-full focus:outline-none focus:border-primary"
                />
                {profilePicPreview && (
                  <div className="flex justify-center">
                    <img
                      src={profilePicPreview}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover border-2 border-primary"
                    />
                  </div>
                )}
                {authUser?.profilePic && (
                  <div className="alert alert-success py-2">
                    <span className="text-sm">✓ Profile picture uploaded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hiring Roles */}
            <div className="divider flex items-center gap-2">
              <Briefcase size={18} />
              Hiring Roles *
            </div>
            <div className="space-y-4">
              <p className="text-sm text-base-content/70">
                Add the roles you are actively hiring for
              </p>
              <div className="relative flex gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  placeholder="e.g., Software Developer"
                  value={currentRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                />
                <button
                  type="button"
                  onClick={addRole}
                  className="btn btn-outline btn-primary"
                >
                  <Plus size={16} /> Add
                </button>
                {showRoleSuggestions && roleSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-24 bg-base-200 border border-primary rounded-md mt-1 z-10 max-h-40 overflow-y-auto">
                    {roleSuggestions.map((role, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-primary hover:text-primary-content"
                        onClick={() => selectRole(role)}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {rolesList.length > 0 && (
                <div className="space-y-2">
                  {rolesList.map((role, index) => (
                    <div
                      key={index}
                      className="bg-base-200 p-3 rounded-lg flex justify-between items-center"
                    >
                      <span className="font-medium">{role}</span>
                      <button
                        type="button"
                        onClick={() => removeRole(index)}
                        className="btn btn-ghost btn-sm"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary flex-1"
              >
                {isLoading && <Loader2 className="animate-spin" size={16} />}
                {isLoading ? "Saving..." : "Complete HR Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HROnboardingForm;

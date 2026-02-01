import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
  Edit2,
  X,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Download,
  File,
  ImagePlus,
} from "lucide-react";
import { axiosInstance } from "../lib/axios-config";

const ProfilePage = () => {
  const { authUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Form states for editing/completing profile
  const [formData, setFormData] = useState({
    bio: "",
    contactDetails: "",
    education: [],
    workExperience: [],
    projects: [],
    achievements: "",
    languagesKnown: [],
    disabilityStatus: "",
    militaryExperience: "",
    careerBreak: "",
    maritalStatus: "",
    preferredJobRoles: [],
    resume: "",
    companyName: "",
    companyDetails: "",
    companyWebsite: "",
    hrRoles: [],
  });

  const [currentEducation, setCurrentEducation] = useState({
    degree: "",
    institution: "",
    year: "",
    cgpa: "",
  });

  const [currentExperience, setCurrentExperience] = useState({
    jobTitle: "",
    company: "",
    duration: "",
    description: "",
  });

  const [currentProject, setCurrentProject] = useState({
    title: "",
    description: "",
    link: "",
  });

  const [currentLanguage, setCurrentLanguage] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [currentPrefRole, setCurrentPrefRole] = useState("");
  const [resumeUploading, setResumeUploading] = useState(false);
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const response = await axiosInstance.get("/profile");
        const data = response.data.user;
        setProfile(data);
        setFormData(data);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch profile"
        );
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  // Resume upload handler
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
      const formDataFile = new FormData();
      formDataFile.append("resume", file);

      const response = await axiosInstance.post(
        "/profile/upload-resume",
        formDataFile,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Update formData with the resume URL from server
      setFormData({ ...formData, resume: response.data.resume });
      toast.success("Resume uploaded successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload resume");
    } finally {
      setResumeUploading(false);
    }
  };

  // Profile picture upload handler
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
    setProfilePicUploading(true);
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

      // Update profile with new picture URL from response
      const newProfilePic = response.data.profilePic;
      setProfile({ ...profile, profilePic: newProfilePic });
      setProfilePicPreview(null);
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to upload profile picture"
      );
      setProfilePicPreview(null);
    } finally {
      setProfilePicUploading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.put("/profile/update-field", {
        field: "fullProfile",
        value: formData,
      });
      toast.success("Profile updated successfully!");
      setProfile(formData);
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Education handlers
  const addEducation = () => {
    if (currentEducation.degree && currentEducation.institution) {
      setFormData({
        ...formData,
        education: [...(formData.education || []), currentEducation],
      });
      setCurrentEducation({ degree: "", institution: "", year: "", cgpa: "" });
    } else {
      toast.error("Please fill degree and institution");
    }
  };

  const removeEducation = (index) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  // Work Experience handlers
  const addExperience = () => {
    if (currentExperience.jobTitle && currentExperience.company) {
      setFormData({
        ...formData,
        workExperience: [...(formData.workExperience || []), currentExperience],
      });
      setCurrentExperience({
        jobTitle: "",
        company: "",
        duration: "",
        description: "",
      });
    } else {
      toast.error("Please fill job title and company");
    }
  };

  const removeExperience = (index) => {
    setFormData({
      ...formData,
      workExperience: formData.workExperience.filter((_, i) => i !== index),
    });
  };

  // Project handlers
  const addProject = () => {
    if (currentProject.title) {
      setFormData({
        ...formData,
        projects: [...(formData.projects || []), currentProject],
      });
      setCurrentProject({ title: "", description: "", link: "" });
    } else {
      toast.error("Please fill project title");
    }
  };

  const removeProject = (index) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index),
    });
  };

  // Language handlers
  const addLanguage = () => {
    if (currentLanguage.trim()) {
      setFormData({
        ...formData,
        languagesKnown: [...(formData.languagesKnown || []), currentLanguage],
      });
      setCurrentLanguage("");
    } else {
      toast.error("Please enter a language");
    }
  };

  const removeLanguage = (index) => {
    setFormData({
      ...formData,
      languagesKnown: formData.languagesKnown.filter((_, i) => i !== index),
    });
  };

  // HR Role handlers
  const addRole = () => {
    if (currentRole.trim()) {
      setFormData({
        ...formData,
        hrRoles: [...(formData.hrRoles || []), currentRole],
      });
      setCurrentRole("");
    } else {
      toast.error("Please enter a role");
    }
  };

  const removeRole = (index) => {
    setFormData({
      ...formData,
      hrRoles: formData.hrRoles.filter((_, i) => i !== index),
    });
  };

  // Preferred Job Roles handlers
  const addPrefRole = () => {
    if (currentPrefRole.trim()) {
      if ((formData.preferredJobRoles || []).length < 3) {
        if (!(formData.preferredJobRoles || []).includes(currentPrefRole)) {
          setFormData({
            ...formData,
            preferredJobRoles: [
              ...(formData.preferredJobRoles || []),
              currentPrefRole,
            ],
          });
          setCurrentPrefRole("");
        } else {
          toast.error("Role already added");
        }
      } else {
        toast.error("Maximum 3 preferred roles allowed");
      }
    } else {
      toast.error("Please enter a role");
    }
  };

  const removePrefRole = (index) => {
    setFormData({
      ...formData,
      preferredJobRoles: formData.preferredJobRoles.filter(
        (_, i) => i !== index
      ),
    });
  };

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="alert alert-error">
        <span>Failed to load profile. Please try again.</span>
      </div>
    );
  }

  const isCandidate = !profile.isHR;
  const isProfileIncomplete = !profile.profileCompleted;

  // Show form view (either for completion or editing)
  if (isProfileIncomplete || isEditing) {
    return (
      <div className="min-h-screen bg-base-200 py-6 md:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-base-100 rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {isProfileIncomplete
                ? "Complete Your Profile"
                : "Edit Your Profile"}
            </h1>
            <p className="text-sm sm:text-base text-base-content/60 mb-6 sm:mb-8">
              {isProfileIncomplete
                ? isCandidate
                  ? "Help employers understand your expertise and experience"
                  : "Set up your company and hiring information"
                : "Update your profile information"}
            </p>

            {/* Profile Picture Upload Section */}
            <div className="mb-8 p-4 bg-base-200 rounded-lg">
              <label className="label">
                <span className="label-text font-semibold">
                  Profile Picture
                </span>
              </label>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {profilePicPreview ? (
                    <img
                      src={profilePicPreview}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                    />
                  ) : profile?.profilePic ? (
                    <img
                      src={profile.profilePic}
                      alt={profile.fullName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-base-300 border-4 border-primary flex items-center justify-center">
                      <ImagePlus size={48} className="text-base-content/40" />
                    </div>
                  )}
                  {profilePicUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="animate-spin text-white" size={32} />
                    </div>
                  )}
                </div>
                <label className="btn btn-primary btn-sm">
                  <Upload size={18} />
                  {profilePicUploading ? "Uploading..." : "Choose Picture"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    disabled={profilePicUploading}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-base-content/60">
                  JPG, PNG, GIF, or WebP (Max 5MB)
                </p>
              </div>
            </div>

            <form className="space-y-6">
              {/* Basic Fields */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Bio *</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Tell us about yourself"
                  value={formData.bio || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Contact Details *
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Phone, email, LinkedIn, etc."
                  value={formData.contactDetails || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, contactDetails: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              {isCandidate ? (
                <>
                  {/* Candidate-specific fields */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Preferred Job Roles * (Max 3)
                      </span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        className="input input-bordered flex-1 input-sm"
                        placeholder="e.g., Software Developer"
                        value={currentPrefRole}
                        onChange={(e) => setCurrentPrefRole(e.target.value)}
                        disabled={
                          isLoading ||
                          (formData.preferredJobRoles || []).length >= 3
                        }
                      />
                      <button
                        type="button"
                        onClick={addPrefRole}
                        disabled={
                          isLoading ||
                          (formData.preferredJobRoles || []).length >= 3
                        }
                        className="btn btn-outline btn-primary btn-sm"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.preferredJobRoles &&
                        formData.preferredJobRoles.map((role, idx) => (
                          <div key={idx} className="badge badge-primary gap-2">
                            {role}
                            <button
                              type="button"
                              onClick={() => removePrefRole(idx)}
                              disabled={isLoading}
                              className="cursor-pointer hover:scale-110"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Resume/CV *
                      </span>
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="file-input file-input-bordered w-full"
                          onChange={handleResumeUpload}
                          disabled={isLoading || resumeUploading}
                          id="resume-input"
                        />
                        {resumeUploading && (
                          <div className="flex items-center gap-2 text-primary">
                            <Loader2 className="animate-spin" size={18} />
                            <span className="text-sm">Uploading...</span>
                          </div>
                        )}
                      </div>

                      {/* Show uploaded resume with download link */}
                      {formData.resume && !resumeUploading && (
                        <div className="bg-success/10 border border-success p-3 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <File size={20} className="text-success" />
                            <span className="text-sm font-medium text-success">
                              Resume uploaded successfully
                            </span>
                          </div>
                          <a
                            href={formData.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm gap-1"
                            title="View resume"
                          >
                            <Download size={16} />
                            View
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="divider">Education</div>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Degree</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full input-sm"
                        placeholder="B.Tech, MBA, etc."
                        value={currentEducation.degree}
                        onChange={(e) =>
                          setCurrentEducation({
                            ...currentEducation,
                            degree: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Institution</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full input-sm"
                        placeholder="College/University name"
                        value={currentEducation.institution}
                        onChange={(e) =>
                          setCurrentEducation({
                            ...currentEducation,
                            institution: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Year</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered input-sm"
                          placeholder="2020"
                          value={currentEducation.year}
                          onChange={(e) =>
                            setCurrentEducation({
                              ...currentEducation,
                              year: e.target.value,
                            })
                          }
                          disabled={isLoading}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">CGPA</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered input-sm"
                          placeholder="8.5"
                          value={currentEducation.cgpa}
                          onChange={(e) =>
                            setCurrentEducation({
                              ...currentEducation,
                              cgpa: e.target.value,
                            })
                          }
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addEducation}
                      disabled={isLoading}
                      className="btn btn-outline btn-primary btn-sm w-full"
                    >
                      <Plus size={16} /> Add Education
                    </button>

                    {/* Education List */}
                    {formData.education &&
                      formData.education.map((edu, idx) => (
                        <div
                          key={idx}
                          className="bg-base-200 p-3 rounded-lg flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{edu.degree}</p>
                            <p className="text-sm text-base-content/70">
                              {edu.institution}
                            </p>
                            {edu.year && (
                              <p className="text-xs text-base-content/60">
                                {edu.year}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEducation(idx)}
                            disabled={isLoading}
                            className="btn btn-ghost btn-xs"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                  </div>

                  {/* Work Experience */}
                  <div className="divider">Work Experience (Optional)</div>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Job Title</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full input-sm"
                        placeholder="Software Developer"
                        value={currentExperience.jobTitle}
                        onChange={(e) =>
                          setCurrentExperience({
                            ...currentExperience,
                            jobTitle: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Company</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full input-sm"
                        placeholder="Company name"
                        value={currentExperience.company}
                        onChange={(e) =>
                          setCurrentExperience({
                            ...currentExperience,
                            company: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Duration</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full input-sm"
                        placeholder="e.g., 2 years"
                        value={currentExperience.duration}
                        onChange={(e) =>
                          setCurrentExperience({
                            ...currentExperience,
                            duration: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Description</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered textarea-sm"
                        placeholder="What did you do?"
                        value={currentExperience.description}
                        onChange={(e) =>
                          setCurrentExperience({
                            ...currentExperience,
                            description: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addExperience}
                      disabled={isLoading}
                      className="btn btn-outline btn-primary btn-sm w-full"
                    >
                      <Plus size={16} /> Add Experience
                    </button>

                    {/* Experience List */}
                    {formData.workExperience &&
                      formData.workExperience.map((exp, idx) => (
                        <div
                          key={idx}
                          className="bg-base-200 p-3 rounded-lg flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{exp.jobTitle}</p>
                            <p className="text-sm text-base-content/70">
                              {exp.company}
                            </p>
                            {exp.duration && (
                              <p className="text-xs text-base-content/60">
                                {exp.duration}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExperience(idx)}
                            disabled={isLoading}
                            className="btn btn-ghost btn-xs"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                  </div>

                  {/* Languages */}
                  <div className="divider">Languages</div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input input-bordered flex-1 input-sm"
                        placeholder="e.g., English, Hindi"
                        value={currentLanguage}
                        onChange={(e) => setCurrentLanguage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addLanguage())
                        }
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={addLanguage}
                        disabled={isLoading}
                        className="btn btn-outline btn-primary btn-sm"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.languagesKnown &&
                        formData.languagesKnown.map((lang, idx) => (
                          <div key={idx} className="badge badge-primary gap-2">
                            {lang}
                            <button
                              type="button"
                              onClick={() => removeLanguage(idx)}
                              disabled={isLoading}
                              className="cursor-pointer hover:scale-110"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="divider">Projects (Optional)</div>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Project Title</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full input-sm"
                        placeholder="My Awesome Project"
                        value={currentProject.title}
                        onChange={(e) =>
                          setCurrentProject({
                            ...currentProject,
                            title: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Description</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered textarea-sm"
                        placeholder="What is the project about?"
                        value={currentProject.description}
                        onChange={(e) =>
                          setCurrentProject({
                            ...currentProject,
                            description: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Project Link</span>
                      </label>
                      <input
                        type="url"
                        className="input input-bordered w-full input-sm"
                        placeholder="https://github.com/..."
                        value={currentProject.link}
                        onChange={(e) =>
                          setCurrentProject({
                            ...currentProject,
                            link: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addProject}
                      disabled={isLoading}
                      className="btn btn-outline btn-primary btn-sm w-full"
                    >
                      <Plus size={16} /> Add Project
                    </button>

                    {/* Projects List */}
                    {formData.projects &&
                      formData.projects.map((proj, idx) => (
                        <div
                          key={idx}
                          className="bg-base-200 p-3 rounded-lg flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{proj.title}</p>
                            {proj.link && (
                              <a
                                href={proj.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary"
                              >
                                {proj.link}
                              </a>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProject(idx)}
                            disabled={isLoading}
                            className="btn btn-ghost btn-xs"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                  </div>

                  {/* Other Fields */}
                  <div className="divider">
                    Additional Information (Optional)
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Achievements</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered"
                      placeholder="Any awards or achievements?"
                      value={formData.achievements || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          achievements: e.target.value,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Marital Status</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={formData.maritalStatus || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maritalStatus: e.target.value,
                        })
                      }
                      disabled={isLoading}
                    >
                      <option value="">Select...</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Disability Status</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="If any"
                      value={formData.disabilityStatus || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          disabilityStatus: e.target.value,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Military Experience</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="If any"
                      value={formData.militaryExperience || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          militaryExperience: e.target.value,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Career Break</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="If any"
                      value={formData.careerBreak || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          careerBreak: e.target.value,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* HR-specific fields */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Company Name *
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="Your company name"
                      value={formData.companyName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyName: e.target.value,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Company Details *
                      </span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-24"
                      placeholder="Tell us about your company"
                      value={formData.companyDetails || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyDetails: e.target.value,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Company Website</span>
                    </label>
                    <input
                      type="url"
                      className="input input-bordered w-full"
                      placeholder="https://yourcompany.com"
                      value={formData.companyWebsite || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyWebsite: e.target.value,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  {/* HR Roles */}
                  <div className="divider">Hiring Roles</div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input input-bordered flex-1 input-sm"
                        placeholder="e.g., Software Developer"
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addRole())
                        }
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={addRole}
                        disabled={isLoading}
                        className="btn btn-outline btn-primary btn-sm"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.hrRoles &&
                        formData.hrRoles.map((role, idx) => (
                          <div
                            key={idx}
                            className="bg-base-200 p-3 rounded-lg flex justify-between items-center"
                          >
                            <span className="font-medium">{role}</span>
                            <button
                              type="button"
                              onClick={() => removeRole(idx)}
                              disabled={isLoading}
                              className="btn btn-ghost btn-xs"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 sm:pt-8">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`btn btn-primary btn-lg ${
                    isEditing ? "flex-1" : "w-full"
                  }`}
                >
                  {isLoading && <Loader2 className="animate-spin" size={18} />}
                  {isLoading
                    ? "Saving..."
                    : isProfileIncomplete
                    ? "Complete Profile"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show profile view
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-base-100 rounded-lg shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 gap-6">
          <div className="flex-1">
            {/* Profile Picture Section */}
            <div className="mb-6">
              <div className="relative inline-block">
                {profilePicPreview ? (
                  <img
                    src={profilePicPreview}
                    alt={profile.fullName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                  />
                ) : profile.profilePic ? (
                  <img
                    src={profile.profilePic}
                    alt={profile.fullName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-base-300 border-4 border-primary flex items-center justify-center">
                    <ImagePlus size={48} className="text-base-content/40" />
                  </div>
                )}

                {/* Upload Button for HR and Candidates */}
                <label className="absolute bottom-0 right-0 bg-primary text-primary-content rounded-full p-2 cursor-pointer hover:bg-primary-focus transition-colors">
                  <Upload size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    disabled={profilePicUploading}
                    className="hidden"
                  />
                </label>
              </div>
              {profilePicUploading && (
                <div className="mt-2 flex items-center gap-2 text-sm text-primary">
                  <Loader2 className="animate-spin" size={16} />
                  Uploading...
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold">{profile.fullName}</h1>
            <p className="text-base-content/60">{profile.email}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            className="btn btn-primary btn-outline"
          >
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            <Edit2 size={16} /> Edit Profile
          </button>
        </div>

        <div className="divider"></div>

        {/* Candidate Profile */}
        {isCandidate && (
          <div className="space-y-6">
            {/* Bio Section */}
            <div>
              <h3 className="text-xl font-bold mb-2">About</h3>
              <p className="text-base-content/80">
                {profile.bio || "Not provided"}
              </p>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="text-xl font-bold mb-2">Contact Details</h3>
              <p className="text-base-content/80">
                {profile.contactDetails || "Not provided"}
              </p>
            </div>

            {isCandidate && (
              <>
                {/* Preferred Job Roles */}
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Preferred Job Roles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferredJobRoles &&
                    profile.preferredJobRoles.length > 0 ? (
                      profile.preferredJobRoles.map((role, idx) => (
                        <span key={idx} className="badge badge-primary">
                          {role}
                        </span>
                      ))
                    ) : (
                      <p className="text-base-content/60">Not provided</p>
                    )}
                  </div>
                </div>

                {/* Resume */}
                {profile.resume && (
                  <div>
                    <h3 className="text-xl font-bold mb-3">Resume</h3>
                    <div className="bg-primary/10 border border-primary p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <File size={24} className="text-primary" />
                        <div>
                          <p className="font-medium text-primary">
                            Resume Document
                          </p>
                          <p className="text-sm text-base-content/60">
                            Click to view or download
                          </p>
                        </div>
                      </div>
                      <a
                        href={profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm gap-2"
                      >
                        <Download size={16} />
                        Open
                      </a>
                    </div>
                  </div>
                )}

                {/* Education */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Education</h3>
                  <div className="space-y-3">
                    {profile.education && profile.education.length > 0 ? (
                      profile.education.map((edu, idx) => (
                        <div key={idx} className="bg-base-200 p-4 rounded-lg">
                          <p className="font-semibold">{edu.degree}</p>
                          <p className="text-sm text-base-content/70">
                            {edu.institution}
                          </p>
                          {edu.year && (
                            <p className="text-sm text-base-content/70">
                              {edu.year}
                            </p>
                          )}
                          {edu.cgpa && (
                            <p className="text-sm text-base-content/70">
                              CGPA: {edu.cgpa}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-base-content/60">
                        No education details provided
                      </p>
                    )}
                  </div>
                </div>

                {/* Work Experience */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Work Experience</h3>
                  <div className="space-y-3">
                    {profile.workExperience &&
                    profile.workExperience.length > 0 ? (
                      profile.workExperience.map((exp, idx) => (
                        <div key={idx} className="bg-base-200 p-4 rounded-lg">
                          <p className="font-semibold">{exp.jobTitle}</p>
                          <p className="text-sm text-base-content/70">
                            {exp.company}
                          </p>
                          {exp.duration && (
                            <p className="text-sm text-base-content/70">
                              {exp.duration}
                            </p>
                          )}
                          {exp.description && (
                            <p className="text-sm text-base-content/70">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-base-content/60">
                        No work experience provided
                      </p>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Languages Known</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.languagesKnown &&
                    profile.languagesKnown.length > 0 ? (
                      profile.languagesKnown.map((lang, idx) => (
                        <span key={idx} className="badge badge-primary">
                          {lang}
                        </span>
                      ))
                    ) : (
                      <p className="text-base-content/60">
                        No languages provided
                      </p>
                    )}
                  </div>
                </div>

                {/* Projects */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Projects</h3>
                  <div className="space-y-3">
                    {profile.projects && profile.projects.length > 0 ? (
                      profile.projects.map((proj, idx) => (
                        <div key={idx} className="bg-base-200 p-4 rounded-lg">
                          <p className="font-semibold">{proj.title}</p>
                          {proj.description && (
                            <p className="text-sm text-base-content/70">
                              {proj.description}
                            </p>
                          )}
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary"
                            >
                              {proj.link}
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-base-content/60">
                        No projects provided
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                {profile.achievements && (
                  <div>
                    <h3 className="text-xl font-bold mb-2">Achievements</h3>
                    <p className="text-base-content/80">
                      {profile.achievements}
                    </p>
                  </div>
                )}

                {profile.maritalStatus && (
                  <div>
                    <h3 className="text-xl font-bold mb-2">Marital Status</h3>
                    <p className="text-base-content/80">
                      {profile.maritalStatus}
                    </p>
                  </div>
                )}

                {profile.disabilityStatus && (
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Disability Status
                    </h3>
                    <p className="text-base-content/80">
                      {profile.disabilityStatus}
                    </p>
                  </div>
                )}

                {profile.militaryExperience && (
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Military Experience
                    </h3>
                    <p className="text-base-content/80">
                      {profile.militaryExperience}
                    </p>
                  </div>
                )}

                {profile.careerBreak && (
                  <div>
                    <h3 className="text-xl font-bold mb-2">Career Break</h3>
                    <p className="text-base-content/80">
                      {profile.careerBreak}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* HR Profile */}
        {!isCandidate && (
          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <h3 className="text-xl font-bold mb-2">Company Name</h3>
              <p className="text-base-content/80">
                {profile.companyName || "Not provided"}
              </p>
            </div>

            {/* Company Details */}
            <div>
              <h3 className="text-xl font-bold mb-2">Company Details</h3>
              <p className="text-base-content/80">
                {profile.companyDetails || "Not provided"}
              </p>
            </div>

            {/* Company Website */}
            {profile.companyWebsite && (
              <div>
                <h3 className="text-xl font-bold mb-2">Company Website</h3>
                <a
                  href={profile.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                >
                  {profile.companyWebsite}
                </a>
              </div>
            )}

            {/* Hiring Roles */}
            {profile.hrRoles && profile.hrRoles.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-2">Hiring Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.hrRoles.map((role, idx) => (
                    <span key={idx} className="badge badge-primary">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

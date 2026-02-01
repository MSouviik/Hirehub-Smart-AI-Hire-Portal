import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
  Loader2,
  Plus,
  X,
  BookOpen,
  Briefcase,
  Code2,
  FileText,
  Languages,
  Award,
  Phone,
  User,
  ImagePlus,
} from "lucide-react";
import { axiosInstance } from "../lib/axios-config";

// Predefined suggestions
const DEGREES = [
  "B.Tech",
  "B.S.",
  "M.Tech",
  "M.S.",
  "M.B.A.",
  "B.A.",
  "M.A.",
  "Diploma",
  "Bachelor of Engineering",
  "Master of Engineering",
  "Bachelor of Science",
  "Master of Science",
];

const INSTITUTIONS = [
  "IIT Delhi",
  "IIT Mumbai",
  "IIT Bangalore",
  "IIT Hyderabad",
  "Delhi University",
  "Mumbai University",
  "Stanford University",
  "MIT",
  "Harvard University",
  "Cambridge University",
];

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

const LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Portuguese",
  "Korean",
  "Russian",
];

const CandidateOnboardingForm = () => {
  const { authUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [preferredRolesList, setPreferredRolesList] = useState([]);

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
  const [roleSuggestions, setRoleSuggestions] = useState([]);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [degreeSuggestions, setDegreeSuggestions] = useState([]);
  const [showDegreeSuggestions, setShowDegreeSuggestions] = useState(false);
  const [institutionSuggestions, setInstitutionSuggestions] = useState([]);
  const [showInstitutionSuggestions, setShowInstitutionSuggestions] =
    useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [isUploadingPic, setIsUploadingPic] = useState(false);

  // Handle degree suggestions
  const handleDegreeChange = (value) => {
    setCurrentEducation({ ...currentEducation, degree: value });
    if (value.trim()) {
      const filtered = DEGREES.filter((d) =>
        d.toLowerCase().includes(value.toLowerCase())
      );
      setDegreeSuggestions(filtered);
      setShowDegreeSuggestions(true);
    } else {
      setDegreeSuggestions([]);
      setShowDegreeSuggestions(false);
    }
  };

  const selectDegree = (degree) => {
    setCurrentEducation({ ...currentEducation, degree });
    setShowDegreeSuggestions(false);
  };

  // Handle institution suggestions
  const handleInstitutionChange = (value) => {
    setCurrentEducation({ ...currentEducation, institution: value });
    if (value.trim()) {
      const filtered = INSTITUTIONS.filter((i) =>
        i.toLowerCase().includes(value.toLowerCase())
      );
      setInstitutionSuggestions(filtered);
      setShowInstitutionSuggestions(true);
    } else {
      setInstitutionSuggestions([]);
      setShowInstitutionSuggestions(false);
    }
  };

  const selectInstitution = (institution) => {
    setCurrentEducation({ ...currentEducation, institution });
    setShowInstitutionSuggestions(false);
  };

  // Handle preferred role suggestions
  const handleRoleChange = (value) => {
    setCurrentRole(value);
    if (value.trim()) {
      const filtered = JOB_ROLES.filter(
        (role) =>
          role.toLowerCase().includes(value.toLowerCase()) &&
          !preferredRolesList.includes(role)
      );
      setRoleSuggestions(filtered);
      setShowRoleSuggestions(true);
    } else {
      setRoleSuggestions([]);
      setShowRoleSuggestions(false);
    }
  };

  const selectRole = (role) => {
    if (preferredRolesList.length < 3) {
      setPreferredRolesList([...preferredRolesList, role]);
      setCurrentRole("");
      setShowRoleSuggestions(false);
    } else {
      toast.error("Maximum 3 preferred roles allowed");
    }
  };

  const addRole = () => {
    if (currentRole.trim()) {
      if (preferredRolesList.length < 3) {
        if (!preferredRolesList.includes(currentRole)) {
          setPreferredRolesList([...preferredRolesList, currentRole]);
          setCurrentRole("");
          setShowRoleSuggestions(false);
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

  const removeRole = (index) => {
    setPreferredRolesList(preferredRolesList.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    if (currentEducation.degree && currentEducation.institution) {
      setEducationList([...educationList, currentEducation]);
      setCurrentEducation({ degree: "", institution: "", year: "", cgpa: "" });
    } else {
      toast.error("Please fill degree and institution");
    }
  };

  const removeEducation = (index) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    if (currentExperience.jobTitle && currentExperience.company) {
      setExperienceList([...experienceList, currentExperience]);
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
    setExperienceList(experienceList.filter((_, i) => i !== index));
  };

  const addProject = () => {
    if (currentProject.title) {
      setProjectsList([...projectsList, currentProject]);
      setCurrentProject({ title: "", description: "", link: "" });
    } else {
      toast.error("Please fill project title");
    }
  };

  const removeProject = (index) => {
    setProjectsList(projectsList.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    if (currentLanguage.trim()) {
      if (!formData.languagesKnown.includes(currentLanguage)) {
        setFormData({
          ...formData,
          languagesKnown: [...(formData.languagesKnown || []), currentLanguage],
        });
        setCurrentLanguage("");
      } else {
        toast.error("Language already added");
      }
    }
  };

  const removeLanguage = (index) => {
    setFormData({
      ...formData,
      languagesKnown: formData.languagesKnown.filter((_, i) => i !== index),
    });
  };

  const validateForm = () => {
    if (!formData.bio.trim()) return toast.error("Bio is mandatory");
    if (!formData.contactDetails.trim())
      return toast.error("Contact details are mandatory");
    if (educationList.length === 0)
      return toast.error("Add at least one education entry");
    if (preferredRolesList.length === 0)
      return toast.error("Add at least one preferred job role");
    if (!formData.resume) return toast.error("Resume/CV file is mandatory");
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

      setFormData({ ...formData, resume: response.data.resume });
      toast.success("Resume uploaded successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload resume");
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm() !== true) return;

    setIsLoading(true);
    try {
      const updatedData = {
        ...formData,
        education: educationList,
        workExperience: experienceList,
        projects: projectsList,
        preferredJobRoles: preferredRolesList,
      };

      await axiosInstance.post("/profile/complete-candidate", updatedData);
      toast.success("Profile completed successfully!");
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
            Complete Your Profile
          </h1>
          <p className="text-sm sm:text-base text-base-content/60 mb-6 sm:mb-8">
            Help employers understand your expertise and experience
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bio Section */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <User size={18} />
                  Bio *
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered focus:outline-none focus:border-primary"
                placeholder="Tell us about yourself..."
                rows="3"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
              />
            </div>

            {/* Contact Details */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <Phone size={18} />
                  Contact Details *
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered input-md w-full focus:outline-none focus:border-primary"
                placeholder="Phone number, LinkedIn, email, etc."
                value={formData.contactDetails}
                onChange={(e) =>
                  setFormData({ ...formData, contactDetails: e.target.value })
                }
              />
            </div>

            {/* Education Section */}
            <div className="divider flex items-center gap-2">
              <BookOpen size={18} />
              Education *
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    className="input input-bordered input-md focus:outline-none focus:border-primary w-full"
                    placeholder="Degree (e.g., B.Tech)"
                    value={currentEducation.degree}
                    onChange={(e) => handleDegreeChange(e.target.value)}
                  />
                  {showDegreeSuggestions && degreeSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-base-200 border border-primary rounded-md mt-1 z-10 max-h-40 overflow-y-auto">
                      {degreeSuggestions.map((degree, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-primary hover:text-primary-content"
                          onClick={() => selectDegree(degree)}
                        >
                          {degree}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className="input input-bordered input-md focus:outline-none focus:border-primary w-full"
                    placeholder="Institution"
                    value={currentEducation.institution}
                    onChange={(e) => handleInstitutionChange(e.target.value)}
                  />
                  {showInstitutionSuggestions &&
                    institutionSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-base-200 border border-primary rounded-md mt-1 z-10 max-h-40 overflow-y-auto">
                        {institutionSuggestions.map((inst, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-primary hover:text-primary-content"
                            onClick={() => selectInstitution(inst)}
                          >
                            {inst}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
                <input
                  type="text"
                  className="input input-bordered input-md focus:outline-none focus:border-primary"
                  placeholder="Graduation Year"
                  value={currentEducation.year}
                  onChange={(e) =>
                    setCurrentEducation({
                      ...currentEducation,
                      year: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  className="input input-bordered input-md focus:outline-none focus:border-primary"
                  placeholder="CGPA (Optional)"
                  value={currentEducation.cgpa}
                  onChange={(e) =>
                    setCurrentEducation({
                      ...currentEducation,
                      cgpa: e.target.value,
                    })
                  }
                />
              </div>
              <button
                type="button"
                onClick={addEducation}
                className="btn btn-sm btn-outline btn-primary w-full"
              >
                <Plus size={16} /> Add Education
              </button>

              {educationList.map((edu, index) => (
                <div
                  key={index}
                  className="bg-base-200 p-3 sm:p-4 rounded-lg flex justify-between items-start gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">
                      {edu.degree}
                    </p>
                    <p className="text-xs sm:text-sm text-base-content/70 truncate">
                      {edu.institution}
                    </p>
                    {edu.year && (
                      <p className="text-xs sm:text-sm text-base-content/70">
                        {edu.year}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="btn btn-ghost btn-sm flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Work Experience Section - Optional for Freshers */}
            <div className="divider flex items-center gap-2">
              <Briefcase size={18} />
              Work Experience (Optional)
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  className="input input-bordered input-md focus:outline-none focus:border-primary"
                  placeholder="Job Title"
                  value={currentExperience.jobTitle}
                  onChange={(e) =>
                    setCurrentExperience({
                      ...currentExperience,
                      jobTitle: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  className="input input-bordered input-md focus:outline-none focus:border-primary"
                  placeholder="Company"
                  value={currentExperience.company}
                  onChange={(e) =>
                    setCurrentExperience({
                      ...currentExperience,
                      company: e.target.value,
                    })
                  }
                />
              </div>
              <input
                type="text"
                className="input input-bordered input-md w-full focus:outline-none focus:border-primary"
                placeholder="Duration (e.g., Jan 2020 - Dec 2021)"
                value={currentExperience.duration}
                onChange={(e) =>
                  setCurrentExperience({
                    ...currentExperience,
                    duration: e.target.value,
                  })
                }
              />
              <textarea
                className="textarea textarea-bordered focus:outline-none focus:border-primary"
                placeholder="Job Description"
                rows="3"
                value={currentExperience.description}
                onChange={(e) =>
                  setCurrentExperience({
                    ...currentExperience,
                    description: e.target.value,
                  })
                }
              />
              <button
                type="button"
                onClick={addExperience}
                className="btn btn-sm btn-outline btn-primary w-full"
              >
                <Plus size={16} /> Add Experience
              </button>

              {experienceList.map((exp, index) => (
                <div
                  key={index}
                  className="bg-base-200 p-3 sm:p-4 rounded-lg flex justify-between items-start gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">
                      {exp.jobTitle}
                    </p>
                    <p className="text-xs sm:text-sm text-base-content/70 truncate">
                      {exp.company}
                    </p>
                    {exp.duration && (
                      <p className="text-xs sm:text-sm text-base-content/70">
                        {exp.duration}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="btn btn-ghost btn-sm flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Projects Section */}
            <div className="divider flex items-center gap-2">
              <Code2 size={18} />
              Projects (Optional)
            </div>
            <div className="space-y-4">
              <input
                type="text"
                className="input input-bordered input-md w-full focus:outline-none focus:border-primary"
                placeholder="Project Title"
                value={currentProject.title}
                onChange={(e) =>
                  setCurrentProject({
                    ...currentProject,
                    title: e.target.value,
                  })
                }
              />
              <textarea
                className="textarea textarea-bordered focus:outline-none focus:border-primary"
                placeholder="Project Description"
                rows="3"
                value={currentProject.description}
                onChange={(e) =>
                  setCurrentProject({
                    ...currentProject,
                    description: e.target.value,
                  })
                }
              />
              <input
                type="text"
                className="input input-bordered input-md w-full focus:outline-none focus:border-primary"
                placeholder="Project Link (Optional)"
                value={currentProject.link}
                onChange={(e) =>
                  setCurrentProject({ ...currentProject, link: e.target.value })
                }
              />
              <button
                type="button"
                onClick={addProject}
                className="btn btn-sm btn-outline btn-primary w-full"
              >
                <Plus size={16} /> Add Project
              </button>

              {projectsList.map((proj, index) => (
                <div
                  key={index}
                  className="bg-base-200 p-3 sm:p-4 rounded-lg flex justify-between items-start gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">
                      {proj.title}
                    </p>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-primary truncate block"
                      >
                        {proj.link}
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="btn btn-ghost btn-sm flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <Award size={18} />
                  Achievements & Awards (Optional)
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered focus:outline-none focus:border-primary"
                placeholder="List your achievements, certifications, awards..."
                rows="3"
                value={formData.achievements}
                onChange={(e) =>
                  setFormData({ ...formData, achievements: e.target.value })
                }
              />
            </div>

            {/* Languages */}
            <div className="divider flex items-center gap-2">
              <Languages size={18} />
              Languages Known (Optional)
            </div>
            <div className="space-y-4">
              <div className="relative flex gap-2">
                <input
                  type="text"
                  className="input input-bordered input-md flex-1 focus:outline-none focus:border-primary"
                  placeholder="Add a language"
                  value={currentLanguage}
                  onChange={(e) => setCurrentLanguage(e.target.value)}
                  list="language-suggestions"
                />
                <datalist id="language-suggestions">
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={addLanguage}
                  className="btn btn-outline btn-primary btn-md"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languagesKnown?.map((lang, index) => (
                  <div
                    key={index}
                    className="badge badge-lg badge-primary gap-2"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      className="text-primary-content hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="divider">Additional Information (Optional)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Disability Status</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-md focus:outline-none focus:border-primary"
                  placeholder="e.g., No, Yes"
                  value={formData.disabilityStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disabilityStatus: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Military Experience</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-md focus:outline-none focus:border-primary"
                  placeholder="e.g., None, 2 years"
                  value={formData.militaryExperience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      militaryExperience: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Career Break</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-md focus:outline-none focus:border-primary"
                  placeholder="e.g., None, 6 months"
                  value={formData.careerBreak}
                  onChange={(e) =>
                    setFormData({ ...formData, careerBreak: e.target.value })
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Marital Status</span>
                </label>
                <select
                  className="select select-bordered focus:outline-none focus:border-primary"
                  value={formData.maritalStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, maritalStatus: e.target.value })
                  }
                >
                  <option value="">Select...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>

            {/* Preferred Job Role & Resume */}
            <div className="divider flex items-center gap-2">
              <Briefcase size={18} />
              Job Preferences *
            </div>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Preferred Job Roles * (Max 3)
                  </span>
                </label>
                <div className="relative flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered input-md flex-1 focus:outline-none focus:border-primary"
                    placeholder="e.g., Software Developer"
                    value={currentRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={addRole}
                    className="btn btn-outline btn-primary btn-md"
                    disabled={preferredRolesList.length >= 3}
                  >
                    <Plus size={16} />
                  </button>
                  {showRoleSuggestions && roleSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-16 bg-base-200 border border-primary rounded-md mt-1 z-10 max-h-40 overflow-y-auto">
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
                <div className="flex flex-wrap gap-2 mt-3">
                  {preferredRolesList.map((role, index) => (
                    <div
                      key={index}
                      className="badge badge-lg badge-primary gap-2"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => removeRole(index)}
                        className="text-primary-content hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

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
                      <span className="text-sm">
                        ✓ Profile picture uploaded
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <FileText size={18} />
                    Resume/CV Upload *
                  </span>
                  <span className="label-text-alt text-xs text-base-content/60">
                    Accepted formats: PDF, DOC, DOCX (Max 5MB)
                  </span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="file-input file-input-bordered file-input-md w-full focus:outline-none focus:border-primary"
                />
                {formData.resume && (
                  <div className="alert alert-success mt-3 py-2">
                    <span className="text-sm">
                      ✓ Resume uploaded successfully
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 sm:pt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg flex-1 text-base sm:text-lg"
              >
                {isLoading && <Loader2 className="animate-spin" size={18} />}
                {isLoading ? "Saving..." : "Complete Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CandidateOnboardingForm;

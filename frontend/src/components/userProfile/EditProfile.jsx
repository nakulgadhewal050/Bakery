import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { getImageUrl } from "../../utils/getImageUrl";
import { toast } from "react-hot-toast";

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [setPreviewImg] = useState(null);
  const [imageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userType, setUserType] = useState(null); // 'user' or 'admin'

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    username: "",
  });

  // Check token validity - FIXED VERSION
  const checkTokenValidity = () => {
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("userToken");

    if (adminToken && adminToken !== "undefined" && adminToken !== "null") {
      try {
        const payload = JSON.parse(atob(adminToken.split(".")[1]));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          return { valid: true, type: "admin", token: adminToken };
        }
      } catch (e) {
        console.error("Invalid admin token:", e);
        // Token might still be valid (check with API)
        return { valid: true, type: "admin", token: adminToken };
      }
    }

    if (userToken && userToken !== "undefined" && userToken !== "null") {
      try {
        const payload = JSON.parse(atob(userToken.split(".")[1]));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          return { valid: true, type: "user", token: userToken };
        }
      } catch (e) {
        console.error("Invalid user token:", e);
        return { valid: true, type: "user", token: userToken };
      }
    }

    return { valid: false, type: null, token: null };
  };

  // Clear auth data
  const clearAuthData = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    window.dispatchEvent(new Event("storage"));
  };

  // Get image URL with fallback
  const getProfileImageUrl = (profilePicture) => {
    if (!profilePicture) {
      return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    }

    try {
      // Check if it's already a full URL
      if (
        profilePicture.startsWith("http://") ||
        profilePicture.startsWith("https://") ||
        profilePicture.startsWith("data:")
      ) {
        return profilePicture;
      }

      // Use the utility function
      const url = getImageUrl(profilePicture);
      return url || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    } catch (error) {
      console.error("Error getting profile image URL:", error);
      return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    }
  };

  // Fetch user/admin data
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);

      const tokenInfo = checkTokenValidity();

      if (!tokenInfo.valid) {
        toast.error("Session expired. Please login again.");
        clearAuthData();
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      setUserType(tokenInfo.type);

      // Set endpoints based on user type
      const endpoint =
        tokenInfo.type === "admin" ? "/api/admin/me" : "/api/auth/me";

      try {
        console.log("Fetching from endpoint:", endpoint);

        const res = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${tokenInfo.token}`,
          },
        });

        console.log("Profile API response:", res.data);

        let userData;
        if (tokenInfo.type === "admin") {
          // Admin response structure
          userData = res.data.admin || res.data;
          console.log("Admin data:", userData);
        } else {
          // User response structure
          userData = res.data.user || res.data;
          console.log("User data:", userData);
        }

        setUser(userData);

        // Set form values
        setForm({
          name: userData?.name || "",
          email: userData?.email || "",
          phone: userData?.phone || "",
          street: userData?.address?.street || "",
          city: userData?.address?.city || "",
          state: userData?.address?.state || "",
          pincode: userData?.address?.pincode || "",
          username: userData?.username || userData?.email?.split("@")[0] || "",
        });

        // Set preview image if exists
        if (userData?.profilePicture) {
          setPreviewImg(getProfileImageUrl(userData.profilePicture));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);

        // Show detailed error info
        if (err.response) {
          console.error("Response status:", err.response.status);
          console.error("Response data:", err.response.data);

          if (err.response.status === 404) {
            toast.error(
              "Profile endpoint not found. Please check backend routes."
            );
          } else if (
            err.response.status === 401 ||
            err.response.status === 403
          ) {
            toast.error("Session expired. Please login again.");
            clearAuthData();
            setTimeout(() => navigate("/login"), 1500);
          } else {
            toast.error(err.response.data?.message || "Failed to load profile");
          }
        } else if (err.request) {
          toast.error("No response from server. Check if backend is running.");
        } else {
          toast.error("Error: " + err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     // Validate file type
  //     if (!file.type.startsWith('image/')) {
  //       toast.error("Please select an image file (JPG, PNG, etc.)");
  //       return;
  //     }

  //     // Validate file size (max 5MB)
  //     if (file.size > 5 * 1024 * 1024) {
  //       toast.error("Image size should be less than 5MB");
  //       return;
  //     }

  //     setPreviewImg(URL.createObjectURL(file));
  //     setImageFile(file);
  //   }
  // };

  /* ================= UPDATE PROFILE ================= */
  const handleUpdateProfile = async () => {
    const tokenInfo = checkTokenValidity();

    if (!tokenInfo.valid) {
      toast.error("Session expired. Please login again.");
      clearAuthData();
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    setSaving(true);

    try {
      // For Admin updates
      if (userType === "admin") {
        console.log("Updating admin profile...");

        let profilePictureUrl = user?.profilePicture;

        // 1️⃣ Upload profile image if selected
        if (imageFile) {
          const fd = new FormData();
          fd.append("profilePic", imageFile);

          try {
            console.log("Uploading admin profile picture...");
            const imgRes = await axios.put(
              "/api/admin/upload-profile-pic",
              fd,
              {
                headers: {
                  Authorization: `Bearer ${tokenInfo.token}`,
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            console.log("Admin image upload response:", imgRes.data);
            if (imgRes.data.profilePicture) {
              profilePictureUrl = imgRes.data.profilePicture;
              toast.success("Profile picture uploaded!");
            }
          } catch (imgError) {
            console.error(
              "Admin image upload error:",
              imgError.response?.data || imgError.message
            );
            toast.error(
              imgError.response?.data?.message ||
                "Failed to upload profile picture"
            );
            // Continue with profile update even if image upload fails
          }
        }

        // 2️⃣ Update admin profile data
        const updateData = {
          name: form.name.trim(),
          phone: form.phone.trim(),
        };

        // Only include email if it's different (though usually can't change)
        if (form.email !== user?.email) {
          updateData.email = form.email.trim();
        }

        console.log("Sending admin update:", updateData);

        const res = await axios.put(
          `/api/admin/update-profile/${user._id}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${tokenInfo.token}`,
            },
          }
        );

        console.log("Admin update response:", res.data);

        // Update local storage
        const updatedAdmin = res.data.admin || { ...user, ...updateData };
        if (profilePictureUrl) {
          updatedAdmin.profilePicture = profilePictureUrl;
        }

        localStorage.setItem("adminInfo", JSON.stringify(updatedAdmin));
        setUser(updatedAdmin);

        toast.success("Admin profile updated successfully!");
        setTimeout(() => navigate("/profile"), 1000);
      } else {
        // For User updates
        console.log("Updating user profile...");

        let updatedUser = { ...user };
        let profilePictureUrl = user?.profilePicture;

        // 1️⃣ Upload profile image (OPTIONAL)
        if (imageFile) {
          const fd = new FormData();
          fd.append("profilePic", imageFile);

          try {
            console.log("Uploading user profile picture...");
            const imgRes = await axios.put("/api/user/upload-profile-pic", fd, {
              headers: {
                Authorization: `Bearer ${tokenInfo.token}`,
                "Content-Type": "multipart/form-data",
              },
            });

            console.log("User image upload response:", imgRes.data);
            if (imgRes.data.profilePicture) {
              profilePictureUrl = imgRes.data.profilePicture;
              updatedUser.profilePicture = profilePictureUrl;
              toast.success("Profile picture uploaded!");
            }
          } catch (imgError) {
            console.error(
              "User image upload error:",
              imgError.response?.data || imgError.message
            );
            toast.error(
              imgError.response?.data?.message ||
                "Failed to upload profile picture"
            );
            // Continue with profile update
          }
        }

        // 2️⃣ Update basic profile
        try {
          const profileRes = await axios.put(
            `/api/user/update-profile/${user._id}`,
            {
              name: form.name.trim(),
              username: form.username.trim(),
            },
            {
              headers: { Authorization: `Bearer ${tokenInfo.token}` },
            }
          );

          console.log("User profile update response:", profileRes.data);
          updatedUser = { ...updatedUser, ...profileRes.data.user };
        } catch (profileError) {
          console.error("Profile update error:", profileError);
          toast.error(
            profileError.response?.data?.message || "Failed to update profile"
          );
        }

        // 3️⃣ Update phone if changed
        if (form.phone && form.phone.trim() !== (user?.phone || "")) {
          try {
            const phoneRes = await axios.patch(
              "/api/user/add-phone",
              { phone: form.phone.trim() },
              { headers: { Authorization: `Bearer ${tokenInfo.token}` } }
            );
            console.log("Phone update response:", phoneRes.data);
            updatedUser.phone = phoneRes.data.phone;
          } catch (phoneError) {
            console.error("Phone update error:", phoneError);
            // Continue even if phone update fails
          }
        }

        // 4️⃣ Address - only for users
        const addressPayload = {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        };

        // Check if address exists
        const hasAddress = user?.address && user.address.street;

        try {
          if (!hasAddress && (addressPayload.street || addressPayload.city)) {
            // Create new address
            const addrRes = await axios.post(
              "/api/user/add-address",
              addressPayload,
              { headers: { Authorization: `Bearer ${tokenInfo.token}` } }
            );
            console.log("Add address response:", addrRes.data);
            updatedUser.address = addrRes.data.address;
          } else if (hasAddress) {
            // Update existing address
            const addrRes = await axios.put(
              "/api/user/update-address",
              addressPayload,
              { headers: { Authorization: `Bearer ${tokenInfo.token}` } }
            );
            console.log("Update address response:", addrRes.data);
            updatedUser.address = addrRes.data.address;
          }
        } catch (addrError) {
          console.error("Address update error:", addrError);
          // Continue even if address update fails
        }

        // 5️⃣ Sync everywhere
        if (profilePictureUrl) {
          updatedUser.profilePicture = profilePictureUrl;
        }

        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new Event("storage"));

        toast.success("Profile updated successfully!");
        setTimeout(() => navigate("/profile"), 1000);
      }
    } catch (err) {
      console.error("Update error:", err);

      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);

        if (err.response.status === 401 || err.response.status === 403) {
          toast.error("Session expired. Please login again.");
          clearAuthData();
          setTimeout(() => navigate("/login"), 1500);
        } else if (err.response.status === 404) {
          toast.error("API endpoint not found. Please check backend.");
        } else {
          toast.error(err.response.data?.message || "Failed to update profile");
        }
      } else if (err.request) {
        toast.error("No response from server. Check connection.");
      } else {
        toast.error("Error: " + err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fff0f3]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#e11d48] mb-4"></div>
        <p className="text-lg text-[#e11d48]">Loading profile...</p>
      </div>
    );
  }

  // No user data
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fff0f3]">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-[#e11d48] mb-2">
            No Profile Found
          </h2>
          <p className="text-[#e11d48] mb-6">
            Unable to load profile information.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-3 bg-[#fff0f3] text-white rounded-lg hover:bg-[#be123c] transition font-semibold"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-[#fff0f3] min-h-screen px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/profile")}
          className="mb-6 flex items-center text-[#e11d48] hover:text-[#be123c] transition"
        >
          <i className="bx bx-arrow-back text-xl mr-2"></i>
          Back to Profile
        </button>

        <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e11d48]">
                Edit {userType === "admin" ? "Admin" : "User"} Profile
              </h2>
              <p className="text-[#e11d48] mt-1">
                Update your personal information
              </p>
            </div>
            {userType === "admin" && user?.role && (
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  user.role === "super-admin"
                    ? "bg-[#e11d48] text-white"
                    : "bg-[#fff0f3] text-[#e11d48]"
                }`}
              >
                {user.role}
              </span>
            )}
          </div>

          {/* Profile Image Upload */}
          {/* <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 p-4 bg-gray-50 rounded-xl">
            <div className="relative">
              <img
                src={
                  previewImg ||
                  getProfileImageUrl(user?.profilePicture) ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                alt="profile"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                }}
              />
              
              <label className="absolute bottom-2 right-2 bg-[#DFA26D] text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-[#c98f5f] transition">
                <i className="bx bx-camera text-xl"></i>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user?.name}</h3>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                Click the camera icon to change profile picture
              </p>
              {imageFile && (
                <p className="text-sm text-green-600 mt-1">
                  New image selected: {imageFile.name}
                </p>
              )}
            </div>
          </div> */}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Common fields for both user and admin */}
            <div>
              <label className="font-medium text-gray-700 block mb-2">
                Full Name <span className="text-gray-700">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] focus:border-transparent outline-none transition"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="font-medium text-gray-700 block mb-2">
                Email <span className="text-gray-700">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] focus:border-transparent outline-none transition"
                placeholder="Enter your email"
                required
                disabled={userType === "admin"} // Admin email usually can't be changed
              />
              {userType === "admin" && (
                <p className="text-xs text-[#e11d48] mt-1">
                  Email cannot be changed
                </p>
              )}
            </div>

            <div>
              <label className="font-medium text-gray-700 block mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] focus:border-transparent outline-none transition"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Username (only for users) */}
            {userType === "user" && (
              <div>
                <label className="font-medium text-gray-700 block mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] focus:border-transparent outline-none transition"
                  placeholder="Choose a username"
                />
              </div>
            )}

            {/* Address fields (only for users) */}
            {userType === "user" && (
              <>
                <div>
                  <label className="font-medium text-gray-700 block mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] focus:border-transparent outline-none transition"
                    placeholder="Enter street address"
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] focus:border-transparent outline-none transition"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] focus:border-transparent outline-none transition"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] focus:border-transparent outline-none transition"
                    placeholder="Enter pincode"
                  />
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-6">
            <button
              onClick={() => navigate("/profile")}
              disabled={saving}
              className="px-8 py-3 bg-[#e11d48] text-white rounded-lg hover:bg-[#be123c] transition font-semibold disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleUpdateProfile}
              disabled={saving || !form.name || !form.email}
              className="flex-1 px-8 py-3 bg-[#e11d48] text-white rounded-lg hover:bg-[#be123c] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <i className="bx bx-loader-alt animate-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bx bx-save"></i>
                  Update Profile
                </>
              )}
            </button>
          </div>

          {/* Debug Info */}
        </div>
      </div>
    </div>
  );
}
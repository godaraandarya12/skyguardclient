import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUser, FiSave, FiEye, FiEyeOff, FiLink, FiShield, FiClock, FiCalendar } from 'react-icons/fi';

const SettingsPage = () => {
  const deviceid = "GAST2ccf672af4ea";
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    deviceID: deviceid
  });
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://100.66.89.46:3000/api/auth/device/${deviceid}`);
        const user = response.data.data.user;
        
        setFormData({
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          password: '',
          deviceID: deviceid
        });
        
        setUserDetails({
          role: user.role,
          parentUserId: user.parent_user_id,
          createdAt: new Date(user.created_at).toLocaleString(),
          updatedAt: new Date(user.updated_at).toLocaleString(),
          rtps: user.rtps,
          devices: user.devices
        });
        
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load user data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [deviceid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await axios.put(
        'http://100.66.89.46:3000/api/auth/updateProfile',
        formData
      );
      toast.success('🎉 Profile updated successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      toast.error('⚠️ ' + (error.response?.data?.message || 'Failed to update profile'), {
        position: "top-center"
      });
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="mt-4 text-xl font-light animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Profile Form */}
          <div className="flex-1">
            <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <FiUser className="mr-3" /> Profile Settings
                </h2>
                <p className="text-blue-100 mt-1">Manage your personal information</p>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-1">
                    <label className="block text-gray-300">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-gray-300">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      className="w-full px-4 py-3 bg-gray-700 text-gray-400 border border-gray-600 rounded-lg cursor-not-allowed"
                      disabled
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-gray-300">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-gray-300">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-gray-300">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Leave blank to keep current password"
                        className="w-full px-4 py-3 pr-12 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Password must be at least 8 characters long</p>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${isUpdating ? 'bg-blue-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'}`}
                  >
                    {isUpdating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiSave /> Update Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Additional Information Sidebar */}
          <div className="md:w-80 flex-shrink-0">
            <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden h-full">
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6">
                <h2 className="text-xl font-bold flex items-center">
                  <FiShield className="mr-3" /> Account Details
                </h2>
                <p className="text-purple-100 mt-1">Your security information</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider">Account Type</h3>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="font-medium capitalize">{userDetails.role} Account</p>
                    {userDetails.parentUserId && (
                      <p className="text-sm text-gray-400 mt-1">Parent ID: {userDetails.parentUserId}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider">Timestamps</h3>
                  <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-3">
                      <FiCalendar className="text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">Created</p>
                        <p>{userDetails.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiClock className="text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">Last Updated</p>
                        <p>{userDetails.updatedAt}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider">RTSP Streams</h3>
                  <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                    {userDetails.rtps.map((rtp, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <FiLink className="text-purple-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium capitalize">{rtp.name}</p>
                          <p className="text-sm text-gray-400 break-all">{rtp.data.replace(/\/\/.*@/, '//*****:*****@')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider">Linked Devices</h3>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <ul className="space-y-2">
                      {userDetails.devices.map((device, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${device === deviceid ? 'bg-green-400' : 'bg-blue-400'}`}></span>
                          <span className={device === deviceid ? 'font-medium' : ''}>{device}</span>
                          {device === deviceid && <span className="ml-auto text-xs bg-blue-600 px-2 py-1 rounded">Current</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
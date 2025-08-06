import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, User, Mail, Lock, Phone, MapPin,
  Plus, Trash2, ChevronDown, Check, X, Smartphone,
  Key, Shield, Info, Clipboard, Cpu, Server, Activity
} from 'react-feather';

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    devices: [{ deviceID: '', rtpsNames: [''], rtpsData: [''] }],
    role: 'user',
    parent_user_id: 'gajs'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculate password strength
    if (name === 'password') {
      let strength = 0;
      if (value.length > 0) strength += 1;
      if (value.length >= 8) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      if (/[0-9]/.test(value)) strength += 1;
      if (/[^A-Za-z0-9]/.test(value)) strength += 1;
      setPasswordStrength(strength);
    }
  };

  const handleDeviceChange = (deviceIndex, field, value) => {
    const updatedDevices = [...formData.devices];
    updatedDevices[deviceIndex][field] = value;
    setFormData(prev => ({
      ...prev,
      devices: updatedDevices
    }));
  };

  const handleRtpsChange = (deviceIndex, rtpsIndex, field, value) => {
    const updatedDevices = [...formData.devices];
    updatedDevices[deviceIndex][field][rtpsIndex] = value;
    setFormData(prev => ({
      ...prev,
      devices: updatedDevices
    }));
  };

  const addRtpsField = (deviceIndex) => {
    const updatedDevices = [...formData.devices];
    const currentRtpsCount = updatedDevices[deviceIndex].rtpsNames.length;
    if (currentRtpsCount < 2) {
      updatedDevices[deviceIndex].rtpsNames.push('');
      updatedDevices[deviceIndex].rtpsData.push('');
      setFormData(prev => ({
        ...prev,
        devices: updatedDevices
      }));
    }
  };

  const removeRtpsField = (deviceIndex, rtpsIndex) => {
    const updatedDevices = [...formData.devices];
    updatedDevices[deviceIndex].rtpsNames = updatedDevices[deviceIndex].rtpsNames.filter((_, i) => i !== rtpsIndex);
    updatedDevices[deviceIndex].rtpsData = updatedDevices[deviceIndex].rtpsData.filter((_, i) => i !== rtpsIndex);
    setFormData(prev => ({
      ...prev,
      devices: updatedDevices
    }));
  };

  const addDeviceField = () => {
    setFormData(prev => ({
      ...prev,
      devices: [...prev.devices, { deviceID: '', rtpsNames: [''], rtpsData: [''] }]
    }));
  };

  const removeDeviceField = (deviceIndex) => {
    const updatedDevices = formData.devices.filter((_, i) => i !== deviceIndex);
    setFormData(prev => ({
      ...prev,
      devices: updatedDevices
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/add-child', formData);

      setSuccess('User created successfully!');

      // Reset form with animation
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          address: '',
          devices: [{ deviceID: '', rtpsNames: [''], rtpsData: [''] }],
          role: 'user',
          parent_user_id: 'gajs'
        });
        setPasswordStrength(0);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Animated Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <UserPlus className="mr-3 text-blue-600 dark:text-blue-400" size={28} />
                  Create New User
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Add team members with detailed configurations
                </p>
              </div>
              <div className="flex space-x-2">
                
              </div>
            </div>
          </motion.div>

          {/* Status Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm flex items-start"
              >
                <X className="flex-shrink-0 mr-3 text-red-500" size={20} />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg shadow-sm flex items-start"
              >
                <Check className="flex-shrink-0 mr-3 text-green-500" size={20} />
                <div>
                  <p className="font-medium">Success</p>
                  <p className="text-sm">{success}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Tabs */}
          <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveSection('basic')}
              className={`px-4 py-2 font-medium text-sm flex items-center ${activeSection === 'basic' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <User className="mr-2" size={16} />
              Basic Info
            </button>
            <button
              onClick={() => setActiveSection('security')}
              className={`px-4 py-2 font-medium text-sm flex items-center ${activeSection === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Shield className="mr-2" size={16} />
              Security
            </button>
            <button
              onClick={() => setActiveSection('devices')}
              className={`px-4 py-2 font-medium text-sm flex items-center ${activeSection === 'devices' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Cpu className="mr-2" size={16} />
              Devices
            </button>
          </div>

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info Section */}
              <AnimatePresence>
                {activeSection === 'basic' && (
                  <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {/* Name Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <User className="mr-2 text-gray-400" size={16} />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    {/* Email Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <Mail className="mr-2 text-gray-400" size={16} />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="user@example.com"
                        required
                      />
                    </div>

                    {/* Phone Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <Phone className="mr-2 text-gray-400" size={16} />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    {/* Address Field */}
                    <div className="md:col-span-2 group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <MapPin className="mr-2 text-gray-400" size={16} />
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                        rows="2"
                        placeholder="123 Main Street, City, State ZIP"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Security Section */}
              <AnimatePresence>
                {activeSection === 'security' && (
                  <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {/* Password Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <Lock className="mr-2 text-gray-400" size={16} />
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="Password"
                        required
                      />
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${passwordStrength >= 1 ? 'bg-red-400' : ''} ${passwordStrength >= 3 ? 'bg-yellow-400' : ''} ${passwordStrength >= 5 ? 'bg-green-500' : ''}`}
                              style={{ width: `${passwordStrength * 20}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {passwordStrength === 0 ? 'Very weak' :
                              passwordStrength <= 2 ? 'Weak' :
                                passwordStrength <= 4 ? 'Good' : 'Strong'}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500 flex items-center">
                          <Info className="mr-1" size={12} />
                          Use 8+ characters with uppercase, numbers & symbols
                        </div>
                      </div>
                    </div>

                    {/* Role Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <Shield className="mr-2 text-gray-400" size={16} />
                        User Role
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white appearance-none"
                      >
                        <option value="user">Standard User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Devices Section */}
              <AnimatePresence>
                {activeSection === 'devices' && (
                  <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="space-y-6"
                  >
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <Cpu className="mr-2 text-gray-400" size={16} />
                        Devices (Each with up to 2 RTPS Entries)
                      </label>
                      <div className="space-y-6">
                        {formData.devices.map((device, deviceIndex) => (
                          <motion.div
                            key={deviceIndex}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: deviceIndex * 0.1 }}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
                          >
                            {/* Device ID */}
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Smartphone className="text-gray-400" size={16} />
                              </div>
                              <input
                                type="text"
                                value={device.deviceID}
                                onChange={(e) => handleDeviceChange(deviceIndex, 'deviceID', e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                placeholder="Device ID (e.g., ABC123-XYZ)"
                                required
                              />
                            </div>

                            {/* RTPS Entries for this device */}
                            <div className="space-y-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                <Server className="mr-2 text-gray-400" size={16} />
                                RTPS Entries (Up to 2)
                              </label>
                              {device.rtpsNames.map((rtpsName, rtpsIndex) => (
                                <motion.div
                                  key={rtpsIndex}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: rtpsIndex * 0.05 }}
                                  className="flex items-center space-x-3"
                                >
                                  <input
                                    type="text"
                                    value={rtpsName}
                                    onChange={(e) => handleRtpsChange(deviceIndex, rtpsIndex, 'rtpsNames', e.target.value)}
                                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="RTPS Name"
                                    required
                                  />
                                  <input
                                    type="text"
                                    value={device.rtpsData[rtpsIndex]}
                                    onChange={(e) => handleRtpsChange(deviceIndex, rtpsIndex, 'rtpsData', e.target.value)}
                                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="RTPS Data"
                                    required
                                  />
                                  {rtpsIndex > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => removeRtpsField(deviceIndex, rtpsIndex)}
                                      className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition flex items-center justify-center"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </motion.div>
                              ))}
                              {device.rtpsNames.length < 2 && (
                                <motion.button
                                  type="button"
                                  onClick={() => addRtpsField(deviceIndex)}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                  className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition mt-2"
                                >
                                  <Plus className="mr-2" size={14} />
                                  Add RTPS Entry
                                </motion.button>
                              )}
                            </div>

                            {deviceIndex > 0 && (
                              <button
                                type="button"
                                onClick={() => removeDeviceField(deviceIndex)}
                                className="w-full p-2 bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-700/30 transition flex items-center justify-center text-sm"
                              >
                                <Trash2 className="mr-2" size={14} />
                                Remove Device
                              </button>
                            )}
                          </motion.div>
                        ))}
                       
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start">
                        <Info className="text-blue-500 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" size={16} />
                        <div>
                          <h4 className="text-xs font-medium text-black-600 dark:text-black-300">Device Linking Tips</h4>
                          <p className="text-xs text-black-600 dark:text-black-300 mt-1">
                            Ensure device IDs match exactly with the hardware identifiers. You can find these in the device settings or administration panel. Each device can have up to 2 RTPS entries.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Actions */}
              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                  {activeSection !== 'basic' && (
                    <motion.button
                      type="button"
                      onClick={() => setActiveSection(activeSection === 'security' ? 'basic' : 'security')}
                      whileHover={{ x: -2 }}
                      className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center"
                    >
                      Back
                    </motion.button>
                  )}
                </div>
                <div className="flex space-x-3">
                  {activeSection !== 'devices' && (
                    <motion.button
                      type="button"
                      onClick={() => setActiveSection(activeSection === 'basic' ? 'security' : 'devices')}
                      whileHover={{ x: 2 }}
                      className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center"
                    >
                      Next
                    </motion.button>
                  )}
                  {activeSection === 'devices' && (
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating User...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2" size={16} />
                          Create User
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;
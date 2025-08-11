import React, { useState, useEffect } from 'react';
import { FiSettings, FiTrash2, FiPower, FiEdit, FiPlus, FiSearch } from 'react-icons/fi';
import { FaVideo, FaCamera } from 'react-icons/fa';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const DevicesPage = () => {
   const [searchParams] = useSearchParams();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    deviceId: '',
    deviceName: '',
    deviceType: 'IPCamera',
    rtspUrl1: '',
    rtspUrl2: '',
    ipAddress: ''
  });
const searchedDeviceId = searchParams.get("deviceId");
  
 // Set search term from URL param only on mount or when param changes
  useEffect(() => {
    if (searchedDeviceId) {
      setSearchTerm(searchedDeviceId);
    }
  }, [searchedDeviceId]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/DeviceRegister/devices');
        if (response.data && Array.isArray(response.data.data)) {
          setDevices(response.data.data);
        } else {
          console.error('Unexpected API response structure');
          setDevices([]);
        }
      } catch (error) {
        console.error('Error fetching device data:', error);
        alert('Failed to fetch devices. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        deviceId: newDevice.deviceId,
        device_name: newDevice.deviceName,
        device_type: newDevice.deviceType,
        rtsp_url1: newDevice.rtspUrl1,
        rtsp_url2: newDevice.rtspUrl2,
        ip_address: newDevice.ipAddress,
        status: 'active' // Default status for new devices
      };

      console.log("📤 Sending Add Payload:", JSON.stringify(payload));
      const response = await axios.post('http://localhost:3000/api/DeviceRegister', payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      setDevices([...devices, response.data.data]);
      setIsAddModalOpen(false);
      setNewDevice({
        deviceId: '',
        deviceName: '',
        deviceType: 'IPCamera',
        rtspUrl1: '',
        rtspUrl2: '',
        ipAddress: ''
      });
      alert('Device added successfully!');
    } catch (error) {
      console.error('Error adding device:', error.response?.data || error.message);
      alert('Failed to add device. Please check the input and try again.');
    }
  };

  const handleEditDevice = (device) => {
    setEditDevice({
      device_id: device.device_id,
      deviceId: device.device_id, // Include deviceId to match Postman payload
      device_name: device.device_name,
      device_type: device.device_type,
      rtsp_url1: device.rtsp_url1,
      rtsp_url2: device.rtsp_url2 || '',
      ip_address: device.ip_address,
      status: device.status || 'active' // Ensure status is included
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateDevice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        deviceId: editDevice.device_id, // Include deviceId to match Postman
        device_name: editDevice.device_name,
        device_type: editDevice.device_type,
        rtspUrl1: editDevice.rtsp_url1,
        rtspUrl2: editDevice.rtsp_url2,
        ipAddress: editDevice.ip_address,
        // Include status
      };``

      console.log("📤 Sending Update Payload:", JSON.stringify(payload));
      const response = await axios.put(
        `http://localhost:3000/api/DeviceRegister/${editDevice.device_id}`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      setDevices(devices.map((d) =>
        d.device_id === editDevice.device_id ? response.data.data : d
      ));

      setIsEditModalOpen(false);
      setEditDevice(null);
      alert('Device updated successfully!');
    } catch (error) {
      console.error('Error updating device:', error.response?.data || error.message);
      alert(`Failed to update device: ${error.response?.data?.message || 'Please try again.'}`);
    }
  };

  const filteredDevices = devices.filter(device =>
    device.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.device_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (device, action) => {
    setSelectedDevice(device);
    setActionType(action);
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    try {
      if (actionType === 'delete') {
        await axios.delete(`http://localhost:3000/api/DeviceRegister/${selectedDevice.device_id}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        setDevices(devices.filter(d => d.device_id !== selectedDevice.device_id));
        alert('Device deleted successfully!');
      } else {
        const newStatus = actionType === 'deactivate' ? 'inactive' : 'active';
        await axios.patch(
          `http://localhost:3000/api/DeviceRegister/${selectedDevice.device_id}/status`,
          { status: newStatus },
          { headers: { 'Content-Type': 'application/json' } }
        );
        setDevices(devices.map(d =>
          d.device_id === selectedDevice.device_id
            ? { ...d, status: newStatus }
            : d
        ));
        alert(`Device ${actionType}d successfully!`);
      }
    } catch (error) {
      console.error(`Error performing ${actionType} action:`, error.response?.data || error.message);
      alert(`Failed to ${actionType} device: ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setIsModalOpen(false);
      setSelectedDevice(null);
      setActionType('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Device Management</h1>
          <p className="text-gray-600">Manage all your connected devices</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="mt-4 md:mt-0 flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
        >
          <FiPlus className="mr-2" />
          Add New Device
        </button>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="relative w-full md:w-64 mb-4 md:mb-0">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-4">
            <div className="bg-indigo-50 p-3 rounded-lg">
              <p className="text-sm text-indigo-600">Total Devices</p>
              <p className="text-2xl font-bold text-indigo-800">{devices.length}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-600">Active</p>
              <p className="text-2xl font-bold text-green-800">
                {devices.filter(d => d.status === 'active').length}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-600">Inactive</p>
              <p className="text-2xl font-bold text-red-800">
                {devices.filter(d => d.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Device Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-48 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <div key={device.device_id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mr-4">
                      {device.device_type === 'Camera' ? (
                        <FaCamera size={20} />
                      ) : (
                        <FaVideo size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{device.device_name}</h3>
                      <p className="text-sm text-gray-500">{device.device_id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                    {device.status}
                  </span>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">IP Address</span>
                    <span className="text-sm font-medium text-gray-800">{device.ip_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Rtsp</span>
                    <span className="text-sm font-medium text-gray-800">{device.rtsp_url1}</span>
                  </div>
                  {device.rtsp_url2 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Rtsp 2</span>
                      <span className="text-sm font-medium text-gray-800">{device.rtsp_url2}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex justify-end space-x-2">
                <button
                  onClick={() => handleAction(device, device.status === 'active' ? 'deactivate' : 'activate')}
                  className={`p-2 rounded-lg ${device.status === 'active' ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                  title={device.status === 'active' ? 'Deactivate' : 'Activate'}
                >
                  <FiPower />
                </button>
                <button
                  onClick={() => handleEditDevice(device)}
                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                  title="Edit"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleAction(device, 'delete')}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDevices.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="mx-auto max-w-md">
            <FiSearch size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No devices found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search or filter' : 'No devices are currently registered'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md"
            >
              Add New Device
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {actionType === 'delete' && `Delete ${selectedDevice.device_name}?`}
              {actionType === 'deactivate' && `Deactivate ${selectedDevice.device_name}?`}
              {actionType === 'activate' && `Activate ${selectedDevice.device_name}?`}
            </h3>
            <p className="text-gray-600 mb-6">
              {actionType === 'delete' && 'This action cannot be undone. All data from this device will be permanently removed.'}
              {actionType === 'deactivate' && 'This device will stop functioning until it is activated again.'}
              {actionType === 'activate' && 'This device will be activated and available for use.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 rounded-lg text-white ${actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : actionType === 'deactivate' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {actionType === 'delete' && 'Delete'}
                {actionType === 'deactivate' && 'Deactivate'}
                {actionType === 'activate' && 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Device</h3>
            <form onSubmit={handleAddDevice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Device ID</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={newDevice.deviceId}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceId: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Device Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={newDevice.deviceName}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Device Type</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={newDevice.deviceType}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceType: e.target.value })}
                >
                  <option value="IPCamera">IP Camera</option>
                  <option value="Camera">Camera</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">RTSP URL 1</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={newDevice.rtspUrl1}
                  onChange={(e) => setNewDevice({ ...newDevice, rtspUrl1: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">RTSP URL 2 (Optional)</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={newDevice.rtspUrl2}
                  onChange={(e) => setNewDevice({ ...newDevice, rtspUrl2: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={newDevice.ipAddress}
                  onChange={(e) => setNewDevice({ ...newDevice, ipAddress: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Device Modal */}
      {isEditModalOpen && editDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Device</h3>
            <form onSubmit={handleUpdateDevice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Device ID</label>
                <input
                  type="text"
                  disabled
                  className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm"
                  value={editDevice.device_id}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Device Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={editDevice.device_name}
                  onChange={(e) => setEditDevice({ ...editDevice, device_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Device Type</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={editDevice.device_type}
                  onChange={(e) => setEditDevice({ ...editDevice, device_type: e.target.value })}
                >
                  <option value="IPCamera">IP Camera</option>
                  <option value="Camera">Camera</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">RTSP URL 1</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={editDevice.rtsp_url1}
                  onChange={(e) => setEditDevice({ ...editDevice, rtsp_url1: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">RTSP URL 2 (Optional)</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={editDevice.rtsp_url2 || ''}
                  onChange={(e) => setEditDevice({ ...editDevice, rtsp_url2: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={editDevice.ip_address}
                  onChange={(e) => setEditDevice({ ...editDevice, ip_address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={editDevice.status}
                  onChange={(e) => setEditDevice({ ...editDevice, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditDevice(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;
export default function VideoStream() {
  return (
    <div className="w-3/4 bg-gray-50 flex items-center justify-center p-6">
      <div className="relative w-full h-[90%] bg-white rounded-2xl shadow-md flex flex-col items-center justify-center border border-gray-200">
        
        {/* Live Feed Label */}
        <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm tracking-wide">
          🔴 LIVE FEED
        </div>

        {/* Video Placeholder */}
        <div className="w-11/12 h-4/5 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
          <span className="text-gray-500 text-lg font-medium tracking-wide">[ Video Stream Area ]</span>
        </div>
        
      </div>
    </div>
  );
}

import SidePanel from './SidePanel';
import VideoStream from './VideoStream';

export default function Dashboard() {
  return (
    <div className="flex h-screen">
      <SidePanel />
      <VideoStream />
    </div>
  );
}

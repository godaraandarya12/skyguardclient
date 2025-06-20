// // CameraFeed.js
// import React from 'react';
// import { DailyIframe } from '@daily-co/daily-js';

// const roomUrl = "https://skyguarddb.daily.co/l6Xmzl775czFg4v01gCC"; // replace with your URL

// function CameraFeed() {
//   const callFrame = DailyIframe.createFrame({
//     showLeaveButton: true,
//     iframeStyle: {
//       width: '100%',
//       height: '100vh',
//       border: '0',
//     },
//   });

//   React.useEffect(() => {
//     callFrame.join({ url: roomUrl });
//     return () => callFrame.leave();
//   }, []);

//   return <div ref={(ref) => ref && ref.appendChild(callFrame.iframe())} />;
// }

// export default CameraFeed;

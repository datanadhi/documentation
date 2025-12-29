// import React from 'react';

// export default function DrawioEmbed({ 
//   file, 
//   height = '600px',
//   lightbox = true,
//   highlight = '0000ff',
//   edit = '_blank',
//   layers = true,
//   nav = true,
//   title = ''
// }) {
//   // Base GitHub raw URL
//   const baseUrl = 'https://raw.githubusercontent.com/datanadhi/drawio/main';
  
//   // Construct full URL and encode it
//   const fullUrl = `${baseUrl}/${file}`;
//   const encodedUrl = encodeURIComponent(fullUrl);
  
//   // Build viewer URL with parameters
//   const viewerParams = [
//     lightbox ? 'lightbox=1' : 'lightbox=0',
//     `highlight=${highlight}`,
//     `edit=${edit}`,
//     layers ? 'layers=1' : 'layers=0',
//     nav ? 'nav=1' : 'nav=0',
//     title ? `title=${encodeURIComponent(title)}` : ''
//   ].filter(Boolean).join('&');
  
//   const viewerUrl = `https://viewer.diagrams.net/?${viewerParams}#U${encodedUrl}`;
  
//   return (
//     <div style={{ margin: '20px 0' }}>
//       <iframe
//         frameBorder="0"
//         style={{ 
//           width: '100%', 
//           height, 
//           border: '1px solid #e0e0e0',
//           borderRadius: '4px'
//         }}
//         src={viewerUrl}
//         title={title || 'Draw.io Diagram'}
//         allowFullScreen
//       />
//     </div>
//   );
// }


import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';

export default function DrawioEmbed({ 
  file, 
  height = '600px',
  lightbox = true,
  highlight = '0000ff',
  edit = '_blank',
  layers = true,
  nav = true,
  title = ''
}) {
  const { colorMode } = useColorMode();

  const baseUrl = 'https://raw.githubusercontent.com/datanadhi/drawio/main';
  const fullUrl = `${baseUrl}/${file}`;
  const encodedUrl = encodeURIComponent(fullUrl);

  const uiTheme = colorMode === 'dark' ? 'dark' : 'light';

  const viewerParams = [
    `ui=${uiTheme}`,
    lightbox ? 'lightbox=1' : 'lightbox=0',
    `highlight=${highlight}`,
    `edit=${edit}`,
    layers ? 'layers=1' : 'layers=0',
    nav ? 'nav=1' : 'nav=0',
    title ? `title=${encodeURIComponent(title)}` : ''
  ].filter(Boolean).join('&');

  const viewerUrl = `https://viewer.diagrams.net/?${viewerParams}#U${encodedUrl}`;

  return (
    <div style={{ margin: '20px 0' }}>
      <iframe
        frameBorder="0"
        style={{
          width: '100%',
          height,
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: '4px'
        }}
        src={viewerUrl}
        title={title || 'Draw.io Diagram'}
        allowFullScreen
      />
    </div>
  );
}
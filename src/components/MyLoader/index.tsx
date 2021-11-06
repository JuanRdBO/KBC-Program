import React from 'react';
import ContentLoader from 'react-content-loader';

export const CardLoader = () => (
  <ContentLoader
    speed={2}
    width={180}
    height={200}
    viewBox="0 0 240 290"
    backgroundColor="#0c0c0c"
    foregroundColor="#595959"
  >
    <rect x="9" y="0" rx="14" ry="14" width="232" height="240" />
    <rect x="62" y="251" rx="0" ry="6" width="125" height="21" />
    {/* <rect x="9" y="320" rx="5" ry="6" width="232" height="54" />  */}
  </ContentLoader>
);

export const ThreeDots = () => (
  <ContentLoader
    viewBox="0 0 212 200"
    height={200}
    width={212}
    backgroundColor="transparent"
    style={{
      width: '100%',
      margin: 'auto',
    }}
  >
    <circle cx="86" cy="100" r="8" />
    <circle cx="106" cy="100" r="8" />
    <circle cx="126" cy="100" r="8" />
  </ContentLoader>
);

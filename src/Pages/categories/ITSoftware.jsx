import React from 'react';
import CategoryTemplate from './CategoryTemplate';
import { FaLaptopCode } from 'react-icons/fa';

const ITSoftware = () => (
  <CategoryTemplate
    title="IT & Software Development"
    categoryName="IT & Software"
    description="Software engineering, full-stack development, cloud architecture, cybersecurity, and data science roles."
    icon={<FaLaptopCode />}
  />
);

export default ITSoftware;

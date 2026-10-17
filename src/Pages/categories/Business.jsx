import React from 'react';
import CategoryTemplate from './CategoryTemplate';
import { FaBriefcase } from 'react-icons/fa';

const Business = () => (
  <CategoryTemplate
    title="Business, Operations & Strategy"
    categoryName="Business"
    description="Business development, strategic management, corporate consulting, project leadership, and sales."
    icon={<FaBriefcase />}
  />
);

export default Business;

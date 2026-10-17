import React from 'react';
import CategoryTemplate from './CategoryTemplate';
import { FaHardHat } from 'react-icons/fa';

const Construction = () => (
  <CategoryTemplate
    title="Construction & Infrastructure"
    categoryName="Construction"
    description="Civil engineering, structural design, real estate architecture, site superintendents, and construction planning."
    icon={<FaHardHat />}
  />
);

export default Construction;

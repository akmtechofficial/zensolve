import React from 'react';
import CategoryTemplate from './CategoryTemplate';
import { FaGraduationCap } from 'react-icons/fa';

const Education = () => (
  <CategoryTemplate
    title="Education & Academic Administration"
    categoryName="Education"
    description="Institutional management, academic counseling, educational content development, and admissions."
    icon={<FaGraduationCap />}
  />
);

export default Education;

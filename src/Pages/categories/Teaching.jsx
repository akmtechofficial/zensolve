import React from 'react';
import CategoryTemplate from './CategoryTemplate';
import { FaChalkboardTeacher } from 'react-icons/fa';

const Teaching = () => (
  <CategoryTemplate
    title="Teaching, Faculty & Instruction"
    categoryName="Teaching"
    description="Primary, secondary, and higher education teaching faculties, corporate instructors, and language tutors."
    icon={<FaChalkboardTeacher />}
  />
);

export default Teaching;

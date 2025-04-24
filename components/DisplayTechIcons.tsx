import React from 'react'
import { getTechLogos } from '@/lib/utils';

const DisplayTechIcons = async ({ techstack }: TechIconProps) => {
    const techIcons = await getTechLogos(techstack || []);
  
    return (
      <div className='flex flex-row'>
        {techIcons.slice(0, 3).map(({ tech, url }, index) => (
          <div key={index} className='relative group bg-dark-300 rounded-full p-2 flex-center'>
            <span className='tech-tooltip'>{tech}</span>
          </div>
        ))}
      </div>
    );
  };
  

export default DisplayTechIcons;

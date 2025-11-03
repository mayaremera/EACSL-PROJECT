// import React from 'react';
// import { Facebook, Instagram, Twitter } from 'lucide-react';

// const Footer = () => {
//   const footerSections = [
//     {
//       title: 'Get In Touch',
//       content: (
//         <>
//           <p className="text-white/80 text-sm mb-6 max-w-xs">
//             the quick fox jumps over the lazy dog
//           </p>
//           <div className="flex gap-4">
//             <a 
//               href="#" 
//               className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
//               aria-label="Facebook"
//             >
//               <Facebook className="w-5 h-5 text-white" />
//             </a>
//             <a 
//               href="#" 
//               className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
//               aria-label="Instagram"
//             >
//               <Instagram className="w-5 h-5 text-white" />
//             </a>
//             <a 
//               href="#" 
//               className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
//               aria-label="Twitter"
//             >
//               <Twitter className="w-5 h-5 text-white" />
//             </a>
//           </div>
//         </>
//       )
//     },
//     {
//       title: 'Company Info',
//       links: ['About Us', 'Carrier', 'We are hiring', 'Blog']
//     },
//     {
//       title: 'Features',
//       links: ['Business Marketing', 'User Analytic', 'Live Chat', 'Unlimited Support']
//     },
//     {
//       title: 'Resources',
//       links: ['IOS & Android', 'Watch a Demo', 'Customers', 'API']
//     }
//   ];

//   return (
//     <footer className="bg-[#5A9B8E] py-16 px-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
//           {footerSections.map((section, index) => (
//             <div key={index}>
//               <h3 className="text-white text-lg font-bold mb-6">
//                 {section.title}
//               </h3>
              
//               {section.content ? (
//                 section.content
//               ) : (
//                 <ul className="space-y-3">
//                   {section.links.map((link, linkIndex) => (
//                     <li key={linkIndex}>
//                       <a 
//                         href="#" 
//                         className="text-white/80 text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
//                       >
//                         {link}
//                       </a>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;











import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import whiteLogo from '../../assets/white-eacsl-logo.png';

const Footer = () => {
  const footerSections = [
    {
      title: null,
      content: (
        <>
          <div className="mb-6">
            <img 
              src={whiteLogo} 
              alt="Company Logo" 
              className="h-12 w-auto"
            />
          </div>
          <div className="flex gap-4">
            <a 
              href="#" 
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 text-white" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5 text-white" />
            </a>
          </div>
        </>
      )
    },
    {
      title: 'Company Info',
      links: ['About Us', 'Carrier', 'We are hiring', 'Blog']
    },
    {
      title: 'Features',
      links: ['Business Marketing', 'User Analytic', 'Live Chat', 'Unlimited Support']
    },
    {
      title: 'Resources',
      links: ['IOS & Android', 'Watch a Demo', 'Customers', 'API']
    }
  ];

  return (
    <footer className="bg-[#5A9B8E] py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {footerSections.map((section, index) => (
            <div key={index}>
              {section.title && (
                <h3 className="text-white text-lg font-bold mb-6">
                  {section.title}
                </h3>
              )}
              
              {section.content ? (
                section.content
              ) : (
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a 
                        href="#" 
                        className="text-white/80 text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
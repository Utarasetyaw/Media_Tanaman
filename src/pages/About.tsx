import React, { Fragment } from 'react';
import type { FC } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { BookOpen, Users, Lightbulb, ChevronUp, Mail, Phone } from 'lucide-react';
import { useAboutData } from '../hooks/useAboutData';
import type { CompanyValue } from '../hooks/useAboutData';

const lang: 'id' | 'en' = 'id';

// --- Komponen untuk Kartu Nilai (tidak ada perubahan) ---
interface ValueCardProps {
  value: CompanyValue;
  icon: React.ReactNode;
}

const ValueCard: FC<ValueCardProps> = ({ value, icon }) => (
  <div className="p-6 text-center bg-[#004A49]/60 rounded-lg border-2 border-lime-400">
    <div className="flex justify-center items-center mb-4">
      <div className="bg-lime-300/20 p-4 rounded-full">{icon}</div>
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{value.title[lang]}</h3>
    <p className="text-gray-300 leading-relaxed">{value.text[lang]}</p>
  </div>
);


const About: FC = () => {
  const { data, isLoading, isError } = useAboutData();

  if (isLoading) {
    return <div className="bg-[#003938] min-h-screen text-center py-20 text-white">Loading...</div>;
  }
  if (isError || !data) {
    return <div className="bg-[#003938] min-h-screen text-center py-20 text-red-400">Failed to load page data.</div>;
  }
  
  const { businessDescription, companyValues, faqs, contactInfo, privacyPolicy } = data;
  const valueIcons = [
      <BookOpen className="text-lime-300" size={28} />,
      <Users className="text-lime-300" size={28} />,
      <Lightbulb className="text-lime-300" size={28} />
  ];

  return (
    <div className="bg-[#003938]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-16 md:py-20 text-center">
        <h1 className="text-lime-400 text-sm font-bold uppercase tracking-widest">Tentang Kami</h1>
        <p className="font-serif mt-4 text-4xl sm:text-5xl font-bold text-white">
          {businessDescription?.id}
        </p>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-300 leading-relaxed">
          {businessDescription?.en}
        </p>
      </div>
      
      {/* REVISI: Tambahkan pengecekan `companyValues &&` */}
      {companyValues && companyValues.length > 0 && (
        <div className="border-t-2 border-lime-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-20">
              <div className="text-center mb-12">
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-lime-400">Nilai-nilai Kami</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {companyValues.map((value, index) => (
                      <ValueCard key={index} value={value} icon={valueIcons[index % valueIcons.length]} />
                  ))}
              </div>
          </div>
        </div>
      )}

      {/* REVISI: Tambahkan pengecekan `faqs &&` */}
      {faqs && faqs.length > 0 && (
        <div className="border-t-2 border-lime-400">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-4 py-20">
            <h2 className="font-serif text-3xl font-bold text-lime-400 text-center mb-12">
              Pertanyaan yang Sering Diajukan
            </h2>
            <div className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <Disclosure key={index} as="div" className="bg-[#004A49]/60 p-4 rounded-lg border-2 border-lime-400">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex justify-between w-full text-left text-lg font-medium text-white">
                        <span>{faq.q[lang]}</span>
                        <ChevronUp className={`${ open ? 'transform rotate-180' : '' } w-5 h-5 text-lime-400 transition-transform`} />
                      </Disclosure.Button>
                      <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 -translate-y-2" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-2">
                        <Disclosure.Panel className="pt-4 pb-2 text-base text-gray-300 leading-relaxed">
                          {faq.a[lang]}
                        </Disclosure.Panel>
                      </Transition>
                    </>
                  )}
                </Disclosure>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border-t-2 border-lime-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-4 py-20 text-center">
          <h2 className="font-serif text-3xl font-bold text-lime-400 mb-4">Hubungi Kami</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">Punya pertanyaan atau ingin bekerja sama? Jangan ragu untuk menghubungi kami.</p>
          <div className="flex justify-center gap-8">
            {contactInfo?.email && (
              <div>
                <h4 className="font-semibold text-white">Email</h4>
                <a href={`mailto:${contactInfo.email}`} className="flex items-center justify-center gap-2 mt-2 text-lime-400 hover:text-lime-300">
                  <Mail size={16} /> {contactInfo.email}
                </a>
              </div>
            )}
            {contactInfo?.phone && (
              <div>
                <h4 className="font-semibold text-white">Telepon</h4>
                <a href={`tel:${contactInfo.phone}`} className="flex items-center justify-center gap-2 mt-2 text-gray-300 hover:text-white">
                  <Phone size={16} /> {contactInfo.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REVISI: Tambahkan pengecekan `privacyPolicy &&` */}
      {privacyPolicy && (
        <div className="border-t-2 border-lime-400">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-4 py-20 text-center">
            <h2 className="font-serif text-3xl font-bold text-lime-400 mb-4">Kebijakan Privasi</h2>
            <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
              {privacyPolicy[lang]}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
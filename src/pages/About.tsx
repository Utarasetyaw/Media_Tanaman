import React, { Fragment } from 'react';
import type { FC } from 'react';
import { useOutletContext } from 'react-router-dom'; 
import { Disclosure, Transition } from '@headlessui/react';
import { BookOpen, Users, Lightbulb, ChevronUp, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { useAboutData } from '../hooks/useAboutData';
import type { CompanyValue } from '../hooks/useAboutData';
import { aboutTranslations } from '../assets/about.i18n';

interface ValueCardProps { value: CompanyValue; icon: React.ReactNode; lang: 'id' | 'en'; }
const ValueCard: FC<ValueCardProps> = ({ value, icon, lang }) => (
  <div className="p-6 text-center bg-[#004A49]/60 rounded-lg border-2 border-lime-400/80">
    <div className="flex justify-center items-center mb-4"><div className="bg-lime-300/20 p-4 rounded-full">{icon}</div></div>
    <h3 className="text-xl font-bold text-white mb-2">{value.title[lang]}</h3>
    <p className="text-gray-300 leading-relaxed">{value.description[lang]}</p>
  </div>
);

const About: FC = () => {
  const { lang: currentLang } = useOutletContext<{ lang: 'id' | 'en' }>();
  const { data, isLoading, isError } = useAboutData();

  const t = (key: keyof typeof aboutTranslations.id): string => {
    return aboutTranslations[currentLang]?.[key] || key;
  };
  
  if (isLoading) return <div className="bg-[#003938] min-h-screen text-center py-20 text-white">{t('loading')}</div>;
  if (isError || !data) return <div className="bg-[#003938] min-h-screen text-center py-20 text-red-400">{t('error')}</div>;
  
  const { name, logoUrl, businessDescription, companyValues, faqs, contactInfo, privacyPolicy } = data;
  const valueIcons = [<BookOpen className="text-lime-300" size={28} />, <Users className="text-lime-300" size={28} />, <Lightbulb className="text-lime-300" size={28} />];

  return (
    <div className="bg-[#003938]">
      {/* REVISI: Bagian Hero sekarang menampilkan Logo dan Nama Perusahaan */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
        {isLoading ? ( <div className="h-16 w-16 mx-auto bg-gray-700 rounded-full animate-pulse mb-4"></div> ) : (
            logoUrl && <img src={logoUrl} alt="Logo Perusahaan" className="h-20 w-auto mx-auto mb-6" />
        )}
        <h1 className="font-serif mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
          {isLoading ? <div className="h-12 w-3/4 mx-auto bg-gray-700 rounded animate-pulse"></div> : name}
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-300 leading-relaxed">
          {isLoading ? (
            <div className="space-y-2 mt-2"><div className="h-4 w-full bg-gray-700 rounded animate-pulse"></div><div className="h-4 w-5/6 mx-auto bg-gray-700 rounded animate-pulse"></div></div>
          ) : (
            businessDescription?.[currentLang]
          )}
        </p>
      </div>
      
      {companyValues && companyValues.length > 0 && (
        <div className="border-t-2 border-lime-400/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
              <div className="text-center mb-12"><h2 className="font-serif text-3xl sm:text-4xl font-bold text-lime-400">{t('our_values')}</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{companyValues.map((value, index) => (<ValueCard key={index} value={value} icon={valueIcons[index % valueIcons.length]} lang={currentLang} />))}</div>
          </div>
        </div>
      )}

      {faqs && faqs.length > 0 && (
        <div className="border-t-2 border-lime-400/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-lime-400 text-center mb-12">{t('faq_title')}</h2>
            <div className="w-full space-y-4">{faqs.map((faq, index) => (<Disclosure key={index} as="div" className="bg-[#004A49]/60 p-4 rounded-lg border-2 border-lime-400/80">{({ open }) => (<><Disclosure.Button className="flex justify-between w-full text-left text-lg font-medium text-white"><span>{faq.question[currentLang]}</span><ChevronUp className={`${ open ? 'transform rotate-180' : '' } w-5 h-5 text-lime-400 transition-transform`} /></Disclosure.Button><Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 -translate-y-2" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-2"><Disclosure.Panel className="pt-4 pb-2 text-base text-gray-300 leading-relaxed text-left">{faq.answer[currentLang]}</Disclosure.Panel></Transition></>)}</Disclosure>))}</div>
          </div>
        </div>
      )}

      {/* REVISI: Bagian Hubungi Kami sekarang menampilkan Alamat dan Media Sosial */}
      <div className="border-t-2 border-lime-400/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-lime-400 mb-4">{t('contact_title')}</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">{t('contact_subtitle')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-10">
            {contactInfo?.email && (<div><h4 className="font-semibold text-white flex items-center justify-center gap-2"><Mail size={16}/> {t('email')}</h4><a href={`mailto:${contactInfo.email}`} className="mt-2 text-lime-400 hover:text-lime-300">{contactInfo.email}</a></div>)}
            {contactInfo?.phone && (<div><h4 className="font-semibold text-white flex items-center justify-center gap-2"><Phone size={16}/> {t('phone')}</h4><span className="mt-2 text-gray-300">{contactInfo.phone}</span></div>)}
            {contactInfo?.address && (<div className="sm:col-span-1"><h4 className="font-semibold text-white flex items-center justify-center gap-2"><MapPin size={16}/> Alamat</h4><p className="mt-2 text-gray-300">{contactInfo.address}</p></div>)}
          </div>
          <div className="flex justify-center space-x-6">
              {contactInfo?.socialMedia?.instagram && ( <a href={contactInfo.socialMedia.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-300 hover:text-white transition-colors duration-300"><Instagram size={24} /></a> )}
              {contactInfo?.socialMedia?.facebook && ( <a href={contactInfo.socialMedia.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-300 hover:text-white transition-colors duration-300"><Facebook size={24} /></a> )}
              {contactInfo?.socialMedia?.twitter && ( <a href={contactInfo.socialMedia.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-300 hover:text-white transition-colors duration-300"><Twitter size={24} /></a> )}
          </div>
        </div>
      </div>

      {privacyPolicy && (privacyPolicy.id || privacyPolicy.en) && (
        <div className="border-t-2 border-lime-400/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-lime-400 mb-4">{t('privacy_policy_title')}</h2>
            <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto text-left">{privacyPolicy[currentLang]}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
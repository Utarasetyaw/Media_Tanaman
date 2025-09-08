import React, { Fragment } from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Disclosure, Transition } from '@headlessui/react';
import { BookOpen, Users, Lightbulb, ChevronUp, Mail, Phone } from 'lucide-react';

// --- Komponen untuk Kartu Nilai ---
interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const ValueCard: FC<ValueCardProps> = ({ icon, title, text }) => (
  // PERUBAHAN: Latar belakang kartu dan border disesuaikan
  <div className="p-6 text-center bg-[#004A49]/60 rounded-lg border-2 border-lime-400">
    <div className="flex justify-center items-center mb-4">
      {/* PERUBAHAN: Latar dan warna ikon disesuaikan */}
      <div className="bg-lime-300/20 p-4 rounded-full">
        {icon}
      </div>
    </div>
    {/* PERUBAHAN: Warna teks disesuaikan */}
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-300 leading-relaxed">{text}</p>
  </div>
);

// --- Komponen Utama Halaman About ---
const About: FC = () => {
  const { t } = useTranslation();
  const faqs = t('aboutPage.faqs', { returnObjects: true }) as { q: string, a: string }[];

  return (
    // PERUBAHAN: Latar belakang diubah ke hijau tua
    <div className="bg-[#003938]">

      {/* --- Hero Section --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-16 md:py-20 text-center">
        {/* PERUBAHAN: Warna teks disesuaikan */}
        <h1 className="text-lime-400 text-sm font-bold uppercase tracking-widest">{t('aboutPage.title')}</h1>
        <p className="font-serif mt-4 text-4xl sm:text-5xl font-bold text-white">
          {t('aboutPage.heading')}
        </p>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-300 leading-relaxed">
          {t('aboutPage.subheading')}
        </p>
      </div>
      
      {/* --- Our Values Section --- */}
      {/* PERUBAHAN: Border diubah ke lime */}
      <div className="border-t-2 border-lime-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-20">
            <div className="text-center mb-12">
                {/* PERUBAHAN: Warna dan font judul disesuaikan */}
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-lime-400">
                    {t('aboutPage.valuesTitle')}
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* PERUBAHAN: Warna ikon diubah ke lime */}
                <ValueCard icon={<BookOpen className="text-lime-300" size={28} />} title={t('aboutPage.value1Title')} text={t('aboutPage.value1Text')} />
                <ValueCard icon={<Users className="text-lime-300" size={28} />} title={t('aboutPage.value2Title')} text={t('aboutPage.value2Text')} />
                <ValueCard icon={<Lightbulb className="text-lime-300" size={28} />} title={t('aboutPage.value3Title')} text={t('aboutPage.value3Text')} />
            </div>
        </div>
      </div>

      {/* --- FAQ Section with Accordion --- */}
      <div className="border-t-2 border-lime-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-4 py-20">
          <h2 className="font-serif text-3xl font-bold text-lime-400 text-center mb-12">
            {t('aboutPage.faqTitle')}
          </h2>
          <div className="w-full space-y-4">
            {faqs.map((faq, index) => (
              // PERUBAHAN: Styling accordion disesuaikan untuk tema gelap
              <Disclosure key={index} as="div" className="bg-[#004A49]/60 p-4 rounded-lg border-2 border-lime-400">
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex justify-between w-full text-left text-lg font-medium text-white">
                      <span>{faq.q}</span>
                      <ChevronUp className={`${ open ? 'transform rotate-180' : '' } w-5 h-5 text-lime-400 transition-transform`} />
                    </Disclosure.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 -translate-y-2"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 -translate-y-2"
                    >
                      <Disclosure.Panel className="pt-4 pb-2 text-base text-gray-300 leading-relaxed">
                        {faq.a}
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
        </div>
      </div>

      {/* --- Contact Section --- */}
      <div className="border-t-2 border-lime-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-4 py-20 text-center">
          {/* PERUBAHAN: Warna dan font judul & teks disesuaikan */}
          <h2 className="font-serif text-3xl font-bold text-lime-400 mb-4">{t('aboutPage.contactTitle')}</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">{t('aboutPage.contactText')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-white">{t('aboutPage.contactGeneral')}</h4>
              <a href="mailto:info@portaltanaman.com" className="flex items-center justify-center gap-2 mt-2 text-lime-400 hover:text-lime-300">
                <Mail size={16} /> info@portaltanaman.com
              </a>
            </div>
            <div>
              <h4 className="font-semibold text-white">{t('aboutPage.contactSupport')}</h4>
              <a href="mailto:support@portaltanaman.com" className="flex items-center justify-center gap-2 mt-2 text-lime-400 hover:text-lime-300">
                <Mail size={16} /> support@portaltanaman.com
              </a>
              <a href="tel:+62212345678" className="flex items-center justify-center gap-2 mt-1 text-gray-300 hover:text-white">
                <Phone size={16} /> (021) 2345-678
              </a>
            </div>
            <div>
              <h4 className="font-semibold text-white">{t('aboutPage.contactPartnerships')}</h4>
              <a href="mailto:partner@portaltanaman.com" className="flex items-center justify-center gap-2 mt-2 text-lime-400 hover:text-lime-300">
                <Mail size={16} /> partner@portaltanaman.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* --- Privacy Section --- */}
      <div className="border-t-2 border-lime-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-4 py-20 text-center">
          <h2 className="font-serif text-3xl font-bold text-lime-400 mb-4">{t('aboutPage.privacyTitle')}</h2>
          <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
            {t('aboutPage.privacyText')}
          </p>
        </div>
      </div>

    </div>
  );
};

export default About;
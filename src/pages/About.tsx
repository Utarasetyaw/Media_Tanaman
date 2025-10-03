import React, { Fragment } from "react";
import type { FC } from "react";
import { useOutletContext } from "react-router-dom";
import { Disclosure, Transition } from "@headlessui/react";
import {
	BookOpen,
	Users,
	Lightbulb,
	ChevronUp,
	Mail,
	Phone,
	MapPin,
	Instagram,
	Facebook,
	Music,
} from "lucide-react";

import { useAboutData } from "../hooks/useAboutData";
import { aboutTranslations } from "../assets/about.i18n";
import SeoManager from "../components/SeoManager";

// ============================================================================
// KOMPONEN KARTU KECIL (Disederhanakan)
// ============================================================================

interface ValueCardProps {
	value: string; // Menerima string, bukan objek
	icon: React.ReactNode;
}

const ValueCard: FC<ValueCardProps> = ({ value, icon }) => (
	<div className="p-6 text-center bg-[#004A49]/60 rounded-lg border-2 border-lime-400/80 h-full flex flex-col justify-center items-center">
		<div className="bg-lime-300/20 p-4 rounded-full mb-4">{icon}</div>
		<h3 className="text-xl font-bold text-white">{value}</h3>
	</div>
);

// --- FUNGSI BANTU ---
const formatWhatsAppNumber = (phone: string): string => {
	let cleaned = phone.replace(/\D/g, "");
	if (cleaned.startsWith("0")) {
		cleaned = "62" + cleaned.substring(1);
	}
	return cleaned;
};

// ============================================================================
// KOMPONEN UTAMA (HALAMAN TENTANG KAMI)
// ============================================================================

const About: FC = () => {
	const { lang: currentLang } = useOutletContext<{ lang: "id" | "en" }>();
	const { data, isLoading, isError } = useAboutData();
	const t = (key: keyof typeof aboutTranslations.id): string =>
		aboutTranslations[currentLang]?.[key] || key;

	if (isLoading) {
		return (
			<div className="bg-[#003938] min-h-screen flex items-center justify-center text-white">
				{t("loading")}...
			</div>
		);
	}
	if (isError || !data) {
		return (
			<div className="bg-[#003938] min-h-screen flex items-center justify-center text-red-400">
				{t("error")}
			</div>
		);
	}

	const {
		name,
		logoUrl,
		businessDescription,
		companyValues,
		faqs,
		contactInfo,
		privacyPolicy,
	} = data;
	const valueIcons = [
		<BookOpen
			className="text-lime-300"
			size={28}
		/>,
		<Users
			className="text-lime-300"
			size={28}
		/>,
		<Lightbulb
			className="text-lime-300"
			size={28}
		/>,
	];
	const currentValues = companyValues?.[currentLang] || [];

	return (
		<>
			<SeoManager
				title={t("page_title")}
				description={businessDescription?.[currentLang]}
			/>
			<div className="bg-[#003938]">
				{/* Bagian Header */}
				<header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
					{logoUrl && (
						<img
							src={logoUrl}
							alt="Company Logo"
							className="h-20 w-auto mx-auto mb-6"
						/>
					)}
					<h1 className="font-serif mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
						{name}
					</h1>
					<p className="mt-6 max-w-3xl mx-auto text-lg text-gray-300 leading-relaxed">
						{businessDescription?.[currentLang]}
					</p>
				</header>

				{/* Bagian Nilai Perusahaan */}
				{currentValues.length > 0 && (
					<SectionWrapper>
						<div className="text-center mb-12">
							<h2 className="font-serif text-3xl sm:text-4xl font-bold text-lime-400">
								{t("our_values")}
							</h2>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{currentValues.map((value, index) => (
								<ValueCard
									key={index}
									value={value}
									icon={valueIcons[index % valueIcons.length]}
								/>
							))}
						</div>
					</SectionWrapper>
				)}

				{/* Bagian FAQ */}
				{faqs && faqs.length > 0 && (
					<SectionWrapper maxWidth="max-w-4xl">
						<h2 className="font-serif text-3xl sm:text-4xl font-bold text-lime-400 text-center mb-12">
							{t("faq_title")}
						</h2>
						<div className="w-full space-y-4">
							{faqs.map((faq, index) => (
								<Disclosure
									key={index}
									as="div"
									className="bg-[#004A49]/60 p-4 rounded-lg border-2 border-lime-400/80"
								>
									{({ open }) => (
										<>
											<Disclosure.Button className="flex justify-between w-full text-left text-lg font-medium text-white">
												<span>{faq.q[currentLang]}</span>
												<ChevronUp
													className={`${
														open ? "transform rotate-180" : ""
													} w-5 h-5 text-lime-400 transition-transform`}
												/>
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
												<Disclosure.Panel className="pt-4 pb-2 text-base text-gray-300 leading-relaxed text-left">
													{faq.a[currentLang]}
												</Disclosure.Panel>
											</Transition>
										</>
									)}
								</Disclosure>
							))}
						</div>
					</SectionWrapper>
				)}

				{/* Bagian Kontak */}
				<SectionWrapper
					maxWidth="max-w-4xl"
					className="text-center"
				>
					<h2 className="font-serif text-3xl sm:text-4xl font-bold text-lime-400 mb-4">
						{t("contact_title")}
					</h2>
					<p className="text-gray-300 mb-8 max-w-xl mx-auto">
						{t("contact_subtitle")}
					</p>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-10">
						{contactInfo?.email && (
							<div>
								<h4 className="font-semibold text-white flex items-center justify-center gap-2">
									<Mail size={16} /> {t("email")}
								</h4>
								<a
									href={`mailto:${contactInfo.email}`}
									className="mt-2 block text-lime-400 hover:text-lime-300 transition-colors"
								>
									{contactInfo.email}
								</a>
							</div>
						)}
						{contactInfo?.phone && (
							<div>
								<h4 className="font-semibold text-white flex items-center justify-center gap-2">
									<Phone size={16} /> {t("phone")}
								</h4>
								<a
									href={`https://wa.me/${formatWhatsAppNumber(
										contactInfo.phone
									)}`}
									target="_blank"
									rel="noopener noreferrer"
									className="mt-2 block text-lime-400 hover:text-lime-300 transition-colors"
								>
									{contactInfo.phone}
								</a>
							</div>
						)}
						{contactInfo?.address && (
							<div>
								<h4 className="font-semibold text-white flex items-center justify-center gap-2">
									<MapPin size={16} /> {t("address")}
								</h4>
								<p className="mt-2 text-gray-300">{contactInfo.address}</p>
							</div>
						)}
					</div>
					<div className="flex justify-center space-x-6">
						{contactInfo?.socialMedia?.instagram && (
							<SocialLink
								href={contactInfo.socialMedia.instagram}
								label="Instagram"
								icon={<Instagram size={24} />}
							/>
						)}
						{contactInfo?.socialMedia?.facebook && (
							<SocialLink
								href={contactInfo.socialMedia.facebook}
								label="Facebook"
								icon={<Facebook size={24} />}
							/>
						)}
						{contactInfo?.socialMedia?.tiktok && (
							<SocialLink
								href={contactInfo.socialMedia.tiktok}
								label="TikTok"
								icon={<Music size={24} />}
							/>
						)}
					</div>
				</SectionWrapper>

				{/* Bagian Kebijakan Privasi */}
				{privacyPolicy?.[currentLang] && (
					<SectionWrapper maxWidth="max-w-4xl">
						<h2 className="font-serif text-3xl sm:text-4xl font-bold text-lime-400 mb-4 text-center">
							{t("privacy_policy_title")}
						</h2>
						<p className="text-gray-300 leading-relaxed text-left">
							{privacyPolicy[currentLang]}
						</p>
					</SectionWrapper>
				)}
			</div>
		</>
	);
};

// --- KOMPONEN BANTUAN ---
const SectionWrapper: FC<{
	children: React.ReactNode;
	maxWidth?: string;
	className?: string;
}> = ({ children, maxWidth = "max-w-7xl", className = "" }) => (
	<div className="border-t-2 border-lime-400/50">
		<div
			className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 ${className}`}
		>
			{children}
		</div>
	</div>
);

// PERBAIKAN: Komponen SocialLink diubah untuk menampilkan ikon dan label
const SocialLink: FC<{
	href: string;
	label: string;
	icon: React.ReactNode;
}> = ({ href, label, icon }) => (
	<a
		href={href}
		target="_blank"
		rel="noopener noreferrer"
		aria-label={label}
		className="flex flex-col items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300"
	>
		{icon}
		<span className="text-xs font-medium">{label}</span>
	</a>
);

export default About;

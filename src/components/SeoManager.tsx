// src/components/SeoManager.tsx

import type { FC } from "react";
import { useOutletContext } from "react-router-dom";
import { useLayoutData } from "../hooks/useLayoutData"; // <-- Mengimpor hook

interface SeoProps {
	title?: string;
	description?: string;
	keywords?: string;
	imageUrl?: string;
}

const SeoManager: FC<SeoProps> = ({
	title,
	description,
	keywords,
	imageUrl,
}) => {
	// Memanggil hook untuk mendapatkan data layout
	const { data: layoutData, isLoading } = useLayoutData();
	const { lang } = useOutletContext<{ lang: "id" | "en" }>();

	if (isLoading || !layoutData) {
		return null;
	}

	// Mengakses data 'settings' dari layoutData
	const { settings } = layoutData;
	// Mengakses data 'seo' dari settings
	const seoData = settings?.seo;
	const siteName = settings?.name || "Narapati Flora";
	const apiBaseUrl =
		import.meta.env.VITE_API_BASE_URL || "https://backend.narapatiflora.com";

	// Menggunakan semua data yang diakses untuk menentukan nilai final
	const finalTitle = title
		? `${title} | ${siteName}`
		: seoData?.metaTitle?.[lang] || siteName;
	const finalDescription =
		description || seoData?.metaDescription?.[lang] || "";
	const finalKeywords = keywords || seoData?.metaKeywords || "";
	const finalImageUrl =
		imageUrl ||
		(seoData?.ogDefaultImageUrl
			? `${apiBaseUrl}${seoData.ogDefaultImageUrl}`
			: "");

	return (
		<>
			<title>{finalTitle}</title>
			<meta
				name="description"
				content={finalDescription}
			/>
			<meta
				name="keywords"
				content={finalKeywords}
			/>
			{seoData?.googleSiteVerificationId && (
				<meta
					name="google-site-verification"
					content={seoData.googleSiteVerificationId}
				/>
			)}
			<meta
				property="og:title"
				content={finalTitle}
			/>
			<meta
				property="og:description"
				content={finalDescription}
			/>
			<meta
				property="og:type"
				content="website"
			/>
			<meta
				property="og:site_name"
				content={siteName}
			/>
			{finalImageUrl && (
				<meta
					property="og:image"
					content={finalImageUrl}
				/>
			)}
			<meta
				name="twitter:card"
				content="summary_large_image"
			/>
			{seoData?.twitterSite && (
				<meta
					name="twitter:site"
					content={seoData.twitterSite}
				/>
			)}
			<meta
				name="twitter:title"
				content={finalTitle}
			/>
			<meta
				name="twitter:description"
				content={finalDescription}
			/>
			{finalImageUrl && (
				<meta
					name="twitter:image"
					content={finalImageUrl}
				/>
			)}
		</>
	);
};

export default SeoManager;

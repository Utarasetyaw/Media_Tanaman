import type { FC } from "react";
import { Fragment, useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
	Calendar,
	MapPin,
	ChevronDown,
	ListFilter,
	Sprout,
	Eye,
	ThumbsUp,
} from "lucide-react";
import { Menu, Transition } from "@headlessui/react";

import { useHomePage } from "../hooks/useHomePage";
import { useLayoutData } from "../hooks/useLayoutData";
import type { Article } from "../types/article";
import type {
	Event,
	Plant,
	BannerImage,
	LocalizedString,
	Category,
} from "../types/home";
import { homeTranslations } from "../assets/home.i18n";

// Impor komponen yang relevan
import SeoManager from "../components/SeoManager"; // <-- Tambahkan impor ini
import VerticalAd from "../components/VerticalAd";
import HorizontalAd from "../components/HorizontalAd";
import BannerAd from "../components/BannerAd";

// =================================================================
// --- SUB-KOMPONEN SKELETON ---
// =================================================================
const HeroBannerSkeleton: FC = () => (
	<div className="w-full rounded-lg shadow-xl bg-gray-700/50 aspect-[3/1] animate-pulse" />
);
const ArticleCardSkeleton: FC = () => (
	<div className="bg-[#004A49]/60 border-2 border-lime-400/50 rounded-lg shadow-lg overflow-hidden flex flex-col h-full animate-pulse">
		<div className="aspect-video bg-gray-700/50" />
		<div className="p-4 sm:p-6 flex flex-col flex-grow">
			<div className="flex-grow">
				<div className="h-4 w-1/3 bg-gray-700/50 rounded-full mb-3" />
				<div className="h-6 w-full bg-gray-700/50 rounded mb-2" />
				<div className="h-5 w-3/4 bg-gray-700/50 rounded" />
				<div className="space-y-2 mt-4">
					<div className="h-4 w-full bg-gray-700/50 rounded" />
					<div className="h-4 w-5/6 bg-gray-700/50 rounded" />
				</div>
			</div>
			<div className="mt-auto pt-4 border-t border-lime-400/30">
				<div className="h-10 w-full bg-lime-300/50 rounded-lg" />
			</div>
		</div>
	</div>
);
const MostViewedSkeleton: FC = () => (
	<section>
		<div className="aspect-video bg-gray-700/50 rounded-lg shadow-md animate-pulse" />
		<div className="h-4 w-1/4 bg-gray-700/50 rounded-full mt-4" />
		<div className="h-10 w-full bg-gray-700/50 rounded my-3" />
		<div className="h-8 w-3/4 bg-gray-700/50 rounded" />
		<div className="h-10 w-1/3 bg-lime-300/50 rounded-lg mt-4" />
	</section>
);
const TopHeadlinesSkeleton: FC = () => (
	<div className="flex flex-col">
		<div className="h-8 w-full bg-gray-700/50 rounded animate-pulse my-3 py-3 border-b-2 border-lime-400/50" />
		<div className="h-8 w-5/6 bg-gray-700/50 rounded animate-pulse my-3 py-3 border-b-2 border-lime-400/50" />
		<div className="h-8 w-full bg-gray-700/50 rounded animate-pulse my-3 py-3 border-b-2 border-lime-400/50" />
		<div className="h-8 w-4/5 bg-gray-700/50 rounded animate-pulse my-3 py-3 border-b-2 border-lime-400/50" />
		<div className="h-8 w-full bg-gray-700/50 rounded animate-pulse my-3 py-3 border-b-2 border-lime-400/50" />
	</div>
);

// =================================================================
// --- SUB-KOMPONEN UTAMA (TETAP DALAM SATU FILE) ---
// =================================================================

const SidebarLink: FC<{
	article: { id: number; title: LocalizedString };
	lang: "id" | "en";
}> = ({ article, lang }) => (
	<Link
		to={`/articles/${article.id}`}
		className="font-serif font-semibold text-gray-200 py-3 border-b-2 border-lime-400/50 block transition-colors duration-200 hover:text-lime-400"
	>
		{article.title[lang]}
	</Link>
);

const HeroBanner: FC<{ banners: BannerImage[] }> = ({ banners }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	useEffect(() => {
		if (!banners || banners.length <= 1) return;
		const timer = setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
		}, 5000);
		return () => clearInterval(timer);
	}, [banners]);

	if (!banners || banners.length === 0) {
		return (
			<div className="w-full rounded-lg shadow-xl bg-gray-800 aspect-[3/1]"></div>
		);
	}

	return (
		<div className="w-full rounded-lg shadow-xl overflow-hidden relative aspect-[3/1]">
			{banners.map((banner, index) => (
				<img
					key={index}
					src={banner.imageUrl || ""}
					alt={`Banner ${index + 1}`}
					className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
						index === currentIndex ? "opacity-100" : "opacity-0"
					}`}
				/>
			))}
		</div>
	);
};

const CustomDropdown: FC<{
	options: { value: string | number; label: string }[];
	selectedValue: string | number;
	onSelect: (value: string) => void;
	placeholder: string;
	icon?: React.ReactNode;
}> = ({ options, selectedValue, onSelect, placeholder, icon }) => {
	const safeOptions = options || [];
	const selectedLabel =
		safeOptions.find((opt) => opt.value.toString() === selectedValue.toString())
			?.label || placeholder;

	return (
		<Menu
			as="div"
			className="relative inline-block text-left w-full"
		>
			<Menu.Button className="inline-flex w-full justify-between items-center rounded-lg bg-[#003938] border border-lime-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-lime-400">
				<div className="flex items-center overflow-hidden">
					{icon && (
						<span className="mr-2 opacity-80 flex-shrink-0">{icon}</span>
					)}
					<span className="truncate">{selectedLabel}</span>
				</div>
				<ChevronDown className="ml-2 -mr-1 h-5 w-5 flex-shrink-0" />
			</Menu.Button>
			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<Menu.Items className="absolute left-0 mt-2 w-full origin-top-right rounded-md bg-[#003938] border-2 border-lime-400/50 shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
					<div className="px-1 py-1 max-h-60 overflow-y-auto">
						<Menu.Item>
							{({ active }) => (
								<button
									type="button"
									onClick={() => onSelect("all")}
									className={`${
										active ? "bg-[#004A49] text-white" : "text-gray-300"
									} group flex w-full items-center rounded-md px-3 py-2 text-sm`}
								>
									{placeholder}
								</button>
							)}
						</Menu.Item>
						{safeOptions.map((option) => (
							<Menu.Item key={option.value}>
								{({ active }) => (
									<button
										type="button"
										onClick={() => onSelect(String(option.value))}
										className={`${
											active ? "bg-[#004A49] text-white" : "text-gray-300"
										} group flex w-full items-center rounded-md px-3 py-2 text-sm`}
									>
										{option.label}
									</button>
								)}
							</Menu.Item>
						))}
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	);
};

const CategoryFilters: FC<{
	categories: Category[];
	plantTypes: Category[];
	onFilterChange: (
		newFilters: Partial<{
			categoryId?: number | string;
			plantTypeId?: number | string;
		}>
	) => void;
	lang: "id" | "en";
	t: (key: keyof typeof homeTranslations.id) => string;
	filters: { categoryId?: number | string; plantTypeId?: number | string };
}> = ({ categories, plantTypes, onFilterChange, lang, t, filters }) => {
	if (!categories || !plantTypes) {
		return (
			<div className="my-8 h-[118px] md:h-[59px] bg-[#004A49]/60 rounded-lg animate-pulse"></div>
		);
	}
	return (
		<div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg bg-[#004A49]/60 border-2 border-lime-400/50 p-3">
			<div className="w-full">
				<CustomDropdown
					placeholder={t("all_categories")}
					selectedValue={filters.categoryId || "all"}
					onSelect={(val) => onFilterChange({ categoryId: val })}
					options={categories.map((cat) => ({
						value: cat.id,
						label: cat.name[lang],
					}))}
					icon={<ListFilter size={16} />}
				/>
			</div>
			<div className="w-full">
				<CustomDropdown
					placeholder={t("all_plant_types")}
					selectedValue={filters.plantTypeId || "all"}
					onSelect={(val) => onFilterChange({ plantTypeId: val })}
					options={plantTypes.map((pt) => ({
						value: pt.id,
						label: pt.name[lang],
					}))}
					icon={<Sprout size={16} />}
				/>
			</div>
		</div>
	);
};

const FeaturedEventCard: FC<{
	event: Event;
	lang: "id" | "en";
	badgeText: string;
	buttonText: string;
}> = ({ event, lang, badgeText, buttonText }) => {
	if (!event) return null;
	const formattedDate = new Date(event.startDate).toLocaleDateString(lang, {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
	return (
		<div className="bg-[#004A49]/60 border-2 border-lime-400 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
			<div className="w-full md:w-1/2 aspect-video bg-black/20">
				<img
					src={event.imageUrl || ""}
					alt={event.title[lang]}
					className="w-full h-full object-cover"
				/>
			</div>
			<div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
				<div>
					<p className="inline-block bg-lime-200 text-lime-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
						{badgeText}
					</p>
					<h3 className="font-serif text-2xl lg:text-3xl font-bold text-white mb-4">
						{event.title[lang]}
					</h3>
					<div className="space-y-3 text-gray-300 mb-6">
						<p className="flex items-center gap-3">
							<Calendar
								size={20}
								className="text-lime-400 flex-shrink-0"
							/>
							<span>{formattedDate}</span>
						</p>
						<p className="flex items-center gap-3">
							<MapPin
								size={20}
								className="text-lime-400 flex-shrink-0"
							/>
							<span>{event.location}</span>
						</p>
					</div>
					<Link
						to={`/events/${event.id}`}
						className="inline-block bg-lime-300 text-lime-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-400 transition-colors"
					>
						{buttonText}
					</Link>
				</div>
			</div>
		</div>
	);
};

const FeaturedPlant: FC<{
	plant: Plant;
	lang: "id" | "en";
	t: (key: keyof typeof homeTranslations.id) => string;
}> = ({ plant, lang, t }) => (
	<div className="bg-[#004A49]/60 border-2 border-lime-400/80 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
		<div className="w-full md:w-1/2 aspect-video bg-black/20">
			<img
				src={plant.imageUrl || ""}
				alt={plant.name[lang]}
				className="w-full h-full object-cover"
			/>
		</div>
		<div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
			<div>
				<h3 className="font-sans text-lime-400 font-bold uppercase text-sm tracking-wider">
					{t("plant_of_the_week")}
				</h3>
				<h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-100 my-2">
					{plant.name[lang]}
				</h2>
				<p className="font-sans text-gray-300 leading-relaxed line-clamp-4">
					{plant.description[lang]}
				</p>
				<div className="mt-6">
					<Link
						to={`/plants/${plant.id}`}
						className="font-sans inline-block bg-lime-300 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-lime-400 transition-colors"
					>
						{t("view_plant_detail_button")}
					</Link>
				</div>
			</div>
		</div>
	</div>
);

const ArticleCard: FC<{ article: Article; lang: "id" | "en" }> = ({
	article,
	lang,
}) => {
	if (!article) return null;
	const categoryName = article.category?.name[lang] || "Uncategorized";
	const titleText = article.title[lang];
	const excerptText = article.excerpt[lang];
	const formattedDate = new Date(article.createdAt).toLocaleDateString(lang, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	return (
		<div className="bg-[#004A49]/60 border-2 border-lime-400/50 rounded-lg shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-lime-400/20 hover:-translate-y-1 flex flex-col h-full">
			<Link to={`/articles/${article.id}`}>
				<div className="aspect-video bg-black/20">
					<img
						src={article.imageUrl || ""}
						alt={titleText}
						className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				</div>
			</Link>
			<div className="p-4 sm:p-6 flex flex-col flex-grow">
				<div className="flex-grow">
					<span className="inline-block bg-lime-200 text-lime-800 text-xs font-semibold px-2 py-1 rounded-full mb-2">
						{categoryName}
					</span>
					<Link to={`/articles/${article.id}`}>
						<h3 className="text-lg sm:text-xl font-bold text-gray-100 mb-2 group-hover:text-lime-400 transition-colors line-clamp-2">
							{titleText}
						</h3>
					</Link>
					<p className="text-gray-300 text-sm line-clamp-3 mb-4">
						{excerptText}
					</p>
					<div className="flex items-center space-x-4 text-sm text-gray-400">
						<div className="flex items-center gap-2">
							<Calendar size={16} />
							<span>{formattedDate}</span>
						</div>
						<div className="flex items-center gap-2">
							<Eye size={16} />
							<span className="font-semibold text-white">
								{article.viewCount ?? 0}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<ThumbsUp size={16} />
							<span className="font-semibold text-white">
								{article._count?.likes ?? 0}
							</span>
						</div>
					</div>
				</div>
				<div className="mt-auto pt-4 border-t border-lime-400/30">
					<Link
						to={`/articles/${article.id}`}
						className="inline-block w-full text-center bg-lime-300 text-lime-900 font-bold px-4 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm"
					>
						Lihat Detail
					</Link>
				</div>
			</div>
		</div>
	);
};

// =================================================================
// --- KOMPONEN UTAMA HOMEPAGE ---
// =================================================================

const Home: FC = () => {
	const {
		data: layoutData,
		isLoading: isLoadingLayout,
		isError: isErrorLayout,
	} = useLayoutData();
	const { lang: currentLang } = useOutletContext<{ lang: "id" | "en" }>();
	const t = (key: keyof typeof homeTranslations.id): string =>
		homeTranslations[currentLang]?.[key] || key;
	const {
		staticData,
		isLoadingStatic,
		isLoadingFiltered,
		isError: isErrorHome,
		filters,
		handleFilterChange,
		moreForYouChunks,
		allArticlesLoaded,
		isScrollButtonVisible,
		scrollToTop,
	} = useHomePage();

	if (isErrorHome || isErrorLayout) {
		return (
			<div className="h-screen w-full flex items-center justify-center bg-[#003938] text-red-400">
				{t("error")}
			</div>
		);
	}

	const categories = layoutData?.categories || [];
	const plantTypes = layoutData?.plantTypes || [];
	const {
		mostViewedArticle,
		latestArticles,
		topHeadlines,
		runningEvents,
		plants,
		bannerImages,
	} = staticData || {};

	return (
		<>
			{/* PERBAIKAN: Menambahkan SeoManager untuk mengelola meta tags */}
			<SeoManager />

			<div className="relative w-full bg-[#003938]">
				<VerticalAd position="left" />
				<VerticalAd position="right" />
				<div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-60">
					<div className="pt-8">
						{isLoadingStatic || !bannerImages ? (
							<HeroBannerSkeleton />
						) : (
							<HeroBanner banners={bannerImages} />
						)}
						<CategoryFilters
							categories={categories}
							plantTypes={plantTypes}
							onFilterChange={handleFilterChange}
							lang={currentLang}
							t={t}
							filters={filters}
						/>
					</div>
					<HorizontalAd />
					<div className="py-8">
						<div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-8">
							<main className="lg:col-span-2">
								{isLoadingStatic || !mostViewedArticle ? (
									<MostViewedSkeleton />
								) : (
									<section>
										<div className="aspect-video bg-black/20 rounded-lg shadow-md overflow-hidden">
											<img
												src={mostViewedArticle.imageUrl || ""}
												alt={mostViewedArticle.title[currentLang]}
												className="w-full h-full object-cover"
											/>
										</div>
										<div className="flex justify-between items-center mt-4">
											<div className="font-sans text-lime-400 font-bold uppercase text-sm tracking-wider">
												{mostViewedArticle.category.name[currentLang]}
											</div>
											<div className="flex items-center space-x-4 text-sm text-gray-400">
												<div className="flex items-center gap-2">
													<Eye size={16} />
													<span className="font-semibold text-white">
														{mostViewedArticle.viewCount ?? 0}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<ThumbsUp size={16} />
													<span className="font-semibold text-white">
														{mostViewedArticle._count?.likes ?? 0}
													</span>
												</div>
											</div>
										</div>
										<h2>
											<Link
												to={`/articles/${mostViewedArticle.id}`}
												className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-100 my-2 block hover:text-lime-400 transition-colors"
											>
												{mostViewedArticle.title[currentLang]}
											</Link>
										</h2>
										<p className="font-sans text-base sm:text-lg text-gray-300 leading-relaxed line-clamp-3">
											{mostViewedArticle.excerpt[currentLang]}
										</p>
										<div className="mt-4">
											<Link
												to={`/articles/${mostViewedArticle.id}`}
												className="font-sans inline-block bg-lime-300 text-gray-900 font-bold px-6 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm"
											>
												{t("view_news_button")}
											</Link>
										</div>
									</section>
								)}
								<hr className="my-10 border-t-2 border-lime-400/50" />
								<section>
									<h2 className="font-serif text-2xl font-bold text-gray-100 mb-6">
										{t("latest_news")}
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
										{isLoadingStatic || !latestArticles ? (
											<>
												<ArticleCardSkeleton />
												<ArticleCardSkeleton />
											</>
										) : (
											latestArticles.map((article) => (
												<ArticleCard
													key={article.id}
													article={article}
													lang={currentLang}
												/>
											))
										)}
									</div>
								</section>
							</main>
							<aside className="mt-12 lg:mt-0 lg:pl-8 lg:border-l-2 lg:border-lime-400/50">
								<h3 className="font-serif text-lg font-bold uppercase text-lime-400 border-b-2 border-lime-400/50 pb-2 mb-6">
									{t("top_headlines")}
								</h3>
								{isLoadingStatic || !topHeadlines ? (
									<TopHeadlinesSkeleton />
								) : (
									<div className="flex flex-col">
										{topHeadlines.map((article) => (
											<SidebarLink
												key={article.id}
												article={article}
												lang={currentLang}
											/>
										))}
									</div>
								)}
								<div className="mt-6 flex flex-col gap-3">
									<BannerAd />
									<div className="hidden lg:flex flex-col gap-3">
										<BannerAd />
										<BannerAd />
									</div>
								</div>
							</aside>
						</div>
					</div>
					<section className="mt-12 pt-8 border-t-2 border-lime-400/50">
						<div className="pb-2">
							<h2 className="font-serif text-2xl sm:text-3xl font-bold text-lime-400 text-center mb-8">
								{t("more_for_you")}
							</h2>
							{isLoadingFiltered || isLoadingLayout ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
									{[...Array(4)].map((_, i) => (
										<ArticleCardSkeleton key={i} />
									))}
								</div>
							) : moreForYouChunks.length > 0 ? (
								<div className="flex flex-col">
									{moreForYouChunks.map((chunk, index) => (
										<Fragment key={`chunk-${index}`}>
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
												{chunk.map((article: Article) => (
													<ArticleCard
														key={article.id}
														article={article}
														lang={currentLang}
													/>
												))}
											</div>
											{index === 0 &&
												runningEvents &&
												runningEvents.length > 0 && (
													<section className="py-12">
														<div className="max-w-6xl mx-auto">
															<FeaturedEventCard
																event={runningEvents[0]}
																lang={currentLang}
																badgeText={t("running_event_badge")}
																buttonText={t("view_event_button")}
															/>
														</div>
													</section>
												)}
											{index === 1 && plants && plants.length > 0 && (
												<section className="py-12">
													<div className="max-w-6xl mx-auto">
														<FeaturedPlant
															plant={plants[0]}
															lang={currentLang}
															t={t}
														/>
													</div>
												</section>
											)}
											{index < moreForYouChunks.length - 1 && (
												<div className="my-8">
													<HorizontalAd />
												</div>
											)}
										</Fragment>
									))}
								</div>
							) : (
								allArticlesLoaded && (
									<p className="text-center text-gray-400 p-8">
										{t("no_articles_found")}
									</p>
								)
							)}
						</div>
					</section>
					<div>
						<hr className="my-10 border-t-2 border-lime-400/50" />
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8">
							<Link
								to="/articles"
								className="font-sans w-full sm:w-auto text-center bg-lime-300 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-lime-400 transition-colors text-lg"
							>
								{t("more_news_button")}
							</Link>
							{isScrollButtonVisible && (
								<button
									onClick={scrollToTop}
									className="font-sans w-full sm:w-auto bg-gray-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors text-lg shadow-md"
									aria-label="Kembali ke atas"
								>
									{t("back_to_top_button")}
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Home;

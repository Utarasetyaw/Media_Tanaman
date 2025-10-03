// src/pages/Articles.tsx

import type { FC } from "react";
import { Fragment } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
// ▼▼▼ Menambahkan 'ThumbsUp' dan menghapus 'Heart' ▼▼▼
import {
	ListFilter,
	Sprout,
	ChevronDown,
	Calendar,
	Eye,
	Search,
	RotateCw,
	ArrowDownUp,
	ThumbsUp,
} from "lucide-react";
import { useLayoutData } from "../hooks/useLayoutData";
import { useArticlesPage } from "../hooks/useArticlesPage";
import { articlePageTranslations } from "../assets/page_artikel.i18n";
import VerticalAd from "../components/VerticalAd";
import HorizontalAd from "../components/HorizontalAd";
import type { Article } from "../types/page_artikel.types";

//================================================================================
// KOMPONEN: ArticleCard (Dengan gaya baru)
//================================================================================
interface ArticleCardProps {
	article: Article;
	lang: "id" | "en";
	t: (key: any) => string;
}

const ArticleCard: FC<ArticleCardProps> = ({ article, lang, t }) => {
	if (!article) return null;

	const categoryName = article.category?.name[lang] || "Uncategorized";
	const titleText = article.title[lang];
	const excerptText = article.excerpt[lang];

	// Mengubah format bulan menjadi singkat ('short')
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
						src={article.imageUrl}
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
					{/* ▼▼▼ Bagian Statistik Diperbarui Agar Sama Dengan Halaman Detail ▼▼▼ */}
					<div className="flex items-center space-x-4 text-sm text-gray-400">
						<div className="flex items-center gap-2">
							<Calendar size={16} />
							<span>{formattedDate}</span>
						</div>
						<div className="flex items-center gap-2">
							<Eye size={16} />
							<span className="font-semibold text-white">
								{article.viewCount}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<ThumbsUp size={16} />
							<span className="font-semibold text-white">
								{article.likeCount}
							</span>
						</div>
					</div>
				</div>
				<div className="mt-auto pt-4 border-t border-lime-400/30">
					<Link
						to={`/articles/${article.id}`}
						className="inline-block w-full text-center bg-lime-300 text-lime-900 font-bold px-4 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm"
					>
						{t("view_detail")}
					</Link>
				</div>
			</div>
		</div>
	);
};

//================================================================================
// KOMPONEN: CustomDropdown (Tidak ada perubahan)
//================================================================================
interface CustomDropdownProps {
	options: { value: string | number; label: string }[];
	selectedValue: string | number;
	onSelect: (value: any) => void;
	placeholder: string;
	icon?: React.ReactNode;
}

const CustomDropdown: FC<CustomDropdownProps> = ({
	options,
	selectedValue,
	onSelect,
	placeholder,
	icon,
}) => {
	const selectedLabel =
		options.find((opt) => opt.value.toString() === selectedValue.toString())
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
						{options.map((option) => (
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

//================================================================================
// KOMPONEN UTAMA: ArticlesPage (Tidak ada perubahan logika)
//================================================================================
const ArticlesPage: FC = () => {
	const { lang: currentLang } = useOutletContext<{ lang: "id" | "en" }>();
	const t = (key: keyof typeof articlePageTranslations.id) =>
		articlePageTranslations[currentLang]?.[key] || key;
	const { data: layoutData } = useLayoutData();
	const {
		page,
		setPage,
		filters,
		sortBy,
		searchTerm,
		articles,
		pagination,
		isLoading,
		isError,
		isFetching,
		handleFilterChange,
		handleSortChange,
		handleSearchChange,
		handleReset,
	} = useArticlesPage();

	const sortOptions = [
		{ value: "newest", label: t("sort_newest") },
		{ value: "oldest", label: t("sort_oldest") },
		{ value: "popular", label: t("sort_popular") },
	];

	const renderContent = () => {
		if (isLoading)
			return (
				<p className="text-center text-gray-300 py-16">
					{t("loading_articles")}
				</p>
			);
		if (isError)
			return (
				<p className="text-center text-red-400 py-16">{t("error_articles")}</p>
			);
		if (articles.length === 0) {
			const isSearching = searchTerm.trim() !== "";
			return (
				<div className="text-center text-gray-400 py-16">
					<h3 className="text-2xl font-semibold mb-2 text-white">
						{isSearching
							? t("no_search_results_title")
							: t("no_articles_title")}
					</h3>
					<p>
						{isSearching ? t("no_search_results_desc") : t("no_articles_desc")}
					</p>
				</div>
			);
		}

		return (
			<>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
					{articles.map((article: Article) => (
						<ArticleCard
							key={article.id}
							article={article}
							lang={currentLang}
							t={t}
						/>
					))}
				</div>
				<div className="flex justify-center items-center gap-4 mt-12">
					<button
						onClick={() => setPage((old) => Math.max(old - 1, 1))}
						disabled={page === 1 || isFetching}
						className="px-4 py-2 bg-lime-400 text-gray-900 font-bold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
					>
						{t("previous_button")}
					</button>
					<span className="text-white font-medium">
						{t("page_info")
							.replace("{currentPage}", String(pagination?.currentPage))
							.replace("{totalPages}", String(pagination?.totalPages))}
					</span>
					<button
						onClick={() =>
							setPage((old) =>
								pagination && old < pagination.totalPages ? old + 1 : old
							)
						}
						disabled={
							!pagination || page === pagination.totalPages || isFetching
						}
						className="px-4 py-2 bg-lime-400 text-gray-900 font-bold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
					>
						{t("next_button")}
					</button>
				</div>
				{isFetching && (
					<span className="block text-center text-sm text-gray-400 mt-2">
						{t("fetching")}
					</span>
				)}
			</>
		);
	};

	return (
		<div className="relative w-full bg-[#003938] min-h-screen">
			<VerticalAd position="left" />
			<VerticalAd position="right" />
			<div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-60 py-12 sm:py-16">
				<div className="text-center mb-12">
					<h2 className="font-serif text-4xl sm:text-5xl font-bold text-lime-400 mb-4">
						{t("title")}
					</h2>
					<p className="text-lg text-gray-300 max-w-2xl mx-auto">
						{t("description")}
					</p>
				</div>
				<div className="mb-12 p-4 bg-[#004A49]/60 border-2 border-lime-400/50 rounded-lg space-y-4">
					<div className="relative">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
							size={20}
						/>
						<input
							type="search"
							placeholder={t("search_placeholder")}
							value={searchTerm}
							onChange={handleSearchChange}
							className="w-full bg-[#003938] border border-lime-500 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-lime-400 focus:outline-none"
						/>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<CustomDropdown
							placeholder={t("all_categories")}
							selectedValue={filters.categoryId}
							onSelect={(val) => handleFilterChange("categoryId", val)}
							options={
								layoutData?.categories.map((cat) => ({
									value: cat.id,
									label: cat.name[currentLang],
								})) || []
							}
							icon={<ListFilter size={16} />}
						/>
						<CustomDropdown
							placeholder={t("all_plants")}
							selectedValue={filters.plantTypeId}
							onSelect={(val) => handleFilterChange("plantTypeId", val)}
							options={
								layoutData?.plantTypes.map((pt) => ({
									value: pt.id,
									label: pt.name[currentLang],
								})) || []
							}
							icon={<Sprout size={16} />}
						/>
						<CustomDropdown
							placeholder={t("sort_by")}
							selectedValue={sortBy}
							onSelect={handleSortChange}
							options={sortOptions}
							icon={<ArrowDownUp size={16} />}
						/>
						<button
							onClick={handleReset}
							className="flex items-center justify-center gap-2 w-full rounded-lg bg-red-600/80 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
						>
							<RotateCw size={16} />
							{t("reset_filters_button")}
						</button>
					</div>
				</div>
				<div className="mb-12">
					<HorizontalAd />
				</div>
				{renderContent()}
			</div>
		</div>
	);
};

export default ArticlesPage;

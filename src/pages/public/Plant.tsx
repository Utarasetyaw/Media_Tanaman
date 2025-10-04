import type { FC } from "react";
import { Fragment } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Sprout, ChevronDown } from "lucide-react";
import { Menu, Transition } from "@headlessui/react";

// Impor hooks, types, dan komponen
import { useLayoutData } from "../../hooks/useLayoutData";
// ▼▼▼ PERUBAHAN DI SINI: Impor disatukan ▼▼▼
import type { Plant, Category } from "../../types/public/plant.types";
import { usePlantsPage } from "../../hooks/public/usePlantsPage";
import { plantsTranslations } from "../../assets/plants.i18n";
import { cardTranslations } from "../../assets/card.i18n";
import SeoManager from "../../components/SeoManager";
import VerticalAd from "../../components/VerticalAd";
import HorizontalAd from "../../components/HorizontalAd";

// =================================================================
// --- SUB-KOMPONEN ---
// =================================================================

const PlantCard: FC<{ plant: Plant; lang: "id" | "en" }> = ({
    plant,
    lang,
}) => {
    const t = (key: keyof typeof cardTranslations.id): string =>
        cardTranslations[lang]?.[key] || key;

    return (
        <div className="border-2 border-lime-400/50 bg-[#004A49]/60 rounded-lg shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:shadow-lime-400/20 hover:-translate-y-1">
            <Link
                to={`/plants/${plant.id}`}
                className="block group overflow-hidden"
            >
                <div className="aspect-video bg-black/20">
                    <img
                        src={plant.imageUrl}
                        alt={plant.name[lang]}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </Link>
            <div className="p-3 sm:p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-gray-100 line-clamp-2">
                        <Link
                            to={`/plants/${plant.id}`}
                            className="hover:text-lime-400 transition-colors"
                        >
                            {plant.name[lang]}
                        </Link>
                    </h3>
                    <p className="mt-2 text-sm text-gray-300 line-clamp-3">
                        {plant.description[lang]}
                    </p>
                </div>
                <div className="mt-auto pt-4 border-t border-lime-400/30">
                    <Link
                        to={`/plants/${plant.id}`}
                        className="font-sans inline-block w-full text-center bg-lime-300 text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm"
                    >
                        {t("view_detail")}
                    </Link>
                </div>
            </div>
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

// =================================================================
// --- KOMPONEN UTAMA: PlantPage ---
// =================================================================

const PlantPage: FC = () => {
    const { lang: currentLang } = useOutletContext<{ lang: "id" | "en" }>();
    const t = (key: keyof typeof plantsTranslations.id) =>
        plantsTranslations[currentLang]?.[key] || key;

    const { data: layoutData } = useLayoutData();
    const {
        page,
        setPage,
        filters,
        handleFilterChange,
        plants,
        pagination,
        isLoading,
        isError,
        isFetching,
    } = usePlantsPage();

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="border-2 border-lime-400/50 bg-[#004A49]/60 rounded-lg shadow-sm overflow-hidden animate-pulse"
                        >
                            <div className="aspect-video bg-gray-700/50" />
                            <div className="p-4">
                                <div className="h-6 w-3/4 bg-gray-700/50 rounded mb-2" />
                                <div className="h-4 w-1/2 bg-gray-700/50 rounded" />
                                <div className="h-10 w-full bg-lime-300/50 rounded-lg mt-4" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        if (isError)
            return (
                <p className="text-center text-red-400 py-16">{t("error_plants")}</p>
            );
        if (plants.length === 0) {
            return (
                <div className="text-center text-gray-400 py-16">
                    <h3 className="text-2xl font-semibold mb-2 text-white">
                        {t("no_plants_title")}
                    </h3>
                    <p>{t("no_plants_desc")}</p>
                </div>
            );
        }
        return (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    {plants.map((plant) => (
                        <PlantCard
                            key={plant.id}
                            plant={plant}
                            lang={currentLang}
                        />
                    ))}
                </div>
                <div className="flex justify-center items-center gap-4 mt-12">
                    <button
                        onClick={() => setPage((old) => Math.max(old - 1, 1))}
                        disabled={page === 1 || isFetching}
                        className="px-4 py-2 bg-lime-400 text-gray-900 font-bold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {t("previous_button")}
                    </button>
                    <span className="text-white font-medium">
                        {pagination
                            ? t("page_info")
                                    .replace("{currentPage}", String(pagination.currentPage))
                                    .replace("{totalPages}", String(pagination.totalPages))
                            : ""}
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
                        className="px-4 py-2 bg-lime-400 text-gray-900 font-bold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
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
        <>
            <SeoManager
                title={t("title")}
                description={t("description")}
            />
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

                    <div className="mb-12 p-3 bg-[#004A49]/60 border-2 border-lime-400/50 rounded-lg">
                        <CustomDropdown
                            placeholder={t("all_plant_types")}
                            selectedValue={filters.plantTypeId}
                            onSelect={(val) => handleFilterChange("plantTypeId", val)}
                            options={
                                (layoutData?.plantTypes as Category[])?.map((pt) => ({
                                    value: pt.id,
                                    label: pt.name[currentLang],
                                })) || []
                            }
                            icon={<Sprout size={16} />}
                        />
                    </div>

                    <div className="mb-12">
                        <HorizontalAd />
                    </div>
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

export default PlantPage;
import type { FC } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
    ArrowLeft,
    Sprout,
    ExternalLink,
    ShoppingBag,
} from "lucide-react";
import { usePlantDetail } from "../../hooks/public/usePlantDetail";
import { plantDetailTranslations } from "../../assets/plantDetail.i18n";
import SeoManager from "../../components/SeoManager";
import VerticalAd from "../../components/VerticalAd";
import HorizontalAd from "../../components/HorizontalAd";
import api from "../../services/apiService"; // <-- Impor instance API

const PlantDetail: FC = () => {
    const { lang: currentLang } = useOutletContext<{ lang: "id" | "en" }>();
    const t = (key: keyof typeof plantDetailTranslations.id) =>
        plantDetailTranslations[currentLang]?.[key] || key;

    const { plant, isLoading, isError } = usePlantDetail();

    // ▼▼▼ FUNGSI BARU UNTUK MENANGANI KLIK TOKO ▼▼▼
    const handleStoreClick = async (storeId: number, storeUrl: string) => {
        try {
            // Langkah 1: Kirim permintaan ke backend untuk melacak klik.
            // Kita tidak perlu menunggu responsnya selesai sepenuhnya.
            api.get(`/plants/track/store/${storeId}`);
        } catch (error) {
            console.error("Gagal melacak klik:", error);
        }
        
        // Langkah 2: Langsung buka URL toko di tab baru.
        window.open(storeUrl, '_blank', 'noopener,noreferrer');
    };

    if (isLoading) {
        return (
            <div className="text-center py-20 bg-[#003938] min-h-screen text-white">
                <h2 className="text-2xl font-bold">{t("loading")}</h2>
            </div>
        );
    }

    if (isError || !plant) {
        return (
            <div className="text-center py-20 bg-[#003938] min-h-screen text-white">
                <h2 className="text-2xl font-bold">{t("error_title")}</h2>
                <Link
                    to="/plants"
                    className="text-lime-400 mt-4 inline-block hover:underline"
                >
                    {t("back_link")}
                </Link>
            </div>
        );
    }
    
    const onlineStores = plant.stores || [];

    return (
        <>
            <SeoManager
                title={plant.name[currentLang]}
                description={plant.description[currentLang]}
                imageUrl={plant.imageUrl}
            />
            <div className="relative w-full bg-[#003938] min-h-screen">
                <VerticalAd position="left" />
                <VerticalAd position="right" />
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-60 py-12 sm:py-16">
                    <Link
                        to="/plants"
                        className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:underline mb-8"
                    >
                        <ArrowLeft size={20} />
                        {t("back_link")}
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                        <div className="lg:sticky lg:top-24 h-fit">
                            <div className="aspect-video bg-black/20 rounded-2xl shadow-lg overflow-hidden border-2 border-lime-400/80">
                                <img
                                    src={plant.imageUrl}
                                    alt={plant.name[currentLang]}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                                {plant.name[currentLang]}
                            </h1>
                            <p className="text-xl text-gray-400 italic mt-2 mb-6">
                                {plant.scientificName}
                            </p>

                            <div className="grid grid-cols-1 gap-4 text-center mb-8 bg-[#004A49]/60 p-4 rounded-lg border-2 border-lime-400/50">
                                <div>
                                    <Sprout className="mx-auto text-lime-400 mb-1" />
                                    <h4 className="font-bold text-xs sm:text-sm text-gray-200">
                                        {t("family")}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-300">
                                        {plant.plantType.name[currentLang]}
                                    </p>
                                </div>
                            </div>

                            <h2 className="font-serif text-2xl font-bold text-lime-400 mb-4">
                                {t("description")}
                            </h2>
                            <div
                                className="prose prose-invert max-w-none text-gray-300 leading-relaxed mb-10 text-justify"
                                dangerouslySetInnerHTML={{
                                    __html: plant.description[currentLang].replace(/\n/g, '<br />'),
                                }}
                            />

                            <h2 className="font-serif text-2xl font-bold text-lime-400 mb-4">
                                {t("where_to_buy")}
                            </h2>
                            <div className="space-y-6">
                                {onlineStores.length > 0 ? (
                                    <div>
                                        <h3 className="flex items-center gap-2 font-semibold text-gray-200 mb-3">
                                            <ShoppingBag
                                                size={18}
                                                className="text-lime-400"
                                            />
                                            {t("online_stores")}
                                        </h3>
                                        <div className="space-y-3">
                                            {onlineStores.map((store) => (
                                                // ▼▼▼ UBAH 'a' MENJADI 'button' DAN GUNAKAN 'onClick' ▼▼▼
                                                <button
                                                    key={store.id}
                                                    onClick={() => handleStoreClick(store.id, store.url)}
                                                    className="w-full flex items-center justify-between bg-[#004A49]/60 p-4 rounded-lg border-2 border-lime-400/50 hover:border-lime-500 hover:bg-[#004A49]/90 transition-all text-left"
                                                >
                                                    <span className="font-semibold text-gray-200">
                                                        {store.name}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-lime-400">
                                                        <span className="text-sm font-medium">
                                                            {t("visit_store")}
                                                        </span>
                                                        <ExternalLink size={16} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">
                                        {t("no_stores_available")}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-16">
                        <HorizontalAd />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlantDetail;
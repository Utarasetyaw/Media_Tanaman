import type { FC } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ArrowLeft, User, Calendar, ThumbsUp, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useArticleDetail } from "../../hooks/public/useArticleDetail";
// ▼▼▼ PERUBAHAN DI SINI ▼▼▼
import type { Article } from "../../types/public/articleDetail.types";
import { articleDetailPageTranslations } from "../../assets/page_artikeldetail.i18n";
import VerticalAd from "../../components/VerticalAd";
import HorizontalAd from "../../components/HorizontalAd";


//================================================================================
// KOMPONEN ArticleCard
//================================================================================
interface ArticleCardProps {
    article: Article;
    lang: "id" | "en";
    t: (key: "view_detail") => string;
}

const ArticleCard: FC<ArticleCardProps> = ({ article, lang, t }) => {
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
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2"><Calendar size={16} /><span>{formattedDate}</span></div>
                        <div className="flex items-center gap-2"><Eye size={16} /><span className="font-semibold text-white">{article.viewCount}</span></div>
                        <div className="flex items-center gap-2"><ThumbsUp size={16} /><span className="font-semibold text-white">{article.likeCount}</span></div>
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
// KOMPONEN UTAMA: ArticleDetail
//================================================================================
const ArticleDetail: FC = () => {
    const { lang: currentLang } = useOutletContext<{ lang: "id" | "en" }>();

    const t = (key: keyof typeof articleDetailPageTranslations.id): string => {
        return articleDetailPageTranslations[currentLang]?.[key] || key;
    };

    const { article, relatedArticles, isLoading, isError } = useArticleDetail();

    if (isLoading) {
        return (
            <div className="text-center py-20 bg-[#003938] min-h-screen text-white">
                <h2 className="text-2xl font-bold">{t("loading")}</h2>
            </div>
        );
    }

    if (isError || !article) {
        return (
            <div className="text-center py-20 bg-[#003938] min-h-screen text-white">
                <h2 className="text-2xl font-bold">{t("error_title")}</h2>
                <Link
                    to="/articles"
                    className="text-lime-400 mt-4 inline-block hover:underline"
                >
                    {t("back_link")}
                </Link>
            </div>
        );
    }

    return (
        <div className="relative w-full bg-[#003938] text-white min-h-screen">
            <VerticalAd position="left" />
            <VerticalAd position="right" />
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-60 py-12 sm:py-16">
                <Link
                    to="/articles"
                    className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:underline mb-8"
                >
                    <ArrowLeft size={20} />
                    {t("back_link")}
                </Link>
                <article>
                    <span className="inline-block bg-lime-200 text-lime-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                        {article.category.name[currentLang]}
                    </span>
                    <h1 className="font-serif text-3xl md:text-5xl font-bold text-gray-100 mb-4 leading-tight">
                        {article.title[currentLang]}
                    </h1>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-gray-400 text-sm mb-8">
                        <div className="flex items-center gap-2">
                            <User size={16} />
                            <span>
                                {t("by")} {article.author.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>
                                {t("published_on")}{" "}
                                {new Date(article.createdAt).toLocaleDateString(currentLang, {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                    <div className="aspect-video bg-black/20 rounded-2xl shadow-lg mb-8 overflow-hidden">
                        <img
                            src={article.imageUrl}
                            alt={article.title[currentLang]}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="prose prose-lg prose-invert max-w-none text-gray-300 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {article.content[currentLang]}
                        </ReactMarkdown>
                    </div>
                </article>
                <div className="my-16">
                    <HorizontalAd />
                </div>
                {relatedArticles && relatedArticles.length > 0 && (
                    <section className="border-t-2 border-lime-400/30 pt-12">
                        <h2 className="text-3xl font-bold text-lime-400 text-center mb-8">
                            {t("related_articles")}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedArticles.map((related) => (
                                <ArticleCard
                                    key={related.id}
                                    article={related}
                                    lang={currentLang}
                                    t={t}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ArticleDetail;
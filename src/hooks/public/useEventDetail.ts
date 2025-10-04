import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../services/apiService";
// ▼▼▼ Gunakan tipe dari file baru ▼▼▼
import type { Event } from "../../types/public/eventDetail.types";

const fetchEventById = async (id: string): Promise<Event> => {
    const { data } = await api.get(`/events/${id}`);
    return data;
};

const trackEventClick = (eventId: string): Promise<void> => {
    return api.post(`/events/${eventId}/track-click`);
};

export const useEventDetail = () => {
    const { id } = useParams<{ id: string }>();

    const {
        data: event,
        isLoading,
        isError,
    } = useQuery<Event, Error>({
        queryKey: ["event", id],
        queryFn: () => fetchEventById(id!),
        enabled: !!id,
    });

    const trackClickMutation = useMutation({
        mutationFn: trackEventClick,
        onError: (error) => {
            console.error("Gagal melacak klik:", error);
        },
    });

    const handleExternalLinkClick = () => {
        if (event?.externalUrl) {
            // Lacak klik tanpa menunggu hasilnya (fire and forget)
            trackClickMutation.mutate(event.id.toString());
            // Buka link di tab baru
            window.open(event.externalUrl, "_blank", "noopener,noreferrer");
        }
    };

    return {
        event,
        isLoading,
        isError,
        handleExternalLinkClick,
    };
};